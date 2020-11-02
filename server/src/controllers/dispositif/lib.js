const Dispositif = require("../../schema/schemaDispositif.js");
const Role = require("../../schema/schemaRole.js");
const User = require("../../schema/schemaUser.js");
const Traduction = require("../../schema/schemaTraduction");
const Structure = require("../../schema/schemaStructure.js");
const Error = require("../../schema/schemaError");
var uniqid = require("uniqid");
const {
  addOrUpdateDispositifInContenusAirtable,
} = require("../miscellaneous/airtable.js");

const {
  turnToLocalized,
  turnHTMLtoJSON,
  turnJSONtoHTML,
  turnToLocalizedNew,
  markTradModifications,
  countContents,
  countValidated,
} = require("./functions");
const logger = require("../../logger");

// const gmail_auth = require('./gmail_auth');

// const transporter = nodemailer.createTransport({
//   // service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'diairagir@gmail.com',
//     pass: process.env.GMAIL_PASS
//   },
// });

//Function to patch dispositifs that had EditorState object saved in DB causing great size problem
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function patch_dispositifs(req, res) {
  logger.info("Patch dispositifs");
  try {
    var all = await Dispositif.find().lean();
    for (var i = 0; i < all.length; ++i) {
      logger.info("patching dispositif", { id: all[i]._id.toString() });
      if (all[i].contenu && all[i].contenu.length) {
        for (var x = 0; x < all[i].contenu.length; ++x) {
          if (all[i].contenu[x].children && all[i].contenu[x].children.length) {
            for (var y = 0; y < all[i].contenu[x].children.length; ++y) {
              if (all[i].contenu[x].children[y].editorState) {
                delete all[i].contenu[x].children[y].editorState;
              }
            }
          }
        }
      }
      await Dispositif.findOneAndUpdate({ _id: all[i]._id }, all[i], {
        upsert: true,
        new: true,
      });
    }
    logger.info(`finish patching ${all.length} dispositifs`);
    return res.status(200).json("OK");
  } catch (e) {
    logger.error("Error while patching dispositifs", { error: e });
    return res.status(500).json("KO");
  }
}
/* 
concerning the Translation: this function is called when a pubblished dispositif is modified, in this case we need to unpublish the translations and 
propose in the "À revoir" section so that the changed fields can be translated again
*/
async function add_dispositif(req, res) {
  try {
    var dispResult = {};
    if (!req.fromSite) {
      return res.status(405).json({ text: "Requête bloquée par API" });
    } else if (
      !req.body ||
      (!req.body.titreInformatif && !req.body.dispositifId)
    ) {
      return res.status(400).json({ text: "Requête invalide" });
    }
    let dispositif = req.body;
    logger.info("[add_dispositif] received a dispositif", {
      dispositifId: dispositif.dispositifId,
    });
    dispositif.status = dispositif.status || "En attente";
    if (dispositif.contenu) {
      // transform dispositif.contenu in json
      dispositif.nbMots = turnHTMLtoJSON(dispositif.contenu);
    }
    //Si le dispositif existe déjà on fait juste un update
    if (dispositif.dispositifId) {
      logger.info("[add_dispositif] updating a dispositif", {
        dispositifId: dispositif.dispositifId,
      });

      //if the dispositif exists it means that it has been changed so we have to update all trads to reflect the changes

      if (dispositif.contenu) {
        const originalDis = await Dispositif.findOne({
          _id: dispositif.dispositifId,
        });
        const originalTrads = {};
        // We fetch the French key to know the original text, turnToLocalized takes a dispositif with multiple translated language keys and returns one specified language
        // eslint-disable-next-line no-undef
        dispositifFr = await turnToLocalizedNew(originalDis, "fr");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let [key, value] of Object.entries(originalDis.avancement)) {
          if (key !== "fr") {
            //we put the different translations before the update in an object by key
            originalTrads[key] = await Traduction.find(
              {
                articleId: originalDis._id,
                langueCible: key,
                isExpert: true,
              },
              {},
              { sort: { updatedAt: -1 } }
            );
            for (let tradExpert of originalTrads[key]) {
              logger.info("[add_dispositif] before markTradModifications", {
                // eslint-disable-next-line no-undef
                id: dispositifFr._id,
              });
              /*   now we compare the old french version of the dispositif with new updated one,
           and for every change we mark the paragraph/title/etc. within the translation so that we can propose it and highlight it in the 'à revoir' section  */
              try {
              tradExpert = markTradModifications(
                dispositif,
                // eslint-disable-next-line no-undef
                dispositifFr,
                tradExpert,
                req.userId,
              );
              } catch (e) {
                new Error({
                  name: "markTradModifications",
                  userId: req.userId,
                  dataObject: req.body,
                  error: e,
                }).save();
              }
              // we update the percentage of the translation done after the modified fields if status is 'À revoir' (so the original version in french as been modified)
              if (tradExpert.status === "À revoir") {
                const contentsTotal = countContents(dispositif.contenu) + 3 - 4;
                const validatedTotal = countValidated([
                  tradExpert.translatedText,
                ]);
                const newAvancement = validatedTotal / contentsTotal;
                tradExpert.avancement = newAvancement;
                //we update all possible translations standing with the new percentage
                await Traduction.updateMany(
                  { articleId: originalDis._id, langueCible: key },
                  { status: "À revoir", avancement: newAvancement },
                  { upsert: false }
                );
              }
              //we update the expert trad with the new modified trad
              await Traduction.findOneAndUpdate(
                { _id: tradExpert._id },
                tradExpert,
                { upsert: true, new: true }
              );
            }
          }
        }
        dispositif.avancement =
          originalDis.avancement.fr || originalDis.avancement;
        dispositif.publishedAt = Date.now();
      }

      if (dispositif.status === "Actif") {
        dispositif.publishedAt = Date.now();
      }

      //now I need to save the dispositif and the translation
      dispResult = await Dispositif.findOneAndUpdate(
        { _id: dispositif.dispositifId },
        dispositif,
        { upsert: true, new: true }
      );

      // when publish or modify a dispositif, update table in airtable to follow the traduction
      if (
        dispResult.status === "Actif" &&
        dispResult.typeContenu === "dispositif"
      ) {
        logger.info("[add_dispositif] dispositif is Actif", {
          dispositifId: dispResult._id,
        });
        try {
          await addOrUpdateDispositifInContenusAirtable(
            dispResult.titreInformatif,
            dispResult.titreMarque,
            dispResult.dispositifId || dispResult._id,
            dispResult.tags,
            null
          );
        } catch (error) {
          logger.error("error while updating contenu in airtable", { error });
        }
      }
    } else {
      logger.info("[add_dispositif] creating a new dispositif", {
        title: dispositif.titreInformatif,
      });
      dispositif.creatorId = req.userId;
      dispResult = await new Dispositif(dispositif).save();
    }

    /*     return promise.then(data => {
      //Je rajoute le statut de contributeur à l'utilisateur */
    if (!dispositif.dispositifId) {
      await Role.findOne({ nom: "Contrib" }).exec((err, result) => {
        if (!err && result && req.userId) {
          User.findByIdAndUpdate(
            { _id: req.userId },
            {
              $addToSet: { roles: result._id, contributions: dispResult._id },
            },
            { new: true },
            () => {}
          );
        }
      });
    }
    //J'associe la structure principale à ce dispositif
    if (dispositif.mainSponsor) {
      await Structure.findByIdAndUpdate(
        { _id: dispositif.mainSponsor },
        { $addToSet: { dispositifsAssocies: dispResult._id } },
        { new: true },
        () => {}
      );
    }

    return res.status(200).json({
      text: "Succès",
      data: dispResult,
    });
    //  })
    /* .catch(err => {
      console.log(err);
      return res.status(500).json({"text": "Erreur interne", data: err})
    }) */
    // }
  } catch (err) {
    return res.status(500).json({ text: "Erreur interne", data: err });
  }
}

