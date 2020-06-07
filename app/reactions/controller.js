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
      this.log.Info(`Incoming message "${message.id.substring(0, 5)}"`);
      const source = await this.sources.Get(message.content);
      if(source) {
        this.log.Info(`Adding reactions to "${message.id.substring(0, 5)}"`);
        await source.React(message);
      }
    }
  }
}
