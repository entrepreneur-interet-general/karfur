import logger = require("../../../logger");
import { Res, IDispositif } from "../../../types/interface";
import { getDispositifsFromDB } from "../../../controllers/dispositif/dispositif.repository";
import { adaptDispositifMainSponsorAndCreatorId } from "../../../controllers/dispositif/dispositif.adapter";
import { turnToLocalizedTitles } from "../../../controllers/dispositif/functions";

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
      adminComments: 1,
      adminProgressionStatus: 1,
      adminPercentageProgressionStatus: 1,
      lastAdminUpdate: 1,
    };

    const dispositifs = await getDispositifsFromDB(neededFields);
    const adaptedDispositifs = adaptDispositifMainSponsorAndCreatorId(
      dispositifs
    );

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