async function get_dispositif(req, res) {
  try {
    if (!req.body || !req.body.query) {
      res.status(400).json({ text: "Requête invalide" });
    } else {
      logger.info("Calling get dispositif");
      let { query, sort, populate, limit, random, locale } = req.body;
      locale = locale || "fr";

      if (!req.fromSite) {
        //On n'autorise pas les populate en API externe
        populate = "";
      } else if (populate && populate.constructor === Object) {
        populate.select = "-password";
      } else if (populate) {
        populate = { path: populate, select: "-password" };
      } else {
        populate = "";
      }
      let promise = null;
      if (random) {
        promise = await Dispositif.aggregate([
          { $match: query },
          { $sample: { size: 1 } },
        ]);
      } else {
        if (query["audienceAge.bottomValue"]) {
          var modifiedQuery = Object.assign({}, query);
          delete modifiedQuery["audienceAge.bottomValue"];
          delete modifiedQuery["audienceAge.topValue"];
          var newQuery = {
            $or: [
              query,
              {
                "variantes.bottomValue": query["audienceAge.bottomValue"],
                "variantes.topValue": query["audienceAge.topValue"],
                ...modifiedQuery,
              },
            ],
          };
          promise = await Dispositif.find(newQuery)
            .sort(sort)
            .populate(populate)
            .limit(limit)
            .lean();
        } else {
          promise = await Dispositif.find(query)
            .sort(sort)
            .populate(populate)
            .limit(limit)
            .lean();
        }
      }
      // promise.explain("allPlansExecution").then(d => console.log("query explained : ", d));
      [].forEach.call(promise, (dispositif) => {
        dispositif = turnToLocalized(dispositif, locale);
        turnJSONtoHTML(dispositif.contenu);
      });
      res.status(200).json({
        text: "Succès",
        data: promise,
      });
    }
  } catch (error) {
    switch (error) {
      case 500:
        res.status(500).json({
          text: "Erreur interne",
        });
        break;
      case 404:
        res.status(404).json({
          text: "Pas de résultat",
        });
        break;
      default:
        res.status(500).json({
          text: "Erreur interne",
        });
    }
  }
}

