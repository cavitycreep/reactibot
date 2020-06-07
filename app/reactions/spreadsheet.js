const { GoogleSpreadsheet } = require('google-spreadsheet');


module.exports = class Spreadsheet {
  constructor(sheetId) {
    this.document = new GoogleSpreadsheet(sheetId);
  }

  async Load() {
    await this.document.useServiceAccountAuth({
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    });
    await this.document.loadInfo();
  }

  async GetTab(name) {
    let sheet;
    for(var i = 0; i < this.document.sheetCount; i++) {
      const s = this.document.sheetsByIndex[i];
      if(s.title === name) {
        sheet = s;
      }
    }
    return sheet;
  }
}
