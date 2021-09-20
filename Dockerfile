# stage1 as builder
FROM node:14

WORKDIR /
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN apt-get update -y
RUN apt-get install -y google-chrome-stable
RUN apt install -y unzip
# RUN apt-get install -y chromium-chromedriver
# RUN apt-get install -y chromium-browser
RUN wget  http://chromedriver.storage.googleapis.com/92.0.4515.107/chromedriver_linux64.zip
RUN unzip ./chromedriver_linux64.zip
RUN chmod +x ./chromedriver
RUN mv chromedriver /usr/bin
COPY package.json package-lock.json ./
RUN npm install
#RUN mkdir /src
COPY . .
#RUN mkdir public

EXPOSE 80

CMD ["npm", "run", "prod"]