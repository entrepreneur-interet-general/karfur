import React from "react";
import { Player } from "video-react";
import h2p from "html2plaintext";
// import { Alerts } from "@streamlinehq/streamline-regular/lib/interface-essential";
// import { Conversation } from "@streamlinehq/streamline-regular/lib/messages-chat-smileys";
// import { GeometricFullBodySingleUserActionsNeutral } from "@streamlinehq/streamline-regular/lib/users";
// import { Time } from "@streamlinehq/streamline-regular/lib/interface-essential";
// import { Currencies } from "@streamlinehq/streamline-regular/lib/money-payments-finance";
// import { Family } from "@streamlinehq/streamline-regular/lib/family-babies-kids";

const contenu = {
  titreInformatif: "Titre informatif",
  titreMarque: "Le nom du dispositif",
  abstract: "",
  contact: "contact@lab-r.fr",
  externalLink: "",
};

const lorems = {
  paragraphe:
    "Sint tempor enim exercitation elit duis ad irure enim incididunt incididunt laboris non. Aliquip non ut quis commodo nulla nulla minim elit. Enim reprehenderit duis adipisicing mollit ad incididunt laboris fugiat officia duis do pariatur. Quis quis aliqua ipsum labore ea sunt commodo sint dolor minim aliquip veniam magna commodo.",
  sousParagraphe:
    "Précisez votre pensée ! N'hésitez pas créer des listes, à importer des images, des vidéos ou à mettre en avant une information importante avec les options à votre disposition.",
};

const showModals = {
  reaction: false,
  fiabilite: false,
  reaction: false,
  merci: false,
  allGood: false,
  construction: false,
  map: false,
  responsable: false,
  rejection: false,
  variante: false,
};

const menu = [
  {
    title: "C'est quoi ?",
    content: "",
  },
  {
    title: "C'est pour qui ?",
    type: "cards",
    content: null,

    children: [
      {
        type: "card",
        isFakeContent: true,
        title: "Public visé",
        titleIcon: "papiers",
        contentTitle: "réfugiés",
        contentBody: "ou bénéficiaire de la protection subsidiaire",
        footer: "En savoir plus",
        footerIcon: "info-outline",
      },
      {
        type: "card",
        isFakeContent: true,
        title: "Âge requis",
        titleIcon: "calendar-outline",
        typeIcon: "eva",
        contentTitle: "De ** à ** ans",
        bottomValue: 18,
        topValue: 56,
      },
      {
        type: "card",
        isFakeContent: true,
        title: "Durée",
        titleIcon: "clock-outline",
        typeIcon: "eva",
        contentTitle: "6 à 12 mois",
      },
      {
        type: "card",
        isFakeContent: true,
        title: "Niveau de français",
        titleIcon: "frBubble",
        contentTitle: "Débutant",
        niveaux: [],
        footer: "Évaluer mon niveau",
        footerIcon: "bar-chart-outline",
        tooltipFooter: "En savoir plus",
      },
      {
        type: "card",
        isFakeContent: true,
        title: "Combien ça coûte ?",
        titleIcon: "pricetags-outline",
        typeIcon: "eva",
        free: true,
        price: 0,
        contentTitle: "une seule fois",
      },
    ],
  },
  {
    title: "Pourquoi c'est intéressant ?",
    content: null,

    children: [
      {
        isFakeContent: true,
        type: "accordion",
        content: "",
      },
    ],
  },
  {
    title: "Comment je m'engage ?",
    content: null,

    children: [
      {
        type: "accordion",
        isFakeContent: true,
        content: "",
      },
      { type: "map", isFakeContent: true, isMapLoaded: true, markers: [] },
    ],
  },
];

