const env = require('dotenv');
const express = require('express');
const Discord = require('discord.js');

const ReactionsController = require('./reactions/controller');

env.config();

const main = () => {
  const reactions = new ReactionsController("716423272954331248", "718550044109963345");
  const client = new Discord.Client();
  const app = express();

  client.once('ready', async () => {
    try {
      await reactions.HandleReady();
      reactions.HandlePast(client);
    } catch(e) {
      console.error(e.message);
    }
  });

  client.on('message', async (message) => {
    try {
      reactions.HandleMessage(message);
    } catch(e) {
      console.error(e.message);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
  app.listen(process.env.PORT || 8080);
};

main();
