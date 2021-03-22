import { ObjectId } from "mongoose";
import { RequestFromClient, Res } from "../../../types/interface";
import logger from "../../../logger";
import {
  updateDispositifInDB,
  getDispositifByIdWithMainSponsor,
} from "../../../modules/dispositif/dispositif.repository";
import { updateLanguagesAvancement } from "../../../controllers/langues/langues.service";
import { addOrUpdateDispositifInContenusAirtable } from "../../../controllers/miscellaneous/airtable";
import {
  checkRequestIsFromSite,
  checkIfUserIsAdmin,
  checkUserIsAuthorizedToModifyDispositif,
} from "../../../libs/checkAuthorizations";

interface QueryUpdate {
  dispositifId: ObjectId;
  status: string;
}
export const updateDispositifStatus = async (
  req: RequestFromClient<QueryUpdate>,
  res: Res
) => {
  try {
    checkRequestIsFromSite(req.fromSite);

    if (!req.body || !req.body.query) {
      throw new Error("INVALID_REQUEST");
    }

    const { dispositifId, status } = req.body.query;
    logger.info("[updateDispositifStatus]", { dispositifId, status });
    let newDispositif;
    if (status === "Actif") {
      // @ts-ignore : populate roles
      checkIfUserIsAdmin(req.user.roles);
      newDispositif = { status, publishedAt: Date.now() };
      const newDispo = await updateDispositifInDB(dispositifId, newDispositif);
      try {
        await updateLanguagesAvancement();
      } catch (error) {
        logger.info(
          "[updateDispositifStatus] error while updating languages avancement",
          { error }
        );
      }
      if (newDispo.typeContenu === "dispositif") {
        try {
          await addOrUpdateDispositifInContenusAirtable(
            newDispo.titreInformatif,
            newDispo.titreMarque,
            newDispo._id,
            newDispo.tags,
            null
          );
        } catch (error) {
          logger.error(
            "[updateDispositifStatus] error while updating contenu in airtable",
            { error }
          );
        }
      }
      return res.status(200).json({ text: "OK" });
    }

    if (status === "Supprimé") {
      const neededFields = {
        creatorId: 1,
        mainSponsor: 1,
        status: 1,
      };

      const dispositif = await getDispositifByIdWithMainSponsor(
        dispositifId,
        neededFields
      );
      checkUserIsAuthorizedToModifyDispositif(
        dispositif,
        req.userId,
        // @ts-ignore : populate roles
        req.user.roles
      );
    }

    newDispositif = { status };
    await updateDispositifInDB(dispositifId, newDispositif);
    return res.status(200).json({ text: "OK" });
  } catch (error) {
    logger.error("[updateDispositifStatus] error", { error: error.message });
    switch (error.message) {
      case "NOT_FROM_SITE":
        return res.status(405).json({ text: "Requête bloquée par API" });
      case "INVALID_REQUEST":
        return res.status(400).json({ text: "Requête invalide" });
      case "NOT_AUTHORIZED":
        return res.status(404).json({ text: "Non authorisé" });

      default:
        return res.status(500).json({ text: "Erreur interne" });
    }
  }
};
