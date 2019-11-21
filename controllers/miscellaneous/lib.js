var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.airtableApiKey}).base(process.env.airtableBase);
const DBEvent = require('../../schema/schemaDBEvent.js');
const _ = require('lodash');

function set_mail(req, res) {
  if (!req.body.mail) {
    res.status(400).json({ "text": "Requête invalide" })
  } else {
    new DBEvent({action: JSON.stringify(req.body), userId: _.get(req, "userId"), roles: _.get(req, "user.roles"), api: arguments.callee.name}).save()
    const mail = req.body.mail;
    base('Mailing liste Agi\'r').create([{ fields: {"Mail": mail} }], function(err, records) {
      if (err) {console.error(err);res.status(500).json({"text": "Erreur interne"}); return;}
      res.status(200).json({
        "text": "Succès",
        "data": records
      }) 
    });
  }
}

exports.set_mail = set_mail;