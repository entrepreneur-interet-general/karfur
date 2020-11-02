const himalaya = require("himalaya");
const sanitizeHtml = require("sanitize-html");
const { sanitizeOptions } = require("../article/data");
const _ = require("lodash");
const Error = require("../../schema/schemaError");
const logger = require("../../logger");

const pointeurs = ["titreInformatif", "titreMarque", "abstract"];

/* We mark the changes with the new update dispositif,
by comparing the old french text (oldD) with new one (newD) and then for validated translation (trad) we mark the modified section
and if one of the sections is changed we change the status to "À revoir"*/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const markTradModifications = (newD, oldD, trad, userId) => {
  logger.info("[markTradModifications] dispositif ", {
    id: oldD._id,
  });
  //We mark the titreInformatif, Marque, and Abstract
  pointeurs.forEach((x) => {
    try {
      if (JSON.stringify(oldD[x]) !== JSON.stringify(newD[x])) {
        logger.info("[markTradModifications] pointeur was modified", {
          id: oldD._id,
          pointeur: x,
        });
        trad.translatedText[x + "Modified"] = true;
        trad.status = "À revoir";
      }
    } catch (e) {
      new Error({
        name: "markTradModifications",
        userId: userId,
        dataObject: {
          element: x,
          newD,
          oldD,
          trad,
        },
        error: e,
      }).save();
    }
  });
  oldD.contenu.forEach((p, index) => {
    try {
      //we mark the titles of the content sections
      if (
        JSON.stringify(p.title) !== JSON.stringify(newD.contenu[index].title)
      ) {
        logger.info("[markTradModifications] title content was modified", {
          id: oldD._id,
          title: p.title,
        });
        trad.translatedText.contenu[index].titleModified = true;
        trad.status = "À revoir";
      }
      //we mark the content in the 4 content sections
      if (
        JSON.stringify(p.content) !==
        JSON.stringify(newD.contenu[index].content)
      ) {
        logger.info("[markTradModifications] content was modified", {
          id: oldD._id,
          content: p.content,
        });
        trad.translatedText.contenu[index].contentModified = true;
        trad.status = "À revoir";
      }

      if (
        p.children !== newD.contenu[index].children ||
        (p.children &&
          p.children.length !== newD.contenu[index].children.length)
      ) {
        logger.info("[markTradModifications] children was modified", {
          id: oldD._id,
        });
        trad.status = "À revoir";
      }

      //we mark the title and content for every child of each section
      if (p.children && p.children.length > 0) {
        logger.info(
          "[markTradModifications] since children was modified, mark content of children",
          {
            id: oldD._id,
            children: p.children,
          }
        );
        p.children.forEach((c, j) => {
          try {
            if (!newD.contenu[index].children) {
              logger.info("[markTradModifications] children was removed", {
                id: oldD._id,
              });
              delete trad.translatedText.contenu[index].children;
              trad.status = "À revoir";
            } else if (
              !newD.contenu[index].children[j] &&
              trad.translatedText.contenu[index] &&
              trad.translatedText.contenu[index].children
            ) {
              logger.info(
                "[markTradModifications] content of children was removed",
                {
                  id: oldD._id,
                }
              );
              trad.translatedText.contenu[index].children.splice(j, 1);
              trad.status = "À revoir";
            } else {
              if (
                JSON.stringify(c.title) !==
                  JSON.stringify(newD.contenu[index].children[j].title) &&
                trad.translatedText.contenu[index] &&
                trad.translatedText.contenu[index].children
              ) {
                logger.info(
                  "[markTradModifications] title of children was modified",
                  {
                    id: oldD._id,
                  }
                );
                trad.translatedText.contenu[index].children[
                  j
                ].titleModified = true;
                trad.status = "À revoir";
              }

              if (
                c.type !== "card" &&
                newD.contenu[index].children[j] &&
                trad.translatedText.contenu[index] &&
                JSON.stringify(c.content) !==
                  JSON.stringify(newD.contenu[index].children[j].content)
              ) {
                trad.translatedText.contenu[index].children[
                  j
                ].contentModified = true;
                trad.status = "À revoir";
              }

              //we mark the infocards (contentTitle)
              if (
                newD.contenu[index].children[j] &&
                JSON.stringify(c.contentTitle) !==
                  JSON.stringify(
                    newD.contenu[index].children[j].contentTitle
                  ) &&
                trad.translatedText.contenu[index] &&
                trad.translatedText.contenu[index].children
              ) {
                trad.translatedText.contenu[index].children[
                  j
                ].contentTitleModified = true;
                trad.status = "À revoir";
              }
            }
          } catch (e) {
            new Error({
              name: "markTradModifications",
              userId: userId,
              dataObject: {
                element: p,
                index,
                subElement: c,
                subIndex: j,
                newD,
                oldD,
                trad,
              },
              error: e,
            }).save();
          }
        });
      }
    } catch (e) {
      new Error({
        name: "markTradModifications",
        userId: userId,
        dataObject: {
          element: p,
          index,
          newD,
          oldD,
          trad,
        },
        error: e,
      }).save();
    }
  });
  return trad;
};

