/* eslint no-eval: 0 */
import React, { Component } from "react";
import track from "react-tracking";
import { Modal, Spinner } from "reactstrap";
import moment from "moment/min/moment-with-locales";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import { NavLink, Redirect } from "react-router-dom";
import windowSize from "react-window-size";

import {
  avancement_actions,
  avancement_contributions,
  avancement_members,
} from "./data";
import API from "../../../utils/API";
import DashHeader from "../../../components/Backend/UserDash/DashHeader/DashHeader";
import {
  MembersTable,
  ActionTable,
  ContribTable,
} from "../../../components/Backend/UserProfile";
import FButton from "../../../components/FigmaUI/FButton/FButton";
import EVAIcon from "../../../components/UI/EVAIcon/EVAIcon";
import {
  AddMemberModal,
  EditMemberModal,
  ReactionLectureModal,
} from "../../../components/Modals";
import {
  showSuggestion,
  archiveSuggestion,
  parseActions,
  deleteContrib,
} from "../UserProfile/functions";
import { selectItem, editMember, addMember } from "./functions";
import DateOffset from "../../../components/Functions/DateOffset";
import { fetchDispositifsActionCreator } from "../../../services/Dispositif/dispositif.actions";

import "./UserDashStruct.scss";
import variables from "scss/colors.scss";

moment.locale("fr");

const tables = [
  { name: "actions", component: ActionTable },
  { name: "contributions", component: ContribTable },
  { name: "members", component: MembersTable },
];