const menuDemarche = [
  {
    title: "C'est quoi ?",
    content: "",
    tutoriel: {
      titre: "« C’est quoi ? » : Résumé de votre dispositif",
      contenu:
        "Il s'agit d'une synthèse en deux paragraphes maximum de l’ensemble de la fiche du dispositif. La lecture de cette section doit être auto-suffisante. Il est conseillé de rédiger cette section en dernier après les sections ultérieures.",
    },
  },
  {
    title: "C'est pour qui ?",
    type: "cards",
    content: null,
    tutoriel: {
      titre: "« C’est pour qui ? » :  les pré-requis pour rejoindre",
      contenu:
        "Cette section précise les caractéristiques du public cible et les pré-requis éventuels pour s’engager dans le dispositif. Vous pouvez mobiliser les catégories suivantes à votre guise : \n> Le statut demandé ? Réfugié, demandeurs d’asiles, primo-arrivants… \n> L’âge ; \n> Le niveau de français \n> La durée sur laquelle engage le dispositif ; \n> Des alertes spécifiques (par exemple : avoir un compte bancaire).",
    },
    children: [],
  },
  {
    title: "La démarche par étapes",
    content: null,
    tutoriel: {
      titre: "Les arguments principaux pour votre dispositif",
      contenu:
        "Cette section contient la présentation à proprement parler du dispositif. Il s’agit ici d’aider l’utilisateur à identifier très vite si le dispositif peut lui convenir (aide au choix). Cette section doit contenir 4 arguments maximum. Ceux-ci sont formulées par un titre informatif qui doit pouvoir se lire seul, sans ouvrir l’accordéon. Néanmoins, chaque argument peut être précisé par une ou deux phrases, obtenues en déroulant « l’accordéon » correspondant. Des liens extérieurs, pour compléter cette information, peuvent être fournis.",
    },
    children: [
      {
        isFakeContent: true,
        title: "Titre de la première étape",
        type: "etape",
        placeholder:
          "Donnez plus d’information sur les modalités de réalisation de cette étape",
        content: "",
        papiers: [],
        duree: "00",
        timeStepDuree: "minutes",
        delai: "00",
        timeStepDelai: "minutes",
        option: {},
      },
      {
        isFakeContent: true,
        title: "Titre de la deuxième étape",
        type: "etape",
        placeholder:
          "Donnez plus d’information sur les modalités de réalisation de cette étape",
        content: "",
        papiers: [],
        duree: "00",
        timeStepDuree: "minutes",
        delai: "00",
        timeStepDelai: "minutes",
        option: {},
      },
    ],
  },
  {
    title: "Et après ?",
    content: null,
    tutoriel: {
      titre: "Les arguments principaux pour votre dispositif",
      contenu:
        "Cette section contient la présentation à proprement parler du dispositif. Il s’agit ici d’aider l’utilisateur à identifier très vite si le dispositif peut lui convenir (aide au choix). Cette section doit contenir 4 arguments maximum. Ceux-ci sont formulées par un titre informatif qui doit pouvoir se lire seul, sans ouvrir l’accordéon. Néanmoins, chaque argument peut être précisé par une ou deux phrases, obtenues en déroulant « l’accordéon » correspondant. Des liens extérieurs, pour compléter cette information, peuvent être fournis.",
    },
    children: [
      {
        type: "accordion",
        isFakeContent: true,
        title: "Renouvellement de la réduction",
        placeholder: lorems.sousParagraphe,
        content: "",
      },
    ],
  },
];

const importantCard = {
  type: "card",
  isFakeContent: true,
  title: "Important !",
  titleIcon: "alert-triangle-outline",
  typeIcon: "eva",
  contentTitle: "Votre message",
  footer: "Ajouter un message complémentaire",
  footerType: "text",
  tooltipHeader: "Critère spécifique",
  tooltipContent:
    "Vous avez la possibilité d’ajouter jusqu’à 3 critères supplémentaires pour prévenir les utilisateurs. Choisissez un titre court puis ajoutez une brève description.",
};