//we count the number of paragraphs/titles/sections with in the document and if the paragraph is malformed or undefined we skip it
const countContents = (obj, nbChamps = 0, type = null) => {
  obj.forEach((x) => {
    ["titreInformatif", "titreMarque", "abstract", "title", "content"].forEach(
      (p) => {
        //for each malformed type we skip, this is where bugged translations are solved to avoid % of validation problems
        if (
          x[p] &&
          x[p] !== "" &&
          x[p] !== "null" &&
          x[p] !== "undefined" &&
          x[p] !== undefined &&
          x[p] !== null &&
          x[p] !== "<p>null</p>" &&
          x[p] !== "<p><br></p>" &&
          x[p] !== "<p><br></p>\n" &&
          x[p] !== "<br>" &&
          x[p] !== "<p></p>\n\n<p></p>\n" &&
          x[p] !== "<p></p><figure> </figure><p><br></p>" &&
          type !== "cards"
        ) {
          nbChamps += 1;
        }
      }
    );

    //same as before but for infocards
    if (
      type === "cards" &&
      (x.title === "Important !" || x.title === "Durée" || !x.title) &&
      x.contentTitle &&
      x.contentTitle !== "" &&
      x.contentTitle !== undefined &&
      x.contentTitle !== null &&
      x.contentTitle !== "null" &&
      x.contentTitle !== "undefined" &&
      x.contentTitle !== "<p>null</p>" &&
      x.contentTitle !== "<p><br></p>" &&
      x.contentTitle !== "<br>"
    ) {
      nbChamps += 1;
    }
    if (x.contenu && x.contenu.length > 0) {
      nbChamps = countContents(x.contenu, nbChamps, x.type);
    }
    if (x.children && x.children.length > 0) {
      nbChamps = countContents(x.children, nbChamps, x.type);
    }
  });
  return nbChamps;
};

//we count the number of paragraphs/titles/sections validated with in the document and if the paragraph is malformed or undefined we skip it
const countValidated = (obj, nbChamps = 0, type = null) => {
  obj.forEach((x) => {
    ["titreInformatif", "titreMarque", "abstract", "title", "content"].forEach(
      (p) => {
        if (
          x[p] &&
          x[p] !== "" &&
          x[p] !== "null" &&
          x[p] !== "undefined" &&
          x[p] !== undefined &&
          x[p] !== null &&
          x[p] !== "<p>null</p>" &&
          x[p] !== "<p><br></p>" &&
          x[p] !== "<p><br></p>\n" &&
          x[p] !== "<br>" &&
          x[p] !== "<p></p>\n\n<p></p>\n" &&
          type !== "cards" &&
          !x[p + "Modified"]
        ) {
          nbChamps += 1;
        }
      }
    );
    if (
      type === "cards" &&
      (x.title === "Important !" || x.title === "Durée" || !x.title) &&
      x.contentTitle &&
      x.contentTitle !== "" &&
      x.contentTitle !== undefined &&
      x.contentTitle !== null &&
      x.contentTitle !== "null" &&
      x.contentTitle !== "undefined" &&
      x.contentTitle !== "<p>null</p>" &&
      x.contentTitle !== "<p><br></p>" &&
      x.contentTitle !== "<br>" &&
      !x["contentTitleModified"]
    ) {
      nbChamps += 1;
    }
    if (x.contenu && x.contenu.length > 0) {
      nbChamps = countValidated(x.contenu, nbChamps, x.type);
    }
    if (x.children && x.children.length > 0) {
      nbChamps = countValidated(x.children, nbChamps, x.type);
    }
  });
  return nbChamps;
};

