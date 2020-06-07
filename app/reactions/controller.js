const Log = require("../utils/log");
const Sources = require("./sources");


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
    if(this.channels.includes(message.channel.name)) {
      const id = message.id.substring(message.id.length - 5);
      this.log.Info(`Incoming message "${id}"`);
      const source = await this.sources.Get(message.content);
      if(source) {
        this.log.Info(`Adding reactions to "${id}"`);
        await source.React(message);
      }
    }
  }
}