const filtres = {
  audience: ["réfugié", "tout public"],
  audienceAge: ["De ** à ** ans", "Moins de ** ans", "Plus de ** ans"],
  niveauFrancais: ["Débutant", "Intermédiaire", "Avancé", "Tous les niveaux"],
  justificatifs: [
    "Titre de séjour",
    "Justificatif de domicile",
    "Diplôme",
    "Permis de conduire",
  ],
  tags: [
    {
      short: "Français",
      icon: "elearning",
      name: "apprendre le français",
      darkColor: "#3E2884",
      lightColor: "#F0E8F5",
      hoverColor: "#3E2884",
      illustrationColor: "#F9AA38",
    },
    {
      short: "Administratif",
      icon: "office",
      name: "gérer mes papiers",
      darkColor: "#443023",
      lightColor: "#EAE2E1",
      hoverColor: "#fcb21c",
      illustrationColor: "#1FC2C1",
    },
    {
      short: "Logement",
      icon: "house",
      name: "me loger",
      darkColor: "#188CC6",
      lightColor: "#DDF3FA",
      hoverColor: "#188CC6",
      illustrationColor: "#F77B0B",
    },
    {
      short: "Mobilité",
      icon: "bus",
      name: "me déplacer",
      darkColor: "#F97821",
      lightColor: "#FFF0E7",
      hoverColor: "#F9D1B7",
      illustrationColor: "#5435D6",
    },
    {
      short: "Insertion pro",
      icon: "briefcase",
      name: "trouver un travail",
      darkColor: "#149295",
      lightColor: "#D6EFF4",
      hoverColor: "#4FD3BD",
      illustrationColor: "#DD0539",
    },
    {
      short: "Santé",
      icon: "heartBeat",
      name: "me soigner",
      darkColor: "#C6093F",
      lightColor: "#FFEEEE",
      hoverColor: "#F7698E",
      illustrationColor: "#1FC2C1",
    },
    {
      short: "Formation pro",
      icon: "measure",
      name: "apprendre un métier",
      darkColor: "#137F3A",
      lightColor: "#E8F4E9",
      hoverColor: "#7DC690",
      illustrationColor: "#FC1E73",
    },
    {
      short: "Études",
      icon: "glasses",
      name: "faire des études",
      darkColor: "#307205",
      lightColor: "#E8F7CD",
      hoverColor: "#ADEA5C",
      illustrationColor: "#E561D8",
    },
    {
      short: "Bénévolat",
      icon: "flag",
      name: "aider une association",
      darkColor: "#0A54BF",
      lightColor: "#FFEEEE",
      hoverColor: "#FDA8AD",
      illustrationColor: "#1FC2C1",
    },
    {
      short: "Rencontre",
      icon: "couple",
      name: "rencontrer des gens",
      darkColor: "#8E1B5A",
      lightColor: "#FFEBF5",
      hoverColor: "#FDA5C4",
      illustrationColor: "#76D327",
    },
    {
      short: "Loisir",
      icon: "soccer",
      name: "occuper mon temps libre",
      darkColor: "#861B8E",
      lightColor: "#F6E6FC",
      hoverColor: "#E595F9",
      illustrationColor: "#FCBF35",
    },
    {
      short: "Culture",
      icon: "triumph",
      name: "découvrir la culture",
      darkColor: "#ED4C26",
      lightColor: "#FFF0E7",
      hoverColor: "#FEC396",
      illustrationColor: "#1898FC",
    },
  ],
};

const cardTitles = [
  { title: "Public visé", titleIcon: "papiers", options: filtres.audience },
  {
    title: "Âge requis",
    titleIcon: "calendar-outline",
    options: filtres.audienceAge,
  }, //["0-18","18-25","25-56","56-120"]
  { title: "Durée", titleIcon: "clock-outline" },
  {
    title: "Niveau de français",
    titleIcon: "frBubble",
    options: filtres.niveauFrancais,
  },
  { title: "Combien ça coûte ?", titleIcon: "pricetags-outline" },

  { title: "Important !", titleIcon: "alert-triangle-outline" },
];