const turnToLocalized = (result, locale) => {
  pointeurs.forEach((x) => {
    if (result[x]) {
      result[x] = result[x][locale] || result[x].fr || result[x];
    }
  });

  result.contenu.forEach((p) => {
    if (p.title) {
      p.title = p.title[locale] || p.title.fr || p.title;
    }
    if (p.content) {
      p.content = p.content[locale] || p.content.fr || p.content;
    }
    if (p.children && p.children.length > 0) {
      p.children.forEach((c) => {
        if (c.title) {
          c.title = c.title[locale] || c.title.fr || c.title;
        }
        if (c.content) {
          c.content = c.content[locale] || c.content.fr || c.content;
        }
        if (c.contentTitle) {
          c.contentTitle =
            c.contentTitle[locale] || c.contentTitle.fr || c.contentTitle;
        }
      });
    }
  });
  return result;
};

// we get the specific language key we need by making a copy
const turnToLocalizedNew = (resultObj, locale) => {
  var result = JSON.parse(JSON.stringify(resultObj));
  pointeurs.forEach((x) => {
    if (result[x]) {
      result[x] = result[x][locale] || result[x].fr || result[x];
    }
  });

  result.contenu.forEach((p) => {
    if (p.title) {
      p.title = p.title[locale] || p.title.fr || p.title;
    }
    if (p.content) {
      p.content = p.content[locale] || p.content.fr || p.content;
    }
    if (p.children && p.children.length > 0) {
      p.children.forEach((c) => {
        if (c.title) {
          c.title = c.title[locale] || c.title.fr || c.title;
        }
        if (c.content) {
          c.content = c.content[locale] || c.content.fr || c.content;
        }
        if (c.contentTitle) {
          c.contentTitle =
            c.contentTitle[locale] || c.contentTitle.fr || c.contentTitle;
        }
      });
    }
  });
  return result;
};

//Dupliqué dans traduction/lib : Node ne semble pas gérer cet export (circulaire)
const turnHTMLtoJSON = (contenu, nbMots = 0) => {
  for (var i = 0; i < contenu.length; i++) {
    if (contenu[i].content) {
      let html = contenu[i].content;
      nbMots += (html || "").trim().split(/\s+/).length;
      let safeHTML = sanitizeHtml(html, sanitizeOptions); //Pour l'instant j'autorise tous les tags, il faudra voir plus finement ce qui peut descendre de l'éditeur et restreindre à ça
      let jsonBody = himalaya.parse(safeHTML, {
        ...himalaya.parseDefaults,
        includePositions: false,
      });

      // filter empty paragraphs because it breaks translation
      const jsonBodyFiltered = _.filter(
        jsonBody,
        (element) =>
          !(
            element.type === "element" &&
            element.tagName === "p" &&
            element.attributes &&
            element.attributes.length === 0 &&
            element.children &&
            element.children.length === 0
          )
      );
      contenu[i].content = jsonBodyFiltered;
    }

    if ((contenu[i].children || []).length > 0) {
      nbMots = turnHTMLtoJSON(contenu[i].children, nbMots);
    }
  }
  return nbMots;
};

//Dupliqué dans traduction/lib : Node ne semble pas gérer cet export (circulaire)
const turnJSONtoHTML = (contenu) => {
  if (contenu) {
    for (var i = 0; i < contenu.length; i++) {
      if (
        contenu[i] &&
        contenu[i].content &&
        (typeof contenu[i].content === Object ||
          typeof contenu[i].content === "object")
      ) {
        contenu[i].content = himalaya.stringify(contenu[i].content);
      }
      if (contenu[i] && contenu[i].children && contenu[i].children.length > 0) {
        turnJSONtoHTML(contenu[i].children);
      }
    }
  }
};

exports.turnToLocalized = turnToLocalized;
exports.turnToLocalizedNew = turnToLocalizedNew;
exports.markTradModifications = markTradModifications;
exports.countContents = countContents;
exports.countValidated = countValidated;
exports.turnHTMLtoJSON = turnHTMLtoJSON;
exports.turnJSONtoHTML = turnJSONtoHTML;