// Ma structure
export class UserDashStruct extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.showSuggestion = showSuggestion.bind(this);
    this.archiveSuggestion = archiveSuggestion.bind(this);
    this.selectItem = selectItem.bind(this);
    this.editMember = editMember.bind(this);
    this.addMember = addMember.bind(this);
    this.deleteContrib = deleteContrib.bind(this);
  }

  state = {
    showModal: {
      actions: false,
      contributions: false,
      members: false,
      addMember: false,
      editMember: false,
      suggestion: false,
    },
    isMainLoading: true,
    showSections: { contributions: true },
    contributions: [],
    actions: [],
    members: [],

    structure: {},
    users: [],
    selected: {},
    suggestion: {},
    traductions: [],
    selectedStructure:
      this.props.location.state && this.props.location.state.admin
        ? this.props.location.state.structure
        : this.props.user.structures
        ? this.props.user.structures[0]
        : null,
  };

  componentDidMount() {
    this._isMounted = true;
    if (!this.state.selectedStructure) {
      Swal.fire(
        "Oh non",
        "Nous n'avons aucune information sur votre structure d'affiliation, vous allez être redirigé vers la page d'accueil",
        "error"
      ).then(() => this.props.history.push("/"));
      return;
    }

    this.initializeStructure();
    API.get_users({ query: { status: "Actif" } }).then(
      (data) => this._isMounted && this.setState({ users: data.data.data })
    );
    API.get_dispositif({
      query: {
        mainSponsor: this.state.selectedStructure,
        status: {
          $in: ["Actif", "Accepté structure", "En attente", "En attente admin"],
        },
        demarcheId: { $exists: false },
      },
      sort: { updatedAt: -1 },
      populate: "participants",
    }).then((data) => {
      this._isMounted &&
        this.setState(
          {
            contributions: data.data.data,
            actions: parseActions(data.data.data),
          },
          () => {
            this._isMounted &&
              API.get_tradForReview({
                query: {
                  type: "dispositif",
                  articleId: {
                    $in: this.state.contributions.map((x) => x._id),
                  },
                },
              }).then((data) => {
                this._isMounted &&
                  this.setState({ traductions: data.data.data });
              });
          }
        );
    });
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.structure !== prevState.structure) {
      document.title = this.state.structure.nom;
    }
    if (this.props.location.state !== prevProps.location.state) {
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  initializeStructure = () => {
    /*     let selectedStructure =
      this.props.location.state && this.props.location.state.admin
        ? this.props.location.state.structure
        : user.structures[0];
 */
    API.get_structure(
      { _id: this.state.selectedStructure },
      {},
      "dispositifsAssocies"
    ).then((data) => {
      if (data.data.data && data.data.data.length > 0) {
        this.setState({ structure: data.data.data[0], isMainLoading: false });
        API.get_event({
          query: {
            created_at: { $gte: DateOffset(new Date(), 0, 0, -15) },
            userId: {
              $in: ((data.data.data[0] || {}).membres || []).map(
                (x) => x.userId
              ),
            },
            action: { $ne: "idle" },
          },
        }).then((data_res) => {
          this.setState((pS) => ({
            structure: {
              ...pS.structure,
              membres: (pS.structure.membres || []).map((y) => ({
                ...y,
                connected: (data_res.data.data || []).some(
                  (z) => z.userId === y.userId
                ),
              })),
            },
          }));
        });
      } else {
        this.setState({ structure: { noResults: true } });
      }
    });
  };

  toggleModal = (modal) => {
    this.props.tracking.trackEvent({
      action: "toggleModal",
      label: modal,
      value: !this.state.showModal[modal],
    });
    this.setState((pS) => ({
      showModal: { ...pS.showModal, [modal]: !pS.showModal[modal] },
    }));
  };

  toggleSection = (section) => {
    this.props.tracking.trackEvent({
      action: "toggleSection",
      label: section,
      value: !this.state.showSections[section],
    });
    this.setState({
      showSections: {
        ...this.state.showSections,
        [section]: !this.state.showSections[section],
      },
    });
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500,
    });

  render() {
    const {
      isMainLoading,
      actions,
      contributions,
      structure,
      users,
    } = this.state;
    const { user } = this.props;

    if (!structure || structure.noResults) {
      return <Redirect to="/backend/user-profile" />;
    }
    const members = structure.membres;
    const enAttente = (structure.dispositifsAssocies || []).filter(
      (x) => x.status === "En attente"
    );
    return (
      <div className="animated fadeIn user-dash-struct">
        <DashHeader
          isStructure
          title="Votre structure"
          // ctaText="Gérer mon rôle"
          structure={structure}
          traductions={this.state.traductions}
          actions={this.state.actions}
          user={user}
          toggle={this.toggleModal}
          upcoming={this.upcoming}
        />

        {enAttente.length > 0 &&
          enAttente.map((element) => (
            <div className="nouveau-contenu mt-12 mb-12" key={element._id}>
              <div className="left-side">
                <EVAIcon
                  name="alert-triangle"
                  fill={variables.noir}
                  className="mr-10"
                />
                <b>Un nouveau contenu a été attribué à votre structure !</b>
              </div>
              <div className="middle-side">
                <b>
                  {element.created_at
                    ? moment(element.created_at).fromNow()
                    : ""}
                </b>
              </div>
              <div className="right-side">
                <FButton
                  tag={NavLink}
                  to={{
                    pathname:
                      "/" +
                      (element.typeContenu || "dispositif") +
                      "/" +
                      element._id,
                    state: { structure: structure },
                  }}
                  type="light-action"
                  name="eye-outline"
                  fill={variables.noir}
                >
                  Voir le contenu
                </FButton>
              </div>
            </div>
          ))}

        <ActionTable
          dataArray={actions}
          toggleModal={this.toggleModal}
          showSuggestion={this.showSuggestion}
          upcoming={this.upcoming}
          archive={this.archiveSuggestion}
          limit={5}
          {...avancement_actions}
        />

        <ContribTable
          type="structure"
          dataArray={contributions}
          user={user}
          toggleModal={this.toggleModal}
          toggleSection={this.toggleSection}
          windowWidth={this.props.windowWidth}
          limit={5}
          hide={false}
          overlayTitle="Rédigez des nouveaux contenus"
          overlaySpan="Réfugiés-info est une plateforme contributive, vous pouvez participer à son enrichissement"
          overlayBtn="Découvrir comment contribuer"
          overlayRedirect={false}
          history={this.props.history}
          deleteContrib={this.deleteContrib}
          {...avancement_contributions}
        />

        <MembersTable
          dataArray={members}
          toggleModal={this.toggleModal}
          removeBookmark={this.removeBookmark}
          editMember={this.editMember}
          upcoming={this.upcoming}
          history={this.props.history}
          user={user}
          users={users}
          structure={structure}
          limit={5}
          {...avancement_members}
        />

        {tables.map((table, key) => {
          const TagName = table.component;
          let avancement =
            key === 0
              ? avancement_actions
              : key === 1
              ? avancement_contributions
              : avancement_members;
          return (
            <Modal
              isOpen={this.state.showModal[table.name]}
              toggle={() => this.toggleModal(table.name)}
              className="modal-plus"
              key={key}
            >
              <TagName
                type="structure"
                dataArray={eval(table.name)}
                user={user}
                upcoming={this.upcoming}
                showSuggestion={this.showSuggestion}
                archive={this.archiveSuggestion}
                editMember={this.editMember}
                history={this.props.history}
                users={users}
                deleteContrib={this.deleteContrib}
                {...avancement}
              />
            </Modal>
          );
        })}

        <AddMemberModal
          show={this.state.showModal.addMember}
          toggle={() => this.toggleModal("addMember")}
          users={this.state.users}
          selectItem={this.selectItem}
          addMember={this.addMember}
          selected={this.state.selected}
        />

        <EditMemberModal
          show={this.state.showModal.editMember}
          toggle={() => this.toggleModal("editMember")}
          user={user}
          selected={this.state.selected}
          structure={structure}
          initializeStructure={this.initializeStructure}
        />

        <ReactionLectureModal
          suggestion={this.state.suggestion}
          show={this.state.showModal.suggestion}
          toggle={() => this.toggleModal("suggestion")}
          archive={this.archiveSuggestion}
        />

        {isMainLoading && (
          <div className="ecran-protection no-main">
            <div className="content-wrapper">
              <h1 className="mb-3">Chargement...</h1>
              <Spinner color="success" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    langues: state.langue.langues,
    user: state.user.user,
    expertTrad: state.user.expertTrad,
  };
};

const mapDispatchToProps = { fetchDispositifs: fetchDispositifsActionCreator };

export default track({
  page: "UserDashStruct",
})(connect(mapStateToProps, mapDispatchToProps)(windowSize(UserDashStruct)));