const onBoardSteps = [
  {
    title: "C’est parti !",
    firstStep: true,
  },
  {
    title: "Modifiez directement le texte",
    content: (
      <h5>
        Cliquez sur les éléments surlignés{" "}
        <span className="texte-jaune">en jaune</span> pour saisir votre texte.
      </h5>
    ),
  },
  {
    title: "Suivez le guide",
    content: (
      <h5>
        Des consignes sont proposées pour chaque{" "}
        <span className="texte-jaune">élément modifiable</span>.
      </h5>
    ),
  },
  {
    title: "Tout à portée de main",
    content: (
      <h5>
        Ce menu vous suit dans votre rédaction. Vous pouvez désactiver les
        consignes, sauvegarder votre brouillon et accéder à{" "}
        <span className="texte-rouge">plus d’aide</span>.
      </h5>
    ),
  },
];

const tutoSteps = [
  {
    title: "Titre",
    content:
      "rédigez une courte phrase qui décrit l’action principale de votre dispositif. Nous vous conseillons de commencer la phrase par un verbe d’action à l’infinitif - rencontrer, apprendre, se former, trouver de l’aide, être accompagne, etc.",
    locale: {
      skip: "Passer",
      next: "Suivant",
    },
    target: "#titreInformatif",
    disableBeacon: true,
  },
  {
    title: "Nom du dispositif",
    content:
      "ce nom est également affiché dans les choix de recherche. Préférez la syntaxe la plus courte possible. Le champ est limité à 25 caractères.",
    target: "#titreMarque",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Thème",
    content:
      "choisissez le thème principal qui caractérise le mieux votre dispositif. Puis ajoutez si besoin deux thèmes secondaires qui viennent améliorer le référencement de votre dispositif et préciser sa nature.",
    target: "#tags",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Lien vers le site du dispositif",
    content:
      "ajouter un lien direct vers la page la plus adéquate pour vous : inscription, présentation détaillée, page facebook, etc.",
    target: "#input-btn",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "C’est quoi ?",
    content:
      "Brève synthèse de la fiche récapitulant les points les plus importants. Deux paragraphes maximum. Nous vous conseillons de rédiger cette section en dernier.",
    target: "#contenu-0 .contenu",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "C’est pour qui ?",
    content:
      "Ajoutez autant de carte que nécessaire pour expliciter les conditions d’accès au dispositif. Passez la souris sur chaque carte pour avoir des consignes détaillées.",
    target: "#contenu-1 #info-card-1-1",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Pourquoi ?",
    content:
      "ajoutez jusqu’à 5 arguments principaux pour convaincre l’utilisateur de vous rejoindre. Chaque titre d’accordéon doit être compréhensible sans avoir à lire son contenu. N’hésitez pas à faire des sous-arguments à l’aide des listes à puce.",
    target: "#contenu-2 .accordeon-col",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Comment ?",
    content:
      "détaillez les différentes étapes pour accéder à votre dispositif : annuaire, prise de contact, premiers rendez-vous, formulaires d’inscriptions, etc. Vous pouvez ajouter une carte interactive pour cartographier vos points de contacts.",
    target: "#contenu-3 .accordeon-col",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Carte interactive",
    content:
      "ajoutez des points de contacts géolocalisés en recherchant une adresse dans la barre de recherche Google Maps. Puis saisissez les informations du point de contact. Vous pouvez également importer massivement des contacts.",
    target: "#map-paragraphe",
    placement: "bottom",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Structure responsable",
    content:
      "ajoutez le logo de votre/vos structures. Attention : seul les fichiers .png, .jpg et .svg sont compatibles. Un lien vers le site de la structure et un texte alternatif à l’image vous est également demandé.",
    target: ".sponsor-footer",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
      last: "Terminer",
    },
    placement: "top",
  },
];

