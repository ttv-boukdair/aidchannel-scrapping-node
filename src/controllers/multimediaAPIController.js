const axios = require("axios");
const https = require('https');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var youtubesearchapi=require('youtube-search-api');
var twitter = require('twitter-api-v2');
var TwitterApi = twitter.TwitterApi ; 
const  googleIt = require('google-it');
const ytch = require('yt-channel-info')
var Youtube = require("../models/youtube");
var Organization = require("../models/organization");
const googleNews = require('google-news-rss-to-js');
const { put } = require("../routes/InitDBRoute");

async function getVideos(url){

    const idTypes = ['channel','user','c']
    const query = url;
    
    const query_split =query.split("/")
    let idType = query_split[query_split.length-2]
    const id = query_split[query_split.length-1]
    if(idType ==idTypes[0]){idType=1}
    if(idType ==idTypes[1]){idType=2}
    if(idType ==idTypes[2]){idType=3}
    if(! idTypes.includes(idType)){idType=0}
    var one_vid
    var result = []
    const yt_base = "https://www.youtube.com/watch?v="
    console.log(query+' || '+idType+' || '+id)
    var resp = await ytch.getChannelVideos(id,'newest', idType)
    for(let i=0; i<resp.items.length; i++){
      if(i==10) break;
      let channel_url=query
      let channel_name = resp.items[i].author
      let video_url = yt_base + resp.items[i].videoId
      let title = resp.items[i].title
      let thumbnail = resp.items[i].videoThumbnails.pop().url
      let published = resp.items[i].publishedText
      let video_length = resp.items[i].durationText
      let view_count = resp.items[i].viewCount
      one_vid = {
        channel_url:channel_url,
        channel_name:channel_name,
        video_url:video_url,
        title:title,
        thumbnail:thumbnail,
        published:published,
        video_length:video_length,
        view_count:view_count,
        
      }
      result.push(one_vid)
    }
return result

  
}



   exports.getYTVideos = async (req, res, next) => {
    const org_id = req.query.id;
    const org = await Youtube.find({organization:org_id}).populate({ path: "country", model: "Country" }).populate({ path: "organization", model: "Organization" })
  
     res.status(200).json(org);}

exports.addYTVideos = async (req, res, next) => {
  const org_id = req.query.id;
  const org = await Organization.findOne({_id:org_id})
  const yt_channel = org.youtube_url
  const country = org.country
  // ADD Remove existing videos of the org YT channel before adding the new ones
  const videos = await getVideos(yt_channel)
  let yt
  for(let i=0; i<videos.length; i++){
    let vid_exist = vid_exists(videos[i])
      if(vid_exist){console.log("skipped"); continue; }
  yt = new Youtube({
    channel_url:videos[i].channel_url,
        channel_name: videos[i].channel_name,
        video_url: videos[i].video_url,
        title: videos[i].title,
        thumbnail: videos[i].thumbnail,
        published: videos[i].published,
        video_length:videos[i].video_length,
        view_count: videos[i].view_count,
  
    organization: org_id,
    country:country,
  })
yt.save()
console.log(yt)
}
console.log(del_vidz)
   res.status(200).json(videos);}


async function localAddYT(id) {
    const org_id = id;
    const org = await Organization.findOne({_id:org_id})
    const yt_channel = org.youtube_url
    const country = org.country
    // ADD Remove existing videos of the org YT channel before adding the new ones
    const videos = await getVideos(yt_channel)
    let yt
    for(let i=0; i<videos.length; i++){
      let vid_exist = await vid_exists(videos[i])
      if(vid_exist){console.log("skipped"); break }
    yt = new Youtube({
      channel_url:videos[i].channel_url,
          channel_name: videos[i].channel_name,
          video_url: videos[i].video_url,
          title: videos[i].title,
          thumbnail: videos[i].thumbnail,
          published: videos[i].published,
          video_length:videos[i].video_length,
          view_count: videos[i].view_count,
    
      organization: org_id,
      country:country,
    })
  yt.save()
  console.log(yt)
  }
     return videos;}

async function vid_exists(vid){

  const vidz = await Youtube.find({ video_url:vid.video_url})
  if(vidz){
  if(vidz.length){
    return true
  }}
  return false
}


exports.putYTVideos = async (req, res, next) => {
  const orgs = await Organization.find({youtube_url:{$nin:[null]}})
  var id
  var yt_url
  var result
  for(let i=0;i<orgs.length; i++){
    id = orgs[i]._id
    yt_url =orgs[i].youtube_url
    result = await localAddYT(id)
    console.log(result)
  }
  //  res.status(200).json(result);

}



exports.putTweets = async (req, res, next) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });
  var result = await instance.post(process.env.PYSCRAP);
   console.log(result);

}



