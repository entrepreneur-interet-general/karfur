import { RequestFromClient, Res } from "../../../types/interface";
import logger = require("../../../logger");
import { checkRequestIsFromSite } from "../../../libs/checkAuthorizations";
import { getActiveContents } from "../../../modules/dispositif/dispositif.repository";
import { getTraductionsByLanguage } from "../../../modules/traductions/traductions.repository";
import { ObjectId } from "mongoose";
import { turnToLocalizedTitles } from "../../../controllers/dispositif/functions";
import { getTradStatus } from "../../../modules/traductions/traductions.service";

interface Query {
  locale: string;
}

interface Result {
  _id: ObjectId;
  titreInformatif: string;
  titreMarque: string;
  nbMots: number;
  created_at: number;
  typeContenu: "dispositif" | "demarche";
  lastTradUpdatedAt: number | null;
  avancementTrad: number;
  avancementExpert: number;
  tradStatus: string;
}

const availableLanguages = ["fa", "en", "ru", "ps", "ar", "ti-ER"];
export const getDispositifsWithTranslationAvancement = async (
  req: RequestFromClient<Query>,
  res: Res
) => {
  try {
    checkRequestIsFromSite(req.fromSite);

    if (!req.query.locale || !availableLanguages.includes(req.query.locale)) {
      throw new Error("INVALID_REQUEST");
    }

    const locale = req.query.locale;
    logger.info(
      "[getDispositifsWithTranslationAvancement] received with locale",
      { locale }
    );

    const neededFields = {
      titreInformatif: 1,
      titreMarque: 1,
      nbMots: 1,
      created_at: 1,
      typeContenu: 1,
    };
    const activeDispositifs = await getActiveContents(neededFields);

    const traductionFields = {
      articleId: 1,
      avancement: 1,
      status: 1,
      updatedAt: 1,
      userId: 1,
    };

    const traductions = await getTraductionsByLanguage(
      locale,
      traductionFields
    );
    let results: Result[] = [];

    activeDispositifs.forEach((dispositif) => {
      const correspondingTrads = traductions.filter(
        (trad) => trad.articleId.toString() === dispositif._id.toString()
      );
      turnToLocalizedTitles(dispositif, "fr");
      const dispositifData = {
        _id: dispositif._id,
        titreInformatif: dispositif.titreInformatif,
        titreMarque: dispositif.titreMarque,
        nbMots: dispositif.nbMots,
        created_at: dispositif.created_at,
        typeContenu: dispositif.typeContenu,
      };

      if (correspondingTrads.length === 0) {
        // @ts-ignore : titreInformatif and titreMarque are string after turnToLocalized
        return results.push({
          ...dispositifData,
          lastTradUpdatedAt: null,
          avancementTrad: 0,
          avancementExpert: 0,
          tradStatus: "À traduire",
        });
      }
      const lastTradUpdatedAt = Math.max(
        0,
        ...correspondingTrads.map((z) => z.updatedAt || 0)
      );
      const avancementTrad = Math.max(
        0,
        ...correspondingTrads.map((z) => z.avancement || -1)
      );

      const avancementExpert = Math.max(
        0,
        ...correspondingTrads
          .filter((y) => {
            return y.userId === req.userId;
          })
          .map((z) => z.avancement || -1)
      );

      const tradStatus = getTradStatus(correspondingTrads);

      // @ts-ignore : titreInformatif and titreMarque are string after turnToLocalized
      return results.push({
        ...dispositifData,
        lastTradUpdatedAt,
        avancementTrad,
        avancementExpert,
        tradStatus,
      });
    });

    console.log(
      "reqults a revoir",
      results.filter((res) => res.tradStatus === "À revoir").length
    );
    console.log(
      "reqults a trad",
      results.filter((res) => res.tradStatus === "À traduire").length
    );

    console.log(
      "reqults publiee",
      results.filter((res) => res.tradStatus === "Validée").length
    );

    console.log(
      "reqults a valider",
      results.filter((res) => res.tradStatus === "En attente").length
    );

    console.log(
      "reqults dispo",
      results.filter((res) => res.typeContenu === "dispositif").length
    );

    console.log(
      "reqults demacrhe",
      results.filter((res) => res.typeContenu === "demarche").length
    );

    res.status(200).json({ data: results });
  } catch (error) {
    logger.error("[getDispositifsWithTranslationAvancement] error", {
      error: error.message,
    });

    switch (error.message) {
      case "NOT_FROM_SITE":
        return res.status(405).json({ text: "Requête bloquée par API" });
      case "INVALID_REQUEST":
        return res.status(400).json({ text: "Requête invalide" });
      default:
        return res.status(500).json({ text: "Erreur interne" });
    }
  }
};
