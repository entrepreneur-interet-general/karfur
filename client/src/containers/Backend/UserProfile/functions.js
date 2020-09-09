import API from "../../../utils/API";
import Swal from "sweetalert2";

const showSuggestion = function (suggestion, idx = -1) {
  this.setState((pS) => ({
    suggestion,
    actions: pS.actions.map((x, i) => (i === idx ? { ...x, read: true } : x)),
  }));
  this.toggleModal("suggestion");
  //On enregistre aussi en BDD que la notif est lue :
  const dispositif = {
    dispositifId: suggestion.dispositifId,
    suggestionId: suggestion.suggestionId,
    fieldName: suggestion.action + ".$.read",
    type: "set",
  };
  API.update_dispositif(dispositif);
};

const archiveSuggestion = function (suggestion) {
  let dispositif = {
    dispositifId: suggestion.dispositifId,
    suggestionId: suggestion.suggestionId,
    fieldName: suggestion.action,
    type: "pull",
  };
  API.update_dispositif(dispositif).then(() => {
    this.setState({
      actions: this.state.actions.filter(
        (x) => x.suggestionId !== suggestion.suggestionId
      ),
    });
    Swal.fire({
      title: "Yay...",
      text: "La notification a bien été supprimée.",
      type: "success",
      timer: 1500,
    });
  });
};

const parseActions = (dispositifs) => {
  let actions = [];
  dispositifs.forEach((dispo) => {
    return ["suggestions", "questions", "signalements"].map((item) => {
      if (dispo[item] && dispo[item].length > 0) {
        actions = [
          ...actions,
          ...dispo[item].map((x) => ({
            action: item,
            titre: dispo.titreInformatif,
            owner: true,
            depuis: x.createdAt,
            texte: x.suggestion,
            read: x.read,
            username: x.username,
            picture: x.picture,
            dispositifId: dispo._id,
            suggestionId: x.suggestionId,
          })),
        ];
      }
      return actions;
    });
  });
  return actions.sort((a, b) => (a.read ? 1 : b.read ? -1 : 0));
};

const deleteContrib = function (dispositif, type, callback = () => {}) {
  API.add_dispositif(dispositif).then(() => {
    this.props.fetchDispositifs();
    if (type) {
      const query =
        type === "user"
          ? { creatorId: this.props.userId }
          : { mainSponsor: ((this.props.user || {}).structures || [{}])[0] };
      API.get_dispositif({
        query: { ...query, status: { $ne: "Supprimé" } },
      }).then((data) => {
        this.setState({
          contributions: data.data.data,
          actions: parseActions(data.data.data),
        });
      });
    }
    return callback();
  });
};

const getProgression = function () {
  API.get_progression().then((data_progr) => {
    const progression = (data_progr.data.data || [{}])[0] || {};
    this._isMounted &&
      this.setState((pS) => ({
        progression: {
          ...pS.progression,
          timeSpent:
            (progression.timeSpent || 0) + (pS.progression.timeSpent || 0),
          nbMots: progression.nbMots,
        },
      }));
  });
  API.get_dispo_progression().then((data_progr) => {
    const progression = (data_progr.data.data || [{}])[0] || {};
    this._isMounted &&
      this.setState((pS) => ({
        progression: {
          ...pS.progression,
          timeSpent:
            (progression.timeSpent || 0) + (pS.progression.timeSpent || 0),
          nbMotsContrib: progression.nbMots,
        },
      }));
  });
};

export {
  showSuggestion,
  archiveSuggestion,
  parseActions,
  deleteContrib,
  getProgression,
};
