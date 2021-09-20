const puppeteer = require('puppeteer');
const News = require('../models/news');
const Organization = require('../models/organization');
const Country = require('../models/country');
const NewsBreakdown = require('../models/newsBreakdown');



exports.interrupted = async(req, res, next) => {
    const is_inter = await NewsBreakdown.find({})
    return is_inter[0].interrupted
}

async function forwardUrl(googleNews_url) {

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(googleNews_url, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.m2L3rb > a'), a => a.href);
    });
    await browser.close();
    return hrefs
}

async function getNews(organizationId, organizationName, countryId) {
    var url = "https://news.google.com/search?q=" + organizationName + "%20when%3A30d";
    console.log(url);
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: 'networkidle2' });
    let newsUrls = await page.evaluate((organizationId, countryId) => {
        var urls = document.querySelectorAll('div[class = "NiLAwe y6IFtc R7GTQ keNKEd j7vNaf nID9nc"] > a');
        if (urls == null) {
            return null;
        }
        var dates = document.querySelectorAll('time[class = "WW6dff uQIVzc Sksgp"]');
        var titles = document.querySelectorAll('h3[class = "ipQwMb ekueJc RD0gLb"] > a')
        let articles = [];
        for (var i = 0; i < urls.length; i++) {
            if (i == 3) break; // 3 articles per organization
            try {
                var articleUrl = urls[i].href;
                var date = dates[i].getAttribute('datetime');
                var title = titles[i].innerText
            } catch (error) {
                // empty div
                continue
            }
            articles.push({
                "article_url": articleUrl,
                "organization": organizationId,
                "country": countryId,
                "title": title,
                "posted_at": date
            })
        }
        return articles
    }, organizationId, countryId);
    await browser.close();
    // forward google news urls to target urls

    for (var i = 0; i < newsUrls.length; i++) {
        var targetUrl = await forwardUrl(newsUrls[i].article_url);
        newsUrls[i].article_url = targetUrl[0];
    }
    return newsUrls
}

async function getSubOrgsInfo() {
    var subOrganizations = await Organization.find({head_office_id:{$nin:[null]}});
    var infos = []
    for (let i = 0; i < subOrganizations.length; i++) {
        var info = {
            "orgId": subOrganizations[i]._id,
            "orgName": subOrganizations[i].name,
            "countryId": subOrganizations[i].country,
        }
        infos.push(info)
    }
    return infos
}


async function saveOrgArticles(orgInfo) {
    // search Organization Articles and save each article
    const articles = await getNews(orgInfo.orgId, orgInfo.orgName, orgInfo.countryId);
    if (articles.length == 0) {
        return null;
    }

    for (let i = 0; i < articles.length; i++) {
        var article = new News({
            article_url: articles[i].article_url,
            article_title: articles[i].title,
            organization: articles[i].organization,
            country: articles[i].country,
            posted_at: articles[i].posted_at
        });

        article.save();
    };

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


exports.addOrgArticles = async(req, res, next) => {
    const subOrgInfos = await getSubOrgsInfo();

    var offsetVal = await NewsBreakdown.find({});
    var offset = offsetVal[0].offset;
    var errorIndex = offset;
    try {
        for (let i = offset; i < subOrgInfos.length; i++) {
            errorIndex++;
            try {
                await saveOrgArticles(subOrgInfos[i]);

                await sleep(60000);
            } catch (error) {

                await NewsBreakdown.updateOne({ "_id": "61015409cc93eb146c668f6d" }, { $set: { interrupted: true, error_description: error, organization: subOrgInfos[i], offset: i } })
                return null;
            }
            await NewsBreakdown.updateOne({ "_id": "61015409cc93eb146c668f6d" }, { $set: { interrupted: true, error_description: "", organization: {}, offset: i } });

        }

        await NewsBreakdown.updateOne({ "_id": "61015409cc93eb146c668f6d" }, { $set: { interrupted: false, error_description: "", organization: {}, offset: 0 } });

        // res.status(200).json("ok");
    } catch (error) {
        console.error(error);
        await NewsBreakdown.updateOne({ "_id": "61015409cc93eb146c668f6d" }, { $set: { interrupted: true, error_description: error, organization: {}, offset: errorIndex } });
        // res.status(404).json(error);

    }
}

