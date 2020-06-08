const env = require('dotenv');
const express = require('express');
const Discord = require('discord.js');

const ReactionsController = require('./reactions/controller');

env.config();

const main = () => {
  const reactions = new ReactionsController("link-publishing", "links-with-embeds");
  const client = new Discord.Client();
  const app = express();

  client.once('ready', async () => {
    try {
      await reactions.HandleReady();
    } catch(e) {
      console.error(e);
    }
  });

  client.on('message', async (message) => {
    try {
      await reactions.HandleMessage(message);
    } catch(e) {
      console.error(e);
    }
  });

  client.login(process.env.DISCORD_TOKEN);

  reactions.HandlePast(client);

  app.listen(process.env.PORT || 8080);
};

main();