const demarcheSteps = {
  options: [
    {
      texte: "En ligne",
      logo: "at",
      label1: "Lien vers la démarche :",
      label2: "Texte sur le bouton :",
      placeholder1: "Copiez-collez ici l’URL de votre lien",
      placeholder2: "Ex : “Évaluer mes droits en ligne”",
      checkbox: "Je ne connais pas le lien exact à ajouter",
      icon1: "link-2",
      icon2: "external-link",
      ctaText: "Évaluer mes droits en ligne",
      ctaField: "value2",
      modalHeader: "Clique sur ce lien",
    },
    {
      texte: "En physique",
      logo: "pin",
      label1: "Adresse :",
      label2: null,
      placeholder1:
        "Indiquez ici l’adresse à laquelle les usagers doivent se rendre",
      placeholder2: null,
      checkbox: "Je ne connais pas l’adresse exacte à ajouter",
      icon1: "pin",
      ctaText: "Voir l’adresse",
      ctaField: "value1",
      modalHeader: "Ton lieu de rendez-vous est",
    },
    {
      texte: "Par téléphone",
      logo: "phone-call",
      label1: "Numéro :",
      label2: null,
      placeholder1:
        "Insérez ici le numéro de téléphone à faire composer aux usagers",
      placeholder2: null,
      checkbox: "Je ne connais pas le numéro exact à ajouter",
      icon1: "phone-call",
      ctaText: "Voir le numéro de téléphone",
      modalHeader: "Numéro à appeler",
    },
    {
      texte: "Par courrier",
      logo: "email",
      label1: null,
      label2: null,
      placeholder1: "Numéro et libéllé de la voie",
      placeholder2: "Code postal",
      placeholder3: "Ville",
      placeholder4: "Cedex",
      checkbox: "Je ne connais pas l’adresse postale exacte à ajouter",
      icon1: "home",
      icon2: "hash",
      icon3: "pin",
      icon4: "hash",
      ctaText: "Voir l’adresse postale",
      modalHeader: "Ton courrier doit être adressé à",
    },
    {
      texte: "Autre",
      logo: "alert-triangle",
      label1:
        "Indiquez en deux mots le type de démarche que vous demandez à l’usager :",
      label2: null,
      placeholder1: "Type de démarche",
      placeholder2:
        "Expliquez maintenant les détails de l’action à réaliser pour réaliser l’étape",
      ctaText: "Bouton personnalisé",
      modalHeader: "Ce que tu dois faire",
    },
  ],
  timeSteps: [
    { texte: "secondes" },
    { texte: "minutes" },
    { texte: "heures" },
    { texte: "jours" },
    { texte: "mois" },
    { texte: "ans" },
  ],
  papiers: [
    { texte: "Acte de naissance" },
    { texte: "Attestation CAF" },
    { texte: "Attestation CMU-C" },
    { texte: "Attestation de diplôme ou d’équivalence" },
    { texte: "Avis de taxe foncière" },
    { texte: "Avis d’imposition" },
    { texte: "Carte de bénéficiaire de l’AME" },
    { texte: "Carte de mutuelle" },
    { texte: "Carte de résident" },
    { texte: "Carte Vitale" },
    { texte: "Curriculum Vitae (CV)" },
    { texte: "Justificatif d’abonnement transport" },
    { texte: "Justificatif de domicile" },
    { texte: "Passeport" },
    { texte: "Permis de conduire" },
    { texte: "Récépissé de la demande d’asile" },
    { texte: "Récépissé de demande de titre de séjour " },
    { texte: "Relevé d’identité bancaire (RIB)" },
    { texte: "Titre de séjour" },
  ],
};

