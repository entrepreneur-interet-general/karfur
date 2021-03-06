import { colors } from "colors";

export const table_contenu = {
  title: "Contenu",
  headers: [
    {
      name: "Type",
      order: "typeContenu",
    },
    {
      name: "Titre",
      order: "titreInformatif",
    },
    {
      name: "Structure",
      order: "mainSponsor",
    },
    {
      name: "MAJ",
      order: "lastModificationDate",
    },
    {
      name: "Progression",
      order: "",
    },
    {
      name: "Statut",
      order: "",
    },

    {
      name: "Actions",
    },
  ],
};

const green = "#4CAF50";
const orange = "#FF9800";
const yellow = "#FFEB3B";
const red = "#F44336";
const lightGreen = "#8BC34A";

export const correspondingStatus = [
  { storedStatus: "Actif", displayedStatus: "Publié", color: green, order: 5 },
  {
    storedStatus: "En attente",
    displayedStatus: "En attente",
    color: orange,
    order: 1,
    textColor: colors.blancSimple,
  },
  {
    storedStatus: "Brouillon",
    displayedStatus: "Brouillon",
    color: yellow,
    order: 3,
    textColor: colors.darkColor,
  },
  {
    storedStatus: "En attente non prioritaire",
    displayedStatus: "Sans structure",
    color: red,
    order: 4,
    textColor: colors.blancSimple,
  },
  {
    storedStatus: "Rejeté structure",
    displayedStatus: "Rejeté",
    color: red,
    order: 6,
    textColor: colors.blancSimple,
  },
  {
    storedStatus: "En attente admin",
    displayedStatus: "À valider",
    color: lightGreen,
    order: 0,
    textColor: colors.blancSimple,
  },
  {
    storedStatus: "Accepté structure",
    displayedStatus: "Accepté",
    color: orange,
    order: 2,
    textColor: colors.blancSimple,
  },
  {
    storedStatus: "Supprimé",
    displayedStatus: "Supprimé",
    color: red,
    order: 7,
    textColor: colors.blancSimple,
  },
];

const darkBlue = colors.bleuCharte;
const lightBlue = colors.lightBlue;

export const progressionData = [
  {
    storedStatus: "Nouveau !",
    displayedStatus: "Nouveau !",
    color: darkBlue,
    textColor: colors.blancSimple,
    group: 1,
  },
  {
    storedStatus: "À contacter",
    displayedStatus: "À contacter",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 1,
  },
  {
    storedStatus: "Contacté",
    displayedStatus: "Contacté",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 1,
  },
  {
    storedStatus: "À relancer",
    displayedStatus: "À relancer",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 1,
  },
  {
    storedStatus: "Bloqué",
    displayedStatus: "Bloqué",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 1,
  },
  {
    storedStatus: "0%",
    displayedStatus: "0%",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 2,
  },
  {
    storedStatus: "25%",
    displayedStatus: "25%",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 2,
  },
  {
    storedStatus: "50%",
    displayedStatus: "50%",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 2,
  },
  {
    storedStatus: "75%",
    displayedStatus: "75%",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 2,
  },
  {
    storedStatus: "100%",
    displayedStatus: "100%",
    color: lightBlue,
    textColor: colors.darkColor,
    group: 2,
  },
];
