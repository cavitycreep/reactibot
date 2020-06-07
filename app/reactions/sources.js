const moment = require('moment');
const Spreadsheet = require("./spreadsheet");


module.exports = class Sources {
    constructor() {
      this.spreadsheet = new Spreadsheet(process.env.GOOGLE_SHEET_ID)
      this.updatedAt = moment().unix();
      this.data = [];
    }

    async Load() {
      await this.spreadsheet.Load();
      await this.Update(true);
    }

    async Update(force = false) {
      const timeToUpdate = moment(this.updatedAt).add(1, "minute");
      const needsToUpdate = moment().isAfter(timeToUpdate);

      if(needsToUpdate || force) {
        const sheet = await this.spreadsheet.GetTab(process.env.GOOGLE_WORKSHEET_NAME);
        const rows = await sheet.getRows();
        const names = [];

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

        this.updatedAt = moment().unix();
        this.data = names;
      }
    }

    async Get(content) {
      await this.Update();
      const source = this.data.find(({name}) => {
        const lowerContent = content.toLowerCase();
        const contentWithSpaces = lowerContent.startsWith(name);
        const contentWithoutSpaces = lowerContent.startsWith(name.replace(" ", ""));
        return contentWithSpaces || contentWithoutSpaces;
      });
      source.React = async (message) => {
        Promise.all([
          message.react("🎖"),
          message.react(source.reaction),
        ]);
      };
      return source;
    }
  }
