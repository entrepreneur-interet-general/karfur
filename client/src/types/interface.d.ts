import { ObjectId } from "mongodb";
import { Moment } from "moment";

export interface RequestReturn<Y> {
  data: { data: Y };
}

export interface Event {
  target: { id: string; value: string };
}

export interface Indicator {
  _id: ObjectId;
  wordsCount: number;
  timeSpent: number;
}
export interface SimplifiedUser {
  username: string;
  picture: Picture;
  status: string;
  _id: ObjectId;
  created_at: Moment;
  roles: string[];
  email: string;
  langues: { langueCode: string; langueFr: string }[];
  structures: SimplifiedStructure[];
  nbStructures: number;
  threeMonthsIndicator?: Indicator;
  sixMonthsIndicator?: Indicator;
  twelveMonthsIndicator?: Indicator;
  totalIndicator?: Indicator;
}
export interface SimplifiedDispositif {
  titreInformatif: string;
  titreMarque?: string;
  updatedAt: Moment;
  status: string;
  typeContenu: string;
  created_at: Moment;
  publishedAt?: Moment;
  _id: ObjectId;
  mainSponsor: null | {
    _id: ObjectId;
    nom: string;
    status: string;
    picture: Picture | undefined;
  };
  creatorId: {
    username: string;
    picture: Picture | undefined;
    _id: ObjectId;
  } | null;
  adminComments?: string;
  adminProgressionStatus?: string;
  adminPercentageProgressionStatus?: string;
  lastAdminUpdate?: Moment;
}
export interface Picture {
  imgId: ObjectId;
  public_id: string;
  secure_url: string;
}

export interface Role {
  _id: ObjectId;
  nom: string;
  nomPublique: string;
}

export interface Language {
  langueFr: string;
  langueLoc?: string;
  langueCode?: string;
  langueIsDialect?: boolean;
  langueBackupId: ObjectId;
  status?: string;
  i18nCode: string;
  avancement?: number;
  participants: ObjectId[];
  created_at: Moment;
  updatedAt: Moment;
}

export interface User {
  username: string;
  email?: string;
  phone?: string;
  description?: string;
  objectifTemps?: number;
  objectifMots?: number;
  picture?: Picture;
  roles?: Role[];
  selectedLanguages?: Language[];
  notifyObjectifs?: boolean;
  objectifTempsContrib?: number;
  objectifMotsContrib?: number;
  notifyObjectifsContrib?: boolean;
  traductionsFaites?: ObjectId[];
  contributions?: ObjectId[];
  noteTraduction?: number;
  status?: string;
  cookies?: any;
  structures?: ObjectId[];
  last_connected?: Moment;
  updatedAt: Moment;
  created_at: Moment;
  _id: ObjectId;
}

export interface DispositifContent {
  type: string;
  title: string;
  editable: boolean;
  content: string;
  children?: DispositifContent[];
  placeholder?: string;
  tutoriel?: Record<string, string>;
  target?: string;
  contentTitle?: string;
  isFakeContent?: boolean;
  titleIcon?: string;
  typeIcon?: string;
  bottomValue?: number;
  topValue?: number;
  free?: boolean;
  price?: number;
  footerHref?: string;
  footerIcon?: string;
  footer?: string;
  niveaux?: string[];
  departments?: string[];
  contentBody?: string;
  ageTitle?: string;
  noContent?: boolean;
}

export interface Tag {
  darkColor: string;
  hoverColor: string;
  illustrationColor: string;
  lightColor: string;
  name: string;
  short: string;
  icon: string;
}

export interface AudienceAge {
  contentTitle: "Plus de ** ans" | "De ** à ** ans" | "Moins de ** ans";
  bottomValue: number | string;
  topValue: number | string;
}
export interface IDispositif {
  _id: ObjectId;
  abstract: string;
  audience: string[];
  audienceAge: AudienceAge[];
  autoSave: boolean;
  avancement: Record<string, number>;
  bravo: {
    createdAt: Moment;
    keyValue: number;
    subkey: number;
    suggestionId: string;
  }[];
  contact: string;
  contenu: DispositifContent[];
  created_at: Moment;
  creatorId: User;
  externalLink: string;
  mainSponsor: Structure;
  merci: { createdAt: Moment; keyValue: number; subkey: null | number }[];
  nbMots: number;
  niveauFrancais: string[];
  participants: User[];
  signalements: any[];
  sponsors: Structure[];
  status: string;
  suggestions: any[];
  tags: Tag[];
  titreInformatif: string;
  titreMarque: string;
  traductions: ObjectId[];
  typeContenu: "dispositif" | "demarche";
  updatedAt: Moment;
}

export interface DetailedOpeningHours {
  day: string;
  from0?: string;
  to0?: string;
  from1?: string;
  to1?: string;
}
export interface OpeningHours {
  details: DetailedOpeningHours[];
  noPublic: boolean;
  precisions?: string;
}

interface Membre {
  userId: ObjectId;
  roles: string[];
}
export interface Structure {
  _id: ObjectId;
  membres: Membre[];
  acronyme: string;
  administrateur: ObjectId;
  adresse: string;
  authorBelongs: boolean;
  contact: string;
  created_at: Moment;
  createur: ObjectId;
  dispositifsAssocies: ObjectId[] | Dispositif[];
  link: string;
  mail_contact: string;
  mail_generique: string;
  nom: string;
  phone_contact: string;
  siren: string;
  siret: string;
  status: string;
  updatedAt: Moment;
  picture: Picture;
  structureTypes?: string[];
  websites?: string[];
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  activities?: string[];
  departments?: string[];
  phonesPublic?: string[];
  adressPublic?: string;
  openingHours?: OpeningHours;
  description?: string;
  hasResponsibleSeenNotification?: boolean;
  mailsPublic?: string[];
}

export interface SimplifiedStructure {
  _id: ObjectId;
  acronyme: string;
  nom: string;
  picture: Picture;
  role?: string[];
}

export interface Picture {
  imgId: string | null;
  public_id: string | null;
  secure_url: string | null;
}
export interface Translation {
  _id?: ObjectId;
  initialText?: object;
  translatedText?: object;
  langueCible?: string;
  articleId?: ObjectId;
  timeSpent?: string;
  isStructure?: boolean;
  avancement?: number;
  type?: string;
  validatorId?: ObjectId;
  isExpert?: boolean;
}

interface SimplifiedDispositifAssocie {
  titreInformatif: string;
  titreMarque: string;
  _id: ObjectId;
  tags: Tag[];
  abstract: string;
  status: string;
}

export interface Responsable {
  _id: ObjectId;
  username: string;
  picture: Picture;
}
export interface SimplifiedStructureForAdmin {
  _id: ObjectId;
  nom: string;
  picture: Picture;
  status: string;
  contact: string;
  phone_contact: string;
  mail_contact: string;
  nbMembres: number;
  created_at: Moment;
  responsable: null | Responsable;
  membres: Membre[];
  nbFiches: number;
}