const tutoStepsDemarche = [
  {
    title: "Titre de la démarche",
    content: "Le titre décrit factuellement la démarche en quelques mots.",
    locale: {
      skip: "Passer",
      next: "Suivant",
    },
    target: "#titreInformatif",
    disableBeacon: true,
  },
  {
    title: "Thème",
    content: "Choisissez le thème qui caractérise le mieux votre démarche.",
    target: "#tags",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Définition du public cible",
    content:
      "Définissez le public concerné à l’aide des critères présentés ici.",
    target: "#moteur-variantes",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "C’est quoi ?",
    content:
      "Bref résumé de la fiche. Synthétisez les points importants pour bien situer la démarche.",
    target: "#contenu-0 .contenu",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Le détail des étapes",
    content:
      "Section la plus importante : détaillez simplement les actions à réaliser pour mener à bien la démarche. Chaque étape représente une seule action distincte à accomplir.",
    target: "#contenu-2 .accordeon-col",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Et après ?",
    content:
      "Précisez dans cette section tout ce qui concerne le renouvellement des droits, la suppression/radiation, l’évolution vers une démarche connexe, etc.",
    target: "#contenu-3 .accordeon-col",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
    },
  },
  {
    title: "Structure responsable",
    content:
      "Précisez quelle structure ou administration est responsable de cette démarche.",
    target: ".sponsor-footer",
    locale: {
      skip: "Passer",
      next: "Suivant",
      back: "Précédent",
      last: "Terminer",
    },
    placement: "top",
  },
];

const customConvertOption = {
  blockToHTML: (block) => {
    if (block.type === "header-six") {
      return {
        start:
          "<div class='bloc-rouge'> <div class='icon-left-side'> <span>i</span> </div> <div class='right-side'> <div><b>Bon à savoir :</b></div>",
        end: "</div> </div>",
      };
    }
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === "link" || entity.type === "LINK") {
      return (
        <a
          href={entity.data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="edited-btn"
        >
          {h2p(originalText)}
        </a>
      );
    } else if (entity.type === "image" || entity.type === "IMAGE") {
      return (
        <div className="image-wrapper">
          <img {...entity.data} alt={(entity.data || {}).alt} />
        </div>
      );
    } else if (
      entity.type === "embedded_link" ||
      entity.type === "EMBEDDED_LINK"
    ) {
      return (
        <div className="video-wrapper">
          <Player playsInline {...entity.data} />
        </div>
      );
    }
    return originalText;
  },
};

const google_localities = [
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "administrative_area_level_4",
  "administrative_area_level_5",
  "locality",
  "sublocality",
  "sublocality_level_1",
  "sublocality_level_2",
  "sublocality_level_3",
  "sublocality_level_4",
  "sublocality_level_5",
  "neighborhood",
];

// to use when streamline icon is installed
// const streamlineIconCorrespondency = [
//   { titleIcon: "alert-triangle-outline", streamlineIcon: Alerts.AlertTriangle },
//   {
//     titleIcon: "papiers",
//     streamlineIcon:
//       GeometricFullBodySingleUserActionsNeutral.SingleNeutralActionsCheck2,
//     evaIcon: "person-outline",
//   },
//   { titleIcon: "calendar-outline", streamlineIcon: Family.FamilyChild },
//   { titleIcon: "clock-outline", streamlineIcon: Time.TimeClockCircle1 },
//   {
//     titleIcon: "frBubble",
//     streamlineIcon: Conversation.ConversationChat1,
//     evaIcon: "message-circle-outline",
//   },
//   {
//     titleIcon: "pricetags-outline",
//     streamlineIcon: Currencies.CurrencyEuroCircle,
//   },
// ];

const streamlineIconCorrespondency = [
  { titleIcon: "alert-triangle-outline" },
  {
    titleIcon: "papiers",
    evaIcon: "person-outline",
  },
  { titleIcon: "calendar-outline" },
  { titleIcon: "clock-outline" },
  {
    titleIcon: "frBubble",
    evaIcon: "message-circle-outline",
  },
  {
    titleIcon: "pricetags-outline",
  },
];

export {
  contenu,
  lorems,
  menu,
  filtres,
  onBoardSteps,
  tutoSteps,
  importantCard,
  showModals,
  menuDemarche,
  demarcheSteps,
  tutoStepsDemarche,
  customConvertOption,
  google_localities,
  cardTitles,
  streamlineIconCorrespondency,
};
