import HomePage from "./containers/HomePage/HomePage";
import Dashboard from "./containers/Backend/Dashboard/Dashboard";
import { Admin } from "./containers/Backend/Admin/Admin";
import UserDash from "./containers/Backend/UserDash/UserDash";
import UserDashContrib from "./containers/Backend/UserDashContrib/UserDashContrib";
import UserDashStruct from "./containers/Backend/UserDashStruct/UserDashStruct";
import UserProfile from "./containers/Backend/UserProfile/UserProfile";
import Dispositif from "./containers/Dispositif/Dispositif";
import Avancement from "./containers/Avancement/Avancement";
import Translation from "./containers/Translation/Translation";
import AdvancedSearch from "./containers/AdvancedSearch/AdvancedSearch";
import QuiSommesNous from "./containers/QuiSommesNous/QuiSommesNous";
import CommentContribuer from "./containers/CommentContribuer/CommentContribuer";
import MentionsLegales from "./containers/MentionsLegales/MentionsLegales";
import PolitiqueConfidentialite from "./containers/PolitiqueConfidentialite/PolitiqueConfidentialite";
import { AnnuaireCreate } from "./containers/Annuaire/AnnuaireCreate";
import {
  AnnuaireLecture,
  AnnuaireDetail,
} from "./containers/Annuaire/AnnuaireLecture";
import { UserNotifications } from "./containers/Backend/UserNotifications";

const routes = [
  {
    path: "/",
    exact: true,
    name: "Réfugiés.info",
    component: HomePage,
    restriction: [],
  },
  {
    path: "/homepage",
    name: "Réfugiés.info - Accueil",
    component: HomePage,
    restriction: [],
  },

  {
    path: "/advanced-search",
    name: "Réfugiés.info - Recherche",
    component: AdvancedSearch,
    restriction: [],
  },
  {
    path: "/qui-sommes-nous",
    name: "Réfugiés.info - Qui sommes-nous ?",
    component: QuiSommesNous,
    restriction: [],
  },
  {
    path: "/annuaire-create",
    name: "Réfugiés.info - Annuaire",
    component: AnnuaireCreate,
    restriction: [],
  },
  {
    path: "/annuaire",
    exact: true,
    name: "Réfugiés.info - Annuaire",
    component: AnnuaireLecture,
    restriction: [],
  },
  {
    path: "/annuaire/:id",
    name: "Réfugiés.info - Annuaire",
    exact: true,
    component: AnnuaireDetail,
    restriction: [],
  },
  {
    path: "/comment-contribuer",
    name: "Réfugiés.info - Comment contribuer ?",
    component: CommentContribuer,
    restriction: [],
  },
  {
    path: "/mentions-legales",
    name: "Réfugiés.info - Mentions Légales",
    component: MentionsLegales,
    restriction: [],
  },
  {
    path: "/politique-de-confidentialite",
    name: "Réfugiés.info - Politique de confidentialité",
    component: PolitiqueConfidentialite,
    restriction: [],
  },
  {
    path: "/dispositif/:id",
    exact: true,
    name: "Réfugiés.info - Dispositif",
    component: Dispositif,
    restriction: [],
  },
  {
    path: "/dispositif",
    exact: true,
    name: "Réfugiés.info - Dispositif",
    component: Dispositif,
    restriction: [],
  },

  {
    path: "/demarche/:id",
    exact: true,
    name: "Réfugiés.info - Démarche",
    component: Dispositif,
    restriction: [],
  },
  {
    path: "/demarche",
    exact: true,
    name: "Réfugiés.info - Démarche",
    component: Dispositif,
    restriction: [],
  },

  {
    path: "/avancement/traductions/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Avancement,
    restriction: ["ExpertTrad", "Admin"],
  },
  {
    path: "/avancement/langue/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Avancement,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/avancement",
    name: "Réfugiés.info - Traduction",
    component: Avancement,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/traduction",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/traduction/validation/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/traduction/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },

  {
    path: "/traduction/string/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/traduction/dispositif/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/traduction/demarche/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/validation/string/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["ExpertTrad", "Admin"],
  },
  {
    path: "/validation/dispositif/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["ExpertTrad", "Admin"],
  },
  {
    path: "/validation/demarche/:id",
    exact: true,
    name: "Réfugiés.info - Traduction",
    component: Translation,
    restriction: ["ExpertTrad", "Admin"],
  },

  {
    path: "/backend",
    exact: true,
    forceShow: true,
    name: "Réfugiés.info - Administration",
    component: Dashboard,
    restriction: ["Admin"],
  },

  {
    path: "/backend/admin",
    name: "Réfugiés.info - Administration",
    component: Admin,
    restriction: ["Admin"],
  },

  {
    path: "/backend/user-dashboard",
    name: "Réfugiés.info - Espace traduction",
    component: UserDash,
    restriction: ["User", "Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/backend/user-dash-contrib",
    name: "Réfugiés.info - Espace rédaction",
    component: UserDashContrib,
    restriction: ["Contrib", "Admin"],
  },
  {
    path: "/backend/user-dash-structure",
    name: "Réfugiés.info - Ma structure",
    component: UserDashStruct,
    restriction: ["Admin", "hasStructure"],
  },
  {
    path: "/backend/user-dash-structure-selected",
    name: "Réfugiés.info -  Structure",
    component: UserDashStruct,
    restriction: ["Admin"],
  },
  {
    path: "/backend/user-profile",
    name: "Réfugiés.info - Mon profil",
    component: UserProfile,
    restriction: ["User", "Trad", "ExpertTrad", "Admin"],
  },
  {
    path: "/backend/user-dash-notifications",
    name: "Réfugiés.info - Mes notifications",
    component: UserNotifications,
    restriction: ["Admin", "hasStructure"],
  },
];

const simplesRoutes = routes.map((x) => ({
  path: x.path,
  name: x.name,
  restriction: x.restriction,
}));
export { simplesRoutes };

export default routes;
