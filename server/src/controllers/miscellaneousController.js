const airtable_mail = require("./miscellaneous/airtable_mail.js");
const sms = require("./miscellaneous/sms.js");
import { updateAirtableContenus } from "../workflows/miscellaneaous/updateAirtableContenus";

module.exports = function (app) {
  app.post("/set_mail", airtable_mail.set_mail);
  app.post("/send_sms", sms.send_sms);
  app.post("/updateAirtableContenus", updateAirtableContenus);
};
