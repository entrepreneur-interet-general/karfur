// @ts-nocheck
import { formatContributions } from "../functions";

const userContrib1 = {
  _id: "id1",
  typeContenu: "dispositif",
  titreInformatif: "ti1",
  titreMarque: "tm1",
  mainSponsor: null,
  nbMercis: 0,
  nbVues: 0,
  status: "Brouillon",
};
const formattedUserContrib1 = {
  _id: "id1",
  typeContenu: "dispositif",
  titreInformatif: "ti1",
  titreMarque: "tm1",
  mainSponsor: null,
  nbMercis: 0,
  nbVues: 0,
  status: "Brouillon",
  responsabilite: "Moi",
  isAuthorizedToDelete: true,
};
const userContrib2 = {
  _id: "id2",
  typeContenu: "demarche",
  titreInformatif: "ti2",
  mainSponsor: "sponsor2",
  nbMercis: 0,
  nbVues: 0,
  status: "Actif",
};
const formattedUserContrib2 = {
  _id: "id2",
  typeContenu: "demarche",
  titreInformatif: "ti2",
  mainSponsor: "sponsor2",
  nbMercis: 0,
  nbVues: 0,
  status: "Actif",
  responsabilite: "sponsor2",
  isAuthorizedToDelete: false,
};

const userContrib3 = {
  _id: "id3",
  typeContenu: "dispositif",
  titreInformatif: "ti3",
  titreMarque: "tm3",
  mainSponsor: "structure",
  nbMercis: 0,
  nbVues: 0,
  status: "En attente",
};
const formattedUserContrib3 = {
  _id: "id3",
  typeContenu: "dispositif",
  titreInformatif: "ti3",
  titreMarque: "tm3",
  mainSponsor: "structure",
  nbMercis: 0,
  nbVues: 0,
  status: "En attente",
  responsabilite: "Moi",
  isAuthorizedToDelete: true,
};
const userContribs = [userContrib1, userContrib2, userContrib3];

const userStructureContrib1 = {
  _id: "id1s",
  typeContenu: "dispositif",
  titreInformatif: "ti1s",
  titreMarque: "tm1s",
  mainSponsor: null,
  nbMercis: 0,
  nbVues: 0,
  status: "Brouillon",
};

const userStructureContrib2 = {
  _id: "id2s",
  typeContenu: "dispositif",
  titreInformatif: "ti2s",
  titreMarque: "tm2s",
  mainSponsor: null,
  nbMercis: 0,
  nbVues: 0,
  status: "Supprimé",
};

const userStructureContrib3 = {
  _id: "id3s",
  typeContenu: "dispositif",
  titreInformatif: "ti3s",
  titreMarque: "tm3s",
  mainSponsor: null,
  nbMercis: 0,
  nbVues: 0,
  status: "Rejeté structure",
};

const userStructureContrib4 = {
  _id: "id4s",
  typeContenu: "dispositif",
  titreInformatif: "ti4s",
  titreMarque: "tm4s",
  mainSponsor: "structure",
  nbMercis: 0,
  nbVues: 0,
  status: "Actif",
};

const formattedUserContrib4 = {
  _id: "id4s",
  typeContenu: "dispositif",
  titreInformatif: "ti4s",
  titreMarque: "tm4s",
  nbMercis: 0,
  nbVues: 0,
  status: "Actif",
  responsabilite: "structure",
  isAuthorizedToDelete: true,
};

const userStructureContrib5 = {
  _id: "id3",
  typeContenu: "dispositif",
  titreInformatif: "ti4s",
  titreMarque: "tm4s",
  mainSponsor: "structure",
  nbMercis: 0,
  nbVues: 0,
  status: "En attente",
};

const userStructureContrib = [
  userStructureContrib1,
  userStructureContrib2,
  userStructureContrib3,
  userStructureContrib4,
  userStructureContrib5,
];
describe("formatContributions", () => {
  it("should format correctly contribus", () => {
    const result = formatContributions(
      userContribs,
      userStructureContrib,
      "structure"
    );
    expect(result).toEqual([
      formattedUserContrib1,
      formattedUserContrib2,
      formattedUserContrib3,
      formattedUserContrib4,
    ]);
  });
});
