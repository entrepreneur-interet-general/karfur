const airtable_mail = require('./miscellaneous/airtable_mail.js');
const sms = require('./miscellaneous/sms.js');
const google_map = require('./miscellaneous/google_map.js');

module.exports = function (app) {
  app.post('/set_mail',airtable_mail.set_mail);
  app.post('/send_sms', sms.send_sms);
  app.post('/get_map', google_map.get_map);
}