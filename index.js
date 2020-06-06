const env = require('dotenv');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Discord = require('discord.js');
const moment = require('moment');

env.config();

const parseNames = (rows) => {
  console.log("Parsing names", rows.length);
  let names = [];
  for(var i = 0; i < rows.length; i++) {
    const {
      ["Stream Name"]: name,
      ["Custom Reaction"]: reaction,
    } = rows[i];
    names.push({
      name: name.toLowerCase(),
      reaction: reaction.toLowerCase(),
    });
  }
  return names;
};

const getSheet = (doc) => {
  console.log("Getting worksheet");
  let sheet;
  for(var i = 0; i < doc.sheetCount; i++) {
    const s = doc.sheetsByIndex[i];
    if(s.title === process.env.GOOGLE_WORKSHEET_NAME) {
      sheet = s;
    }
  }
  return sheet;
}

const parseSheet = async (doc) => {
  const sheet = getSheet(doc);
  const rows = await sheet.getRows();
  return parseNames(rows);
}

const getSource = (message, sources) => sources.find(({name}) => message.toLowerCase().includes(name));

const openSheet = async () => {
  console.log("Opening sheet");
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth({
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  });
  await doc.loadInfo();
  return doc;
}

const main = async () => {
  const client = new Discord.Client();
  const doc = await openSheet();
  let lastUpdate = moment().unix();
  let sources = [];

  client.once('ready', async () => {
    console.log('Reactibot is ready');

    sources = await parseSheet(doc);
  });

  client.on('message', async (message) => {
    if(message.channel.name === "link-publishing") {
      console.log("Incoming message");

      const updateTime = moment(lastUpdate).add(1, "minute");
      const needsToUpdate = updateTime.isSameOrAfter();

      if(needsToUpdate) {
        sources = await parseSheet(doc);
      }

      const source = getSource(message.content, sources);

      if(source) {
        console.log("Adding reactions");
        Promise.all([
          message.react("🎖"),
          message.react(source.reaction),
        ]).catch(() => console.error("Emojis failed to react."));
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
};

main().catch((e) => console.error(e));