function update_dispositif(req, res) {
  if (!req.fromSite) {
    return res.status(405).json({ text: "Requête bloquée par API" });
  } else if (!req.body || !req.body.dispositifId || !req.body.fieldName) {
    res.status(400).json({ text: "Requête invalide" });
  } else {
    let {
      dispositifId,
      fieldName,
      suggestionId,
      type,
      ...dispositif
    } = req.body;
    let update = null,
      query = { _id: dispositifId };
    if (type === "pull") {
      update = { $pull: { [fieldName]: { suggestionId: suggestionId } } };
    } else if (type === "set") {
      query = { ...query, "suggestions.suggestionId": suggestionId };
      update = { $set: { [fieldName]: true } };
    } else {
      update = {
        $push: {
          [fieldName]: {
            ...(req.userId && { userId: req.userId }),
            ...(req.user && {
              username: req.user.username,
              picture: req.user.picture,
            }),
            ...dispositif,
            createdAt: new Date(),
            suggestionId: uniqid("feedback_"),
          },
        },
      };
    }
    Dispositif.findOneAndUpdate(query, update, { new: true }, (err, data) => {
      if (err) {
        res.status(404).json({ text: "Pas de résultat", error: err });
      } else {
        res.status(200).json({
          text: "Succès",
          data: data,
        });
      }
    });
  }
}

function get_dispo_progression(req, res) {
  var start = new Date();
  start.setHours(0, 0, 0, 0);

  var find = new Promise(function (resolve, reject) {
    Dispositif.aggregate([
      {
        $match: {
          creatorId: req.userId,
          created_at: { $gte: start },
          timeSpent: { $ne: null },
        },
      },
      {
        $group: {
          _id: req.userId,
          nbMots: { $sum: "$nbMots" },
          timeSpent: { $sum: "$timeSpent" },
          count: { $sum: 1 },
        },
      },
    ]).exec(function (err, result) {
      if (err) {
        reject(500);
      } else {
        if (result) {
          resolve(result);
        } else {
          reject(404);
        }
      }
    });
  });

  find.then(
    function (result) {
      res.status(200).json({
        text: "Succès",
        data: result,
      });
    },
    // eslint-disable-next-line no-use-before-define
    (e) => _errorHandler(e, res)
  );
}

function count_dispositifs(req, res) {
  Dispositif.count(req.body, (err, count) => {
    if (err) {
      res.status(404).json({ text: "Pas de résultat" });
    } else {
      res.status(200).json(count);
    }
  });
}

const _errorHandler = (error, res) => {
  switch (error) {
    case 500:
      res.status(500).json({
        text: "Erreur interne",
      });
      break;
    case 404:
      res.status(404).json({
        text: "Pas de résultats",
      });
      break;
    default:
      res.status(500).json({
        text: "Erreur interne",
      });
  }
};

//On exporte notre fonction
exports.add_dispositif = add_dispositif;
exports.get_dispositif = get_dispositif;
exports.count_dispositifs = count_dispositifs;
exports.update_dispositif = update_dispositif;
exports.get_dispo_progression = get_dispo_progression;
