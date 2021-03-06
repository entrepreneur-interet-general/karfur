import { Res } from "../../../types/interface";
import logger from "../../../logger";
import {
  getAllDemarchesFromDB,
  removeAudienceAgeInDB,
} from "../../../modules/dispositif/dispositif.repository";
import { asyncForEach } from "../../../libs/asyncForEach";

export const removeAudienceAgeOnDemarches = async (_: any, res: Res) => {
  try {
    logger.info("[removeAudienceAgeOnDemarches]");

    const demarches = await getAllDemarchesFromDB();

    asyncForEach(demarches, async (demarche) => {
      logger.info("[removeAudienceAgeOnDemarches] id", { id: demarche._id });
      await removeAudienceAgeInDB(demarche._id);
      logger.info("[removeAudienceAgeOnDemarches] id succes", {
        id: demarche._id,
      });
    });

    res.status(200).json({ text: "OK" });
  } catch (error) {
    logger.error("[removeAudienceAgeOnDemarches] error", {
      error: error.message,
    });
    res.status(500).json({ text: "KO" });
  }
};
