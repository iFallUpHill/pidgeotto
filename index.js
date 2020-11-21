require('dotenv').config()

const fetch = require('node-fetch');

const Discord = require('discord.js');
const client = new Discord.Client();

// let timeLastRan = Date.now();
let timeLastRan = Date.now()- 1000000000;
let resultsSent = 0;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  if (msg.content === 'new') {
    const response = await fetch('https://www.reddit.com/r/buildapcsales/new.json?limit=50');
    const json = await response.json();

    for (const { data } of json.data.children) {
      if (data.created_utc * 1000 > timeLastRan && data.title.toLowerCase().startsWith("[monitor]")) {
        resultsSent++;
        const embed = new Discord.MessageEmbed()
          .setAuthor(data.domain, '', data.url)
          .setTitle('Reddit Link')
          .setURL(`https://reddit.com${data.permalink}`)
          .setDescription(data.title.replace(/\[\bmonitor\b\] ?/mi,''))
          .setThumbnail(['self', 'default', 'nsfw'].indexOf(data.thumbnail) !== -1 ? 'https://www.redditstatic.com/new-icon.png' : data.thumbnail)
        msg.reply(embed);
      }
    }

    timeLastRan = Date.now();
    console.log(`[${new Date(timeLastRan).toUTCString()}] Send ${resultsSent} listing${resultsSent === 1 ? '' : 's'}.`);
    resultsSent = 0;
  }
});

client.on('warn', console.warn);
client.on('error', console.error);
client.login(process.env.DISCORD_TOKEN);
