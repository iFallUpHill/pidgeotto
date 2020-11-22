const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fetch = require('node-fetch');
const CronJob = require('cron').CronJob;

const Discord = require('discord.js');
const client = new Discord.Client();

let timeLastRan = Date.now();
let resultsSent = 0;

const listMonitorDeals = async () => {
  const response = await fetch('https://www.reddit.com/r/buildapcsales/new.json?limit=50');
  const json = await response.json();
  const lastRanAsSeconds = Math.floor(timeLastRan / 1000);
  const channel = client.channels.cache.find(channel => channel.name === 'bapcsales-monitors');

  for (const { data } of json.data.children) {
    if (data.created_utc > lastRanAsSeconds && data.title.toLowerCase().startsWith("[monitor]")) {
      resultsSent++;
      const embed = new Discord.MessageEmbed()
        .setAuthor(data.domain, '', data.url)
        .setTitle('Reddit Link')
        .setURL(`https://reddit.com${data.permalink}`)
        .setDescription(data.title.replace(/\[\bmonitor\b\] ?/mi,''))
        .setThumbnail(['self', 'default', 'nsfw'].indexOf(data.thumbnail) !== -1 ? 'https://www.redditstatic.com/new-icon.png' : data.thumbnail)
      channel.send(embed)
    }
  }

  timeLastRan = Date.now();
  console.log(`[${new Date(timeLastRan).toUTCString()}] Send ${resultsSent} listing${resultsSent === 1 ? '' : 's'}.`);
  resultsSent = 0;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  listMonitorDeals();

  const monitorDealsJob = new CronJob('0 */1 * * * *', () => {
    listMonitorDeals();
  });

  monitorDealsJob.start();
});

client.on('warn', console.warn);
client.on('error', console.error);
client.login(process.env.DISCORD_TOKEN);
