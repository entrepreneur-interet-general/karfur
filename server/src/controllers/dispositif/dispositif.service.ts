const logger = require("../../logger");
import {
  turnToLocalized,
  turnJSONtoHTML,
  turnToLocalizedTitles,
} from "./functions";
import { Res, RequestFromClient, IDispositif } from "../../types/interface";
import {
  getDispositifsFromDB,
  updateDispositifStatusInDB,
  getDispositifArray,
  updateDispositifMainSponsorInDB,
} from "./dispositif.repository";
import { ObjectId } from "mongoose";

const removeUselessContent = (dispositifArray: IDispositif[]) =>
  dispositifArray.map((dispositif) => {
    const selectZoneAction = dispositif.contenu[1].children.map(
      (child: any) => {
        if (child.title === "Zone d'action") {
          return child;
        }
        return {};
      }
    );

    const simplifiedContent = [{}, { children: selectZoneAction }];
    return { ...dispositif, contenu: simplifiedContent };
  });
interface Query {}

export const getDispositifs = async (
  req: RequestFromClient<Query>,
  res: Res
) => {
  try {
    if (!req.body || !req.body.query) {
      res.status(400).json({ text: "Requête invalide" });
    } else {
      logger.info("[getDispositifs] called");
      let { query, locale } = req.body;
      locale = locale || "fr";

      const dispositifArray = await getDispositifArray(query);

      // @ts-ignore
      const adaptedDispositifArray = removeUselessContent(dispositifArray);
      const array: string[] = [];
      array.forEach.call(adaptedDispositifArray, (dispositif: IDispositif) => {
        turnToLocalized(dispositif, locale);
        turnJSONtoHTML(dispositif.contenu);
      });

      res.status(200).json({
        text: "Succès",
        data: adaptedDispositifArray,
      });
    }
  } catch (error) {
    logger.error("[getDispositifs] error while getting dispositifs", { error });
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
};

export const getAllDispositifs = async (req: {}, res: Res) => {
  try {
    logger.info("[getAllDispositifs] called");

    const neededFields = {
      titreInformatif: 1,
      titreMarque: 1,
      updatedAt: 1,
      status: 1,
      typeContenu: 1,
      created_at: 1,
      publishedAt: 1,
    };

    const dispositifs = await getDispositifsFromDB(neededFields);
    const adaptedDispositifs = dispositifs.map((dispositif) => {
      const jsonDispositif = dispositif.toJSON();

      return {
        ...jsonDispositif,
        mainSponsor: jsonDispositif.mainSponsor
          ? {
              _id: jsonDispositif.mainSponsor._id,
              nom: jsonDispositif.mainSponsor.nom,
              status: jsonDispositif.mainSponsor.status,
              picture: jsonDispositif.mainSponsor.picture,
            }
          : "",
        creatorId: jsonDispositif.creatorId
          ? {
              username: jsonDispositif.creatorId.username,
              picture: jsonDispositif.creatorId.picture,
              _id: jsonDispositif.creatorId._id,
            }
          : null,
      };
    });

    const array: string[] = [];

    array.forEach.call(adaptedDispositifs, (dispositif: IDispositif) => {
      turnToLocalizedTitles(dispositif, "fr");
    });

    res.status(200).json({
      text: "Succès",
      data: adaptedDispositifs,
    });
  } catch (error) {
    logger.error("[getAllDispositifs] error while getting dispositifs", {
      error,
    });
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
};

interface QueryUpdate {
  dispositifId: ObjectId;
  status: string;
}
export const updateDispositifStatus = async (
  req: RequestFromClient<QueryUpdate>,
  res: Res
) => {
  try {
    if (!req.fromSite) {
      return res.status(405).json({ text: "Requête bloquée par API" });
    } else if (!req.body || !req.body.query) {
      return res.status(400).json({ text: "Requête invalide" });
    }

    const { dispositifId, status } = req.body.query;
    logger.info("[updateDispositifStatus]", { dispositifId, status });
    let newDispositif;
    if (status === "Actif") {
      newDispositif = { status, publishedAt: Date.now() };
    } else {
      newDispositif = { status };
    }
    await updateDispositifStatusInDB(dispositifId, newDispositif);
    res.status(200).json({ text: "OK" });
  } catch (error) {
    logger.error("[updateDispositifStatus] error", { error });
    return res.status(500).json({ text: "Erreur interne" });
  }
};

interface QueryModify {
  dispositifId: ObjectId;
  sponsorId: ObjectId;
}

export const modifyDispositifMainSponsor = async (
  req: RequestFromClient<QueryModify>,
  res: Res
) => {
  try {
    if (!req.fromSite) {
      return res.status(405).json({ text: "Requête bloquée par API" });
    } else if (
      !req.body ||
      !req.body.query ||
      !req.body.query.dispositifId ||
      !req.body.query.sponsorId
    ) {
      return res.status(400).json({ text: "Requête invalide" });
    }

    const { dispositifId, sponsorId } = req.body.query;
    logger.info("[modifyDispositifMainSponsor]", { dispositifId, sponsorId });
    const updatedDispositif = await updateDispositifMainSponsorInDB(
      dispositifId,
      sponsorId
    );
    // let newDispositif;
    // if (status === "Actif") {
    //   newDispositif = { status, publishedAt: Date.now() };
    // } else {
    //   newDispositif = { status };
    // }
    // await updateDispositifStatusInDB(dispositifId, newDispositif);
    res.status(200).json({ text: "OK" });
  } catch (error) {
    logger.error("[modifyDispositifMainSponsor] error", { error });
    return res.status(500).json({ text: "Erreur interne" });
  }
};
