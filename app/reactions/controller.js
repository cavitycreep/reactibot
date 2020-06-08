const Log = require("../utils/log");
const Sources = require("./sources");
const { EMOJI_MEDAL } = require("../utils/constants");


module.exports = class ReactionsController {
  constructor(...channels) {
    this.channels = channels;
    this.sources = new Sources();
    this.log = new Log("ReactionsController");
  }

  async HandleReady() {
    await this.sources.Load();
    this.log.Info("Ready");
  }

  async HandleMessage(message) {
    if(this.channels.includes(message.channel.id)) {
      const id = message.id.substring(message.id.length - 5);
      this.log.Info(`Incoming message "${id}"`);
      const source = await this.sources.Get(message.content);
      if(source) {
        this.log.Info(`Adding reactions to "${id}"`);
        await source.React(message);
      }
    }
  }

  async HandlePast(client) {
    this.log.Info("Adding reactions to past messages");
    const channels = client.channels.cache.filter((c) => this.channels.includes(c.id)).array();
    const messages = [];
    let m = 0;

    for(var c = 0; c < channels.length; c++) {
      const channel = channels[c];
      const result = await channel.messages.fetch({ limit: 100 });
      messages.push(...result.values());
    }

    for(var i = 0; i < messages.length; i++) {
      const message = messages[i];
      const source = await this.sources.Get(message.content);
      if(source) {
        const reactions = message.reactions.cache.filter((reaction) => (
          reaction.emoji.name === EMOJI_MEDAL || reaction.emoji.name === source.reaction
        ));

        if(reactions.array().length < 2) {
          await source.React(message);
          m++;
        }
      }
    }

    this.log.Info(`Added reactions to ${m} messages`);
  }
}
