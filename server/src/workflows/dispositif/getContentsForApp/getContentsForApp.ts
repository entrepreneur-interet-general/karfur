import { RequestFromClient, Res } from "../../../types/interface";
import logger from "../../../logger";
import { getActiveContents } from "../../../modules/dispositif/dispositif.repository";
import { checkRequestIsFromSite } from "../../../libs/checkAuthorizations";
import { getTitreInfoOrMarqueInLocale } from "../../../modules/dispositif/dispositif.adapter";

interface Query {
  locale: string;
  age?: string;
  department?: string;
  frenchLevel?: string;
}

export const getContentsForApp = async (
  req: RequestFromClient<Query>,
  res: Res
) => {
  try {
    checkRequestIsFromSite(req.fromSite);

    if (!req.query || !req.query.locale) {
      throw new Error("INVALID_REQUEST");
    }

    const { locale, age, department, frenchLevel } = req.query;

    logger.info("[getContentsForApp] called", {
      locale,
      age,
      department,
      frenchLevel,
    });

    const neededFields = {
      titreInformatif: 1,
      titreMarque: 1,
      avancement: 1,
    };
    const contentsArray = await getActiveContents(neededFields);

    const contentsArrayFr = contentsArray.map((content) => {
      const titreInformatif = getTitreInfoOrMarqueInLocale(
        content.titreInformatif,
        "fr"
      );
      const titreMarque = getTitreInfoOrMarqueInLocale(
        content.titreMarque,
        "fr"
      );

      return { _id: content._id, titreInformatif, titreMarque };
    });

    if (locale === "fr") {
      return res.status(200).json({
        text: "Succès",
        dataFr: contentsArrayFr,
      });
    }

    const contentsArrayLocale = contentsArray.map((content) => {
      const titreInformatif = getTitreInfoOrMarqueInLocale(
        content.titreInformatif,
        locale
      );
      const titreMarque = getTitreInfoOrMarqueInLocale(
        content.titreMarque,
        locale
      );

      return { _id: content._id, titreInformatif, titreMarque };
    });

    res.status(200).json({
      text: "Succès",
      data: contentsArrayLocale,
      dataFr: contentsArrayFr,
    });
  } catch (error) {
    logger.error("[getContentsForApp] error while getting dispositifs", {
      error: error.message,
    });
    switch (error.message) {
      case "INVALID_REQUEST":
        return res.status(400).json({ text: "Requête invalide" });
      case "NOT_FROM_SITE":
        return res.status(405).json({ text: "Requête bloquée par API" });
      default:
        return res.status(500).json({
          text: "Erreur interne",
        });
    }
  }
};
