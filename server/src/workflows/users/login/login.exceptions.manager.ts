import logger from "../../../logger";
import { Res } from "../../../types/interface";

export const loginExceptionsManager = (error: Error, res: Res) => {
  logger.error("[Login] error while login", { error: error.message });
  switch (error.message) {
    case "INVALID_REQUEST":
      return res.status(400).json({ text: "Requête invalide" });
    case "INVALID_PASSWORD":
      return res
        .status(401)
        .json({ text: "Mot de passe incorrect", data: "no-alert" });
    case "NOT_FROM_SITE":
      return res
        .status(403)
        .json({ text: "Création d'utilisateur ou login impossible par API" });
    case "PASSWORD_TOO_WEAK":
      return res.status(401).json({ text: "Le mot de passe est trop faible" });
    case "INTERNAL":
      return res.status(500).json({ text: "Erreur interne" });
    case "WRONG_ADMIN_CODE":
      return res.status(402).json({
        text: "Erreur à la vérification du code",
        data: "no-alert",
      });
    case "ERROR_WHILE_SENDING_ADMIN_CODE":
      return res.status(404).json({
        text: "Erreur à l'envoi du code à ce numéro",
      });
    case "ERROR_AUTHY_ACCOUNT_CREATION":
      return res.status(404).json({
        text: "Erreur à la création du compte authy",
      });
    case "NO_AUTHY_ID":
      return res.status(502).json({
        text: "no authy_id",
      });
    case "NO_CODE_SUPPLIED":
      return res.status(501).json({ text: "no code supplied" });
    case "USER_DELETED":
      return res.status(405).json({
        text: "Utilisateur supprimé",
      });
    default:
      res.status(500).json({
        text: "Erreur interne",
      });
  }
};
