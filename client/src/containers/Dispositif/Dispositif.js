import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import track from 'react-tracking';
import { Col, Row, Modal, Spinner, Button } from 'reactstrap';
import { connect } from 'react-redux';
import ContentEditable from 'react-contenteditable';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import htmlToDraft from 'html-to-draftjs';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { savePDF } from '@progress/kendo-react-pdf';
import moment from 'moment/min/moment-with-locales';
import Swal from 'sweetalert2';
import Icon from 'react-eva-icons';
import h2p from 'html2plaintext';
import ReactJoyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import _ from "lodash";

import Sponsors from '../../components/Frontend/Dispositif/Sponsors/Sponsors';
import ContenuDispositif from '../../components/Frontend/Dispositif/ContenuDispositif/ContenuDispositif'
import API from '../../utils/API';
import {ReagirModal, BookmarkedModal, DispositifCreateModal, DispositifValidateModal, SuggererModal, MerciModal, EnConstructionModal, ResponsableModal} from '../../components/Modals/index';
import SVGIcon from '../../components/UI/SVGIcon/SVGIcon';
import Commentaires from '../../components/Frontend/Dispositif/Commentaires/Commentaires';
import Tags from './Tags/Tags';
import EVAIcon from '../../components/UI/EVAIcon/EVAIcon';
import LeftSideDispositif from '../../components/Frontend/Dispositif/LeftSideDispositif/LeftSideDispositif';
import TopRightHeader from '../../components/Frontend/Dispositif/TopRightHeader/TopRightHeader';
import {fetch_dispositifs, fetch_user} from '../../Store/actions/index';
import ContribCaroussel from './ContribCaroussel/ContribCaroussel';
import FButton from '../../components/FigmaUI/FButton/FButton'
import {ManLab, diair, FemmeCurly} from '../../assets/figma/index';
import SideTrad from './SideTrad/SideTrad';
import {initializeTimer} from '../Translation/functions';

import {contenu, lorems, menu, filtres, steps, tutoSteps, importantCard} from './data'

import variables from 'scss/colors.scss';

moment.locale('fr');

const sponsorsData = [];
const uiElement = {isHover:false, accordion:false, cardDropdown: false, addDropdown:false};
let user={_id:'', cookies:{}}

class Dispositif extends Component {
  constructor(props) {
    super(props);
    this.initializeTimer = initializeTimer.bind(this);
  }

  state={
    menu: menu.map((x) => {return {...x, type:x.type || 'paragraphe', isFakeContent: true, placeholder: (x.tutoriel || {}).contenu, content: (x.type ? null : x.content), editorState: EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft('').contentBlocks))}}),
    content:contenu,
    sponsors:sponsorsData,
    tags:[],
    mainTag: {darkColor: variables.darkColor, lightColor: variables.lightColor, hoverColor: variables.gris},
    dateMaj:new Date(),
    
    hovers: menu.map((x) => {return {isHover:false, ...( x.children && {children: new Array(x.children.length).fill({isHover:false})})}}),
    showModals:{
      reaction:false,
      fiabilite:false,
      suggerer:false,
      question:false, //correspond au modal suggerer, mais permet de différencier comment on est arrivés là
      signaler:false, //correspond au modal suggerer, mais permet de différencier comment on est arrivés là
      merci:false,
      allGood:false,
      construction:false,
      map:false,
      responsable: false
    },
    accordion: new Array(1).fill(false),
    dropdown: new Array(5).fill(false),
    disableEdit:true,
    tooltipOpen:false,
    uiArray:new Array(menu.length).fill(uiElement),
    showBookmarkModal:false,
    showDispositifCreateModal:false,
    showDispositifValidateModal:false,
    showSpinnerPrint:false,
    showSpinnerBookmark:false,
    suggestion:'',
    mail: '',
    tKeyValue: -1, 
    tSubkey: -1,
    pinned:false,
    user:{},
    isDispositifLoading: true,
    contributeurs:[],
    withHelp:true,
    runFirstJoyRide: false,
    runJoyRide: false,
    stepIndex: 0,
    disableOverlay:false,
    joyRideWidth: 800,
    inputBtnClicked: false,
    mainSponsor:{},
    status: '',
    time: 0,
    initialTime: 0,
  }
  _initialState=this.state;
  newRef=React.createRef();
  mountTime=0;

  componentDidMount (){
    this._initializeDispositif(this.props);
  }

  componentWillReceiveProps(nextProps){
    if(((nextProps.match || {}).params || {}).id !== ((this.props.match || {}).params || {}).id){
      this._initializeDispositif(nextProps);
    }
  }

  componentWillUnmount (){
    clearInterval(this.timer)
  }

  _initializeDispositif = props => {
    this.initializeTimer();
    let itemId=props.match && props.match.params && props.match.params.id;
    console.log(itemId)
    if(itemId){
      this.props.tracking.trackEvent({ action: 'readDispositif', label: "dispositifId", value : itemId });
      API.get_dispositif({_id: itemId},{},'creatorId mainSponsor').then(data_res => {
        let dispositif={...data_res.data.data[0]};
        console.log(dispositif);
        if(dispositif.status === "Brouillon"){
          this.initializeTimer();}
        this.setState({
          _id:itemId,
          menu: dispositif.contenu, 
          content: {titreInformatif:dispositif.titreInformatif, titreMarque: dispositif.titreMarque, abstract: dispositif.abstract, contact: dispositif.contact, externalLink: dispositif.externalLink}, 
          sponsors:dispositif.sponsors,
          tags:dispositif.tags,
          creator:dispositif.creatorId,
          uiArray: dispositif.contenu.map((x) => {return {...uiElement, ...( x.children && {children: new Array(x.children.length).fill(uiElement)})}}),
          dispositif: dispositif,
          disableEdit: dispositif.status !== "Accepté structure" || !props.translating, //A vérifier
          isDispositifLoading: false,
          contributeurs: [dispositif.creatorId].filter(x => x),
          mainTag: (dispositif.tags && dispositif.tags.length >0) ? (filtres.tags.find(x => x.name === dispositif.tags[0].name) || {}) : {},
          mainSponsor: dispositif.mainSponsor,
          status: dispositif.status,
          ...(dispositif.status==="Brouillon" && {initialTime: dispositif.timeSpent}),
        },()=>this.setColors())
        //On récupère les données de l'utilisateur
        if(API.isAuth()){
          API.get_user_info().then(data_res => {
            let u=data_res.data.data;
            user={_id:u._id, cookies:u.cookies || {}}
            this.setState({
              pinned: (user.cookies.dispositifsPinned || []).some( x => x._id === itemId),
              isAuthor: u._id === (dispositif.creatorId || {})._id,
            })
          })
        }
      })
    }else if(API.isAuth()){
      this.initializeTimer();
      this.setState({
        disableEdit:false,
        uiArray: menu.map((x) => {return {...uiElement, ...( x.children && {children: new Array(x.children.length).fill({...uiElement, accordion: true})})}}),
        ///////////////////////////////////
        showDispositifCreateModal:true, //A modifier avant la mise en prod
        isDispositifLoading: false
      },()=>this.setColors());
    }else{ props.history.push({ pathname: '/login', state: {redirectTo:"/dispositif"} }); }
    window.scrollTo(0, 0);
  }

  setColors = () => {
    ["color", "borderColor", "backgroundColor", "fill"].map(s => {
      return ["dark", "light"].map(c => {
        return document.querySelectorAll('.' + s + '-' + c + 'Color').forEach(elem => {
          elem.style[s] = this.state.mainTag[c + 'Color'];
        });
      })
    })
  }

  onInputClicked = ev => {
    const id = ev.currentTarget.id;
    console.log(id)
    if( (id==="titreInformatif" && this.state.content.titreInformatif === contenu.titreInformatif)
        || (id==="titreMarque" && this.state.content.titreMarque === contenu.titreMarque) ){
      this.setState({ content: { ...this.state.content, [id]: ""} })
    }
  }

  handleChange = (ev) => {
    console.log('ici')
    this.setState({ content: {
      ...this.state.content,
      [ev.currentTarget.id]: ev.target.value
     }
    });
  };

  handleKeyPress = (ev, index) => {
    if(ev.key === 'Enter'){
      ev.preventDefault();
      this.setState({ stepIndex: index + 1});
      if( index===0 && this.state.content.titreMarque === contenu.titreMarque ){
        this.setState({ content: { ...this.state.content, titreMarque: ""} });
        document.getElementById("titreMarque").focus();
      }
    }
  };

  handleModalChange = (ev) => this.setState({ [ev.currentTarget.id]: ev.target.value });

  disableIsMapLoaded = (key, subkey) => {
    let state=[...this.state.menu];
    if(state.length > key && state[key].children && state[key].children.length > subkey){
      state[key].children[subkey].isMapLoaded = true;
      this.setState({ menu: state });
    }
  }
  
  handleMenuChange = (ev) => {
    const node=ev.currentTarget;
    let state = [...this.state.menu];
    state[node.id]={
      ...state[node.id],
      ...(!node.dataset.subkey && {content : ev.target.value, isFakeContent:false}), 
      ...(node.dataset.subkey && state[node.id].children && state[node.id].children.length > node.dataset.subkey && {children : state[node.id].children.map((y,subidx) => {return {
            ...y,
            ...(subidx===parseInt(node.dataset.subkey) && { [node.dataset.target || 'content'] : ev.target.value, isFakeContent:false } )
          }
        })
      })
    }
    this.setState({ menu: state });
  };

  handleContentClick = (key, editable, subkey=undefined) => {
    let state=[...this.state.menu];
    if(state.length > key && key >= 0){
      if(editable){  state = state.map(x => ({...x, editable:false, ...(x.editable && x.editorState && x.editorState.getCurrentContent() && x.editorState.getCurrentContent().getPlainText() !== '' && { content: draftToHtml(convertToRaw(x.editorState.getCurrentContent())) } ), ...(x.children && {children: x.children.map(y => ({...y, editable:false}))}) }) );}
      let right_node=state[key];
      if(subkey !==undefined && state[key].children.length > subkey){right_node= state[key].children[subkey];}
      right_node.editable = editable;
      if(editable && right_node.content){
        right_node.editorState = EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(right_node.isFakeContent ? '' : right_node.content).contentBlocks)) ;
      }else if(!editable && right_node.editorState){
        right_node.content=draftToHtml(convertToRaw(right_node.editorState.getCurrentContent()));
      }
      if(right_node.type === 'accordion'){ this.updateUIArray(key, subkey, 'accordion', true) }
      console.log((key, editable, subkey))
      return new Promise(resolve => this.setState( { menu: state },()=>{ this.updateUI(key, subkey, editable) ; resolve()} ));
    }else{return new Promise(r=> r())}
  };

  updateUI = (key, subkey, editable) => {
    if(editable && (subkey===undefined || (subkey===0 && key>1) )){ 
      console.log(key, subkey, editable)
      try{ //On place le curseur à l'intérieur du wysiwyg et on ajuste la hauteur
        let parentNode = document.getElementsByClassName('editeur-' + key + '-' + subkey)[0];
        if(parentNode){
          parentNode.getElementsByClassName('public-DraftEditor-content')[0].focus();
          window.getSelection().addRange( document.createRange() );
          parentNode.getElementsByClassName("DraftEditor-root")[0].style.height = (parentNode.getElementsByClassName("public-DraftEditorPlaceholder-inner")[0] || {}).offsetHeight + "px";
          parentNode.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
          this.setState(pS => ({ joyRideWidth: parentNode.offsetWidth || pS.joyRideWidth }))
        }
      } catch(e){console.log(e)} 
      this.setState({ stepIndex: key + 4, runJoyRide: true, disableOverlay: true, inputBtnClicked: false }) 
    } 
  }

  onEditorStateChange = (editorState, key, subkey=null) => {
    let state=[...this.state.menu];
    if(state.length > key){
      if(subkey!==null && state[key].children.length > subkey){
        state[key].children[subkey].editorState =  editorState;
        state[key].children[subkey].isFakeContent = false;
      }else{
        state[key].editorState =  editorState;
        state[key].isFakeContent = false;
      }
      this.setState({ menu: state });
    }
  };

  updateUIArray=(key, subkey=null, node='isHover', value=true)=>{
    let uiArray = [...this.state.uiArray];
    uiArray = uiArray.map((x,idx) => {
      const updateOthers = this.state.disableEdit || node !=="accordion" ;
      return {
      ...x,
      ...((subkey===null && idx===key && {[node] : value}) || {[node] : false}), 
      ...(x.children && {children : x.children.map((y,subidx) => { return {
            ...y,
            ...((subidx===subkey && idx===key && {[node] : value}) || (updateOthers && {[node] : false}))
          }
        })
      })
    }});
    this.setState({ uiArray: uiArray, tKeyValue: key, tSubkey: subkey });
  }

  addItem=(key, type='paragraphe', subkey=null)=>{
    let prevState = [...this.state.menu];
    let uiArray = [...this.state.uiArray];
    if(prevState[key].children && prevState[key].children.length > 0){
      let newChild={...prevState[key].children[prevState[key].children.length - 1]};
      if(type==='card' && newChild.type!=='card'){
        prevState[key].type='cards';
        newChild={type:'card', isFakeContent: true,title:'Important !',titleIcon:'warning',contentTitle: 'Compte bancaire', contentBody:'nécessaire pour recevoir l’indemnité', footer:'Pourquoi ?',footerIcon:'question-mark-circle-outline'};
      }else if(type==='accordion' && !newChild.content){
        newChild={type:'accordion', isFakeContent: true, title:'Un exemple d\'accordéon', placeholder: lorems.sousParagraphe,content: ''};
      }else if(type==='map'){
        newChild={type:'map', isFakeContent: true, isMapLoaded:false, markers: [{nom: "Test Paris", ville: "Paris", description: "Antenne locale de Test", latitude: "48.856614", longitude: "2.3522219"}]};
      }else if(type === 'paragraph' && !newChild.content){
        newChild={title:'Un exemple de paragraphe', isFakeContent: true, placeholder: lorems.sousParagraphe,content: '', type:type}
      }
      newChild.type=type;
      if(subkey === null || subkey === undefined){
        prevState[key].children.push(newChild)
      }else{
        prevState[key].children.splice(subkey+1,0,newChild)
      }
    }else{
      if(type==='card'){
        prevState[key].type='cards';
        prevState[key].children=[{type:'card', isFakeContent: true,title:'Important !',titleIcon:'warning',contentTitle: 'Compte bancaire', contentBody:'nécessaire pour recevoir l’indemnité', footer:'Pourquoi ?',footerIcon:'question-mark-circle-outline'}];
      }else if(type==='map'){
        prevState[key].children=[{type:'map', isFakeContent: true, isMapLoaded:false, markers: [{nom: "Test Paris", ville: "Paris", description: "Antenne locale de Test", latitude: "48.856614", longitude: "2.3522219"}]}];
      }else{
        prevState[key].children=[{title:'Nouveau sous-paragraphe', type:type,content: lorems.sousParagraphe}];
      }
    }
    uiArray[key].children= [...(uiArray[key].children || []), {...uiElement, accordion: true}];
    this.setState({ menu: prevState, uiArray: uiArray }, () => (type === "card" || type==="map") && this.setColors() );
  }

  removeItem=(key, subkey=null)=>{
    let prevState = [...this.state.menu];
    let uiArray = [...this.state.uiArray];
    if(prevState[key].children && prevState[key].children.length > 0 && (prevState[key].children.length > 1 || prevState[key].content)){
      if(subkey === null || subkey === undefined){
        prevState[key].children.pop();
        uiArray[key].children.pop();
      }else if(prevState[key].children.length > subkey){
        prevState[key].children.splice(subkey,1);
        uiArray[key].children.splice(subkey,1);
      }
    }
    this.setState({ menu: prevState });
  }

  deleteCard=(key,subkey)=>{
    const prevState = [...this.state.menu];
    prevState[key].children = prevState[key].children.filter((x, index) => index !== subkey);
    this.setState({
      menu: prevState,
    });
  }

  toggleModal = (show, name) => {
    this.props.tracking.trackEvent({ action: 'toggleModal', label: name, value : show });
    if(name==='merci' && this.state.showModals.merci){
      Swal.fire( {title: 'Yay...', text: 'Votre suggestion a bien été enregistrée, merci', type: 'success', timer: 1500})
    }
    this.setState(prevState=>({showModals:{...prevState.showModals,[name]:show}, suggestion:''}))
  }

  toggleTooltip = () => {
    this.props.tracking.trackEvent({ action: 'toggleTooltip', label: 'tooltipOpen', value : !this.state.tooltipOpen });
    this.setState({ tooltipOpen: !this.state.tooltipOpen});
  }

  toggleBookmarkModal = () => this.setState(prevState=>({showBookmarkModal:!prevState.showBookmarkModal}))
  toggleDispositifCreateModal = () => this.setState(prevState=>({showDispositifCreateModal:!prevState.showDispositifCreateModal}))
  toggleDispositifValidateModal = () => this.setState(prevState=>({showDispositifValidateModal:!prevState.showDispositifValidateModal}))
  toggleInputBtnClicked = () => this.setState(prevState=>({inputBtnClicked:!prevState.inputBtnClicked}))
  
  toggleNiveau = (nv, key, subkey) => {
    let niveaux = _.get(this.state.menu, key + ".children." + subkey + ".niveaux", [])
    niveaux = niveaux.some( x => x===nv) ? niveaux.filter(x => x!==nv) : [...niveaux, nv]
    this.setState({menu: [...this.state.menu].map( (x,i) => i===key ? {...x, children: x.children.map((y,ix) => ix === subkey ? {...y, niveaux: niveaux} : y)} : x) })
  }

  toggleFree = (key, subkey) => this.setState({menu: [...this.state.menu].map( (x,i) => i===key ? {...x, children: x.children.map((y,ix) => ix === subkey ? {...y, free: !y.free} : y)} : x) })
  changePrice = (e, key, subkey) => this.setState({menu: [...this.state.menu].map( (x,i) => i===key ? {...x, children: x.children.map((y,ix) => ix === subkey ? {...y, price: e.target.value} : y)} : x) })
  changeAge = (e, key, subkey, isBottom=true) => this.setState({menu: [...this.state.menu].map( (x,i) => i===key ? {...x, children: x.children.map((y,ix) => ix === subkey ? {...y, [isBottom ? "bottomValue" : "topValue"]: (e.target.value || "").replace(/\D/g, ''), isFakeContent: false} : y)} : x) })
  setMarkers = (markers, key, subkey) => this.setState({menu: [...this.state.menu].map( (x,i) => i===key ? {...x, children: x.children.map((y,ix) => ix === subkey ? {...y, markers: markers} : y)} : x) })

  startFirstJoyRide = () => this.setState({showDispositifCreateModal: false, runFirstJoyRide: true});
  startJoyRide = (idx = 0) => this.setState({runJoyRide: true, stepIndex:idx});

  toggleHelp = () => this.setState(prevState=>({withHelp:!prevState.withHelp}))

  bookmarkDispositif = () => {
    this.setState({showSpinnerBookmark:true})
    if(API.isAuth()){
      if(this.state.pinned){
        user.cookies.dispositifsPinned = user.cookies.dispositifsPinned.filter(x => x._id !== this.state.dispositif._id)
      }else{
        user.cookies.dispositifsPinned=[...(user.cookies.dispositifsPinned || []), {...this.state.dispositif, pinned:true, datePin: new Date()}];
      }
      API.set_user_info(user).then((data) => {
        this.setState({
          showSpinnerBookmark: false,
          showBookmarkModal: !this.state.pinned,
          pinned: !this.state.pinned
        })
      })
    }else{Swal.fire( {title: 'Oh non!', text: 'Vous devez être connecté pour utiliser cette fonctionnalité', type: 'error', timer: 1500})}
  }

  changeCardTitle = (key, subkey, node, value) => {
    const prevState = [...this.state.menu];
    if(node==="title"){
      prevState[key].children[subkey] = [...menu[1].children, importantCard].find(x => x.title === value);
    }else{
      prevState[key].children[subkey][node]=value;
    }
    this.setState({ menu: prevState });
  }

  changeTag = (key, value) => {
    this.setState({ 
      tags: this.state.tags.map((x,i)=> i===key ? value : x), 
      ...(key===0 && {mainTag: filtres.tags.find( x => x.short === value.short) } ) 
    }, () => {
      if(key===0){ this.setColors(); }
    });
  }

  addTag = () => this.setState({ tags: [...this.state.tags, 'Autre'] });
  deleteTag = (idx) => this.setState({ tags: [...this.state.tags].filter((_,i) => i!==idx) });

  handleJoyrideCallback = data => {
    const { action, index, type, lifecycle, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || (action === ACTIONS.CLOSE  && type === EVENTS.STEP_AFTER)) {
      this.setState({ runJoyRide: false, disableOverlay: false });
    }else if(((action === ACTIONS.NEXT && index >= 3) || index > 4) && index < 7 && type === EVENTS.STEP_AFTER && lifecycle === "complete"){
      const key = index - 3 + (action === ACTIONS.PREV ? -2 : 0);
      this.handleContentClick(key, true, key>1 ? 0 : undefined);
    } else if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const stepIndex = index + (action === ACTIONS.PREV ? -1 : 1); 
      const inputBtnClicked= ((action === ACTIONS.NEXT && index === 2) || (action === ACTIONS.PREV && index===4))
      this.setState({ stepIndex, disableOverlay: index>3, inputBtnClicked});
      if(tutoSteps[stepIndex] && tutoSteps[stepIndex].target && tutoSteps[stepIndex].target.includes("#") && document.getElementById(tutoSteps[stepIndex].target.replace("#", ""))){
        const cible = document.getElementById(tutoSteps[stepIndex].target.replace("#", ""));
        cible.focus();
        cible.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
      }
    }
  };

  handleFirstJoyrideCallback = data => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      this.setState({ runJoyRide: true, runFirstJoyRide: false });
    }
  };

  addSponsor = sponsor => this.setState({sponsors: [...this.state.sponsors.filter(x => !x.dummy), sponsor]})
  deleteSponsor = key => {
    if(this.state.status === "Accepté structure"){
      Swal.fire( {title: 'Oh non!', text: 'Vous ne pouvez plus supprimer de structures partenaires', type: 'error', timer: 1500}); return;
    }
    this.setState({ sponsors: [...this.state.sponsors].filter( (_,i) => i !== key) });
  }

  goBack = () => {
    this.props.tracking.trackEvent({ action: 'click', label: 'goBack' });
    this.props.history.push("/advanced-search");
  }

  createPdf = () => {
    this.props.tracking.trackEvent({ action: 'click', label: 'createPdf' });
    let uiArray = [...this.state.uiArray];
    uiArray = uiArray.map(x => ({ ...x, accordion : true,  ...(x.children && {children : x.children.map(y => { return { ...y, accordion : true } }) }) }));
    this.setState({ uiArray: uiArray, showSpinnerPrint:true }, ()=>{
      setTimeout(()=>{
        savePDF(this.newRef.current, { 
          fileName: 'dispositif' + ((this.state.content && this.state.content.titreMarque) ? (' - ' + this.state.content.titreMarque) : '') +'.pdf',
          scale:.5
        })
        this.setState({showSpinnerPrint: false})
      }, 3000);
    })
  }

  editDispositif = () => this.setState({disableEdit: false}, ()=>this.setColors())

  pushReaction = (modalName=null, fieldName) => {
    if(modalName){this.toggleModal(false, modalName);}
    let dispositif = {
      dispositifId: this.state._id,
      keyValue: this.state.tKeyValue, 
      subkey: this.state.tSubkey,
      fieldName: fieldName,
      type:'push',
      ...(this.state.suggestion && {suggestion: h2p(this.state.suggestion)})
    }
    API.update_dispositif(dispositif).then(data => {
      if(modalName === 'reaction'){
        Swal.fire( {title: 'Yay...', text: 'Votre réaction a bien été enregistrée, merci', type: 'success', timer: 1500})
      }else if(API.isAuth()){
        Swal.fire( {title: 'Yay...', text: 'Votre suggestion a bien été enregistrée, merci', type: 'success', timer: 1500})
      }else{
        this.toggleModal(true, 'merci');
      }
    })
  }

  update_status = status => {
    let dispositif = {
      status:status,
      dispositifId:this.state._id
    }
    API.add_dispositif(dispositif).then((data) => {
      this.props.fetch_dispositifs();
      this.setState({status: status, disableEdit: status !== "Accepté structure"})
      if(status==="Rejeté structure"){
        this.props.history.push("/backend/user-dash-structure");
      }
    });
  }

  valider_dispositif = (status='En attente') => {
    let content = {...this.state.content}
    Object.keys(content).map( k => content[k] = h2p(content[k]));
    console.log(this.state._id, this.state.status, status)
    let dispositif = {
      ...content,
      contenu : [...this.state.menu].map(x=> {return {title: x.title, content : x.content, type:x.type, ...(x.children && {children : x.children.map(x => ({...x, editable: false, ...(x.title && {title: h2p(x.title)})}))}) }}),
      sponsors:(this.state.sponsors || []).filter(x => !x.dummy),
      tags: this.state.tags,
      avancement: 1,
      status: status,
      dispositifId: this.state._id,
      ...(!this.state._id && this.state.status!=="Brouillon" && {timeSpent : this.state.time}),
    }
    let cardElement=(this.state.menu.find(x=> x.title==='C\'est pour qui ?') || []).children || [];
    dispositif.audience = cardElement.some(x=> x.title==='Public visé') ?
      cardElement.filter(x=> x.title==='Public visé').map(x => x.contentTitle) :
      filtres.audience;
    dispositif.audienceAge= cardElement.some(x=> x.title==='Âge requis') ? 
      cardElement.filter(x=> x.title==='Âge requis').map(x => ({contentTitle: x.contentTitle, bottomValue: x.bottomValue, topValue:x.topValue})) :
      [{contentTitle: "Plus de ** ans", bottomValue: -1, topValue: 999}];
    dispositif.niveauFrancais= cardElement.some(x=> x.title==='Niveau de français') ?
      cardElement.filter(x=> x.title==='Niveau de français').map(x => x.contentTitle) :
      filtres.niveauFrancais;
    dispositif.cecrlFrancais= cardElement.some(x=> x.title==='Niveau de français') ?
      [...new Set(cardElement.filter(x=> x.title==='Niveau de français').map(x => x.niveaux).reduce((acc, curr) => [...acc, ...curr]))] :
      [];
    dispositif.isFree= cardElement.some(x=> x.title==='Combien ça coûte ?') ?
      cardElement.find(x=> x.title==='Combien ça coûte ?').free :
      true;
    if(this.state.status && this.state.status!== '' && this.state._id){
      dispositif.status = this.state.status;
    }else if(dispositif.sponsors &&  dispositif.sponsors.length > 0){
      dispositif.mainSponsor = dispositif.sponsors[0]._id;
      //Si l'auteur appartient à la structure principale je la fait passer directe en validation
      const membre = (dispositif.sponsors[0].membres || []).find(x => x.userId === this.props.userId);
      if(membre && membre.roles && membre.roles.some(x => x==="administrateur" || x==="contributeur")){
        dispositif.status = "En attente admin";
      }
    }else{
      dispositif.status = "En attente non prioritaire";
    }
    console.log(dispositif)
    API.add_dispositif(dispositif).then((data) => {
      Swal.fire( 'Yay...', 'Enregistrement réussi !', 'success').then(() => {
        this.props.fetch_user();
        this.props.fetch_dispositifs();
        this.setState({disableEdit: status === 'En attente admin' || status === 'En attente'}, () => {
          this.props.history.push("/dispositif/" + data.data.data._id)
        })
      });
    })
  }

  upcoming = () => Swal.fire( {title: 'Oh non!', text: 'Cette fonctionnalité n\'est pas encore disponible', type: 'error', timer: 1500 })

  render(){
    const {t, translating} = this.props;
    const {showModals, isDispositifLoading, runFirstJoyRide, runJoyRide, stepIndex, disableOverlay, joyRideWidth, withHelp, disableEdit, mainTag} = this.state;
    
    const Tooltip = ({
      index,
      step,
      backProps,
      primaryProps,
      tooltipProps,
      closeProps,
      isLastStep
    }) => {
      if(step){ return (
      <div
        key="JoyrideTooltip"
        className="tooltip-wrapper custom-tooltip" 
        style={{width: joyRideWidth + "px", /*backgroundColor: mainTag.darkColor,*/ marginRight: "40px"}}
        {...tooltipProps}>
        <div className="tooltipContainer">
          <b>{step.title}</b> : {step.content}
        </div>
        <div className="tooltipFooter">
          <ul className="nav nav-tabs" role="tablist">
            {tutoSteps.map((_,idx) => (
              <li role="presentation" className={idx <= stepIndex ? "active" : "disabled"} key={idx}>
                <span className="round-tab" />
              </li>
            ))}
          </ul>
          {index > 0 && 
            <FButton onMouseEnter={e => e.target.focus()} type="pill" className="mr-10" name="arrow-back-outline" fill="#FFFFFF" {...backProps} /> }
          <FButton
            onMouseEnter={e => e.target.focus()} 
            {...primaryProps}>
            {isLastStep ? 
              <span>Terminer</span> : 
              <span>
                Suivant
                <EVAIcon name="arrow-forward-outline" fill={variables.grisFonce} className="ml-10" />
              </span>}
          </FButton>
        </div>
        <EVAIcon onMouseEnter={e => e.currentTarget.focus()} {...closeProps} name="close-outline" className="close-icon" />
      </div>
    )}else{return false}};

    return(
      <div className={"animated fadeIn dispositif" + (!disableEdit ? " edition-mode" : translating ? " side-view-mode" : " reading-mode")} ref={this.newRef}>
        {/* First general tour */}
        <ReactJoyride
          continuous
          steps={steps}
          run={!disableEdit && withHelp && runFirstJoyRide}
          scrollToFirstStep
          showProgress
          showSkipButton
          callback={this.handleFirstJoyrideCallback}
          tooltipComponent={FirstTooltip}
          disableOverlayClose={true}
        />
        {/* Second guided tour */}
        <ReactJoyride
          continuous
          steps={tutoSteps}
          run={!disableEdit && withHelp && runJoyRide}
          showProgress
          disableOverlay={disableOverlay}
          disableOverlayClose={true}
          spotlightClicks={true}
          callback={this.handleJoyrideCallback}
          stepIndex={stepIndex}
          tooltipComponent={Tooltip}
          debug={false}
          styles={{
            options: {
              arrowColor: mainTag.darkColor
            },
          }}
          joyRideWidth={joyRideWidth}
          mainTag={mainTag}
        />

        <Row className="main-row">
          {translating && 
            <Col lg={translating ? "4" : "0"} className="side-col">
              <SideTrad 
                menu={this.state.menu}
                content={this.state.content}
                updateUIArray={this.updateUIArray}
                {...this.props}
              />
            </Col>}
          <Col lg={translating ? "8" : "12"} className="main-col">
            <section className="banniere-dispo">
              <Row className="header-row">
                <Col lg="6" md="6" sm="12" xs="12" className="top-left" onClick={this.goBack}>
                  <Button color="warning" outline>
                    <EVAIcon name="corner-up-left-outline" fill={mainTag.darkColor} className="icons" />
                    <span>{t("Retour à la recherche")}</span>
                  </Button>
                </Col>
                <TopRightHeader 
                  validateStructure={false}
                  disableEdit={this.state.disableEdit} 
                  withHelp={this.state.withHelp}
                  showSpinnerBookmark={this.state.showSpinnerBookmark}
                  pinned={this.state.pinned}
                  isAuthor={this.state.isAuthor}
                  status={this.state.status}
                  mainSponsor={this.state.mainSponsor}
                  userId={this.props.userId}
                  update_status={this.update_status}
                  bookmarkDispositif={this.bookmarkDispositif}
                  toggleHelp={this.toggleHelp}
                  toggleModal={this.toggleModal}
                  toggleDispositifValidateModal={this.toggleDispositifValidateModal}
                  editDispositif = {this.editDispositif}
                  valider_dispositif={this.valider_dispositif}
                  toggleDispositifCreateModal={this.toggleDispositifCreateModal}
                  admin={this.props.admin}
                  translating={translating} />
              </Row>
              <FemmeCurly height="300" className="header-img femme-icon" alt="femme" />
              <Col lg="12" md="12" sm="12" xs="12" className="post-title-block">
                <div className="bloc-titre">
                  <h1 className={this.state.disableEdit ? "" : "editable"}>
                    <ContentEditable
                      id='titreInformatif'
                      html={this.state.content.titreInformatif}  // innerHTML of the editable div
                      disabled={this.state.disableEdit}
                      onClick={e=>{this.startJoyRide(); this.onInputClicked(e)}}
                      onChange={this.handleChange}
                      onMouseEnter={e => e.target.focus()} 
                      onKeyPress={e=>this.handleKeyPress(e, 0)}
                    />
                  </h1>
                  <h2 className="bloc-subtitle">
                    <span>{t("avec")}&nbsp;</span>
                    <ContentEditable
                      id='titreMarque'
                      html={this.state.content.titreMarque}  // innerHTML of the editable div
                      disabled={this.state.disableEdit}
                      onClick={e=>{this.startJoyRide(1); this.onInputClicked(e)}}
                      onChange={this.handleChange} 
                      onKeyDown={this.onInputClicked}
                      onMouseEnter={e => e.target.focus()} 
                      onKeyPress={e=>this.handleKeyPress(e, 1)}
                    />
                  </h2>
                </div>
              </Col>
              <ManLab height="250" className="header-img homme-icon" alt="homme" />
            </section>
            <Row className="tags-row backgroundColor-darkColor">
              <Col lg="7" md="7" sm="7" xs="7" className="col right-bar">
                <Row>
                  <b className="en-bref mt-10">{t("En bref")} </b>
                  {((this.state.menu.find(x=> x.title==='C\'est pour qui ?') || []).children || []).map((card, key) => {
                    if(card.type==='card'){
                      let texte = card.contentTitle;
                      if(card.title==='Âge requis'){
                        texte = (card.contentTitle === 'De ** à ** ans') ? 'De ' + card.bottomValue + ' à ' + card.topValue + ' ans' :
                                            (card.contentTitle === 'Moins de ** ans') ? 'Moins de ' + card.topValue + ' ans' :
                                            'Plus de ' + card.bottomValue + ' ans';
                      }else if(card.title === 'Combien ça coûte ?'){
                        texte = card.free ? "gratuit" : (card.price + " € " + card.contentTitle)
                      }
                      return (
                        <div className="tag-wrapper" key={key}>
                          <div className="tag-item">
                            <a href={'#item-head-1'} className="no-decoration">
                              {card.typeIcon==="eva" ?
                                <EVAIcon name={card.titleIcon} fill="#FFFFFF"/> :
                                <SVGIcon fill="#FFFFFF" width="20" height="20" viewBox="0 0 25 25" name={card.titleIcon} />}
                              <span>{texte}</span>
                            </a>
                          </div>
                        </div>
                      )
                    }else{return false}
                  })}
                </Row>
              </Col>
              <Col lg="5" md="5" sm="5" xs="5" className="tags-bloc">
                <Tags tags={this.state.tags} filtres={filtres.tags} disableEdit={this.state.disableEdit} changeTag={this.changeTag} addTag={this.addTag} deleteTag={this.deleteTag} history={this.props.history} />
              </Col>
            </Row>
            <Row>
              <Col className={"left-side-col pt-40" + (translating ? " sideView" : "")} lg="3" md="3" sm="3" xs="12">
                <LeftSideDispositif
                  menu={this.state.menu}
                  accordion={this.state.accordion}
                  showSpinner={this.state.showSpinnerPrint}
                  content={this.state.content}
                  inputBtnClicked = {this.state.inputBtnClicked}
                  disableEdit = {this.state.disableEdit}
                  toggleInputBtnClicked={this.toggleInputBtnClicked}
                  handleScrollSpy={this.handleScrollSpy}
                  createPdf={this.createPdf}
                  newRef={this.newRef}
                  handleChange = {this.handleChange}
                />
              </Col>
              <Col className="pt-40 col-middle" lg={translating ? "12" : "7"} md={translating ? "12" : "7"} sm={translating ? "12" : "7"} xs={translating ? "12" : "7"}>
                {disableEdit && <Row className="fiabilite-row">
                  <Col lg="auto" md="auto" sm="auto" xs="auto" className="col align-right">
                    {t("Dernière mise à jour")} :&nbsp;<span className="date-maj">{moment(this.state.dateMaj).format('ll')}</span>
                  </Col>
                  <Col className="col">
                    {t("Fiabilité de l'information")} :&nbsp;<span className="fiabilite">{t("Faible")}</span>
                    <EVAIcon className="question-bloc" id="question-bloc" name="question-mark-circle" fill="#E55039"  onClick={()=>this.toggleModal(true, 'fiabilite')} />
                    
                    <Tooltip placement="top" isOpen={this.state.tooltipOpen} target="question-bloc" toggle={this.toggleTooltip} onClick={()=>this.toggleModal(true, 'fiabilite')}>
                      {t("Dispositif.fiabilite_faible_1")} <b>{t("Dispositif.fiabilite_faible_2")}</b> {t("Dispositif.fiabilite_faible_3")}{' '}
                      {t("Dispositif.cliquez")}
                    </Tooltip>
                  </Col>
                </Row>}
                <ContenuDispositif 
                  updateUIArray={this.updateUIArray}
                  handleContentClick={this.handleContentClick}
                  handleMenuChange={this.handleMenuChange}
                  onEditorStateChange={this.onEditorStateChange}
                  toggleModal={this.toggleModal}
                  deleteCard={this.deleteCard}
                  addItem={this.addItem}
                  removeItem={this.removeItem}
                  changeTitle={this.changeCardTitle}
                  disableIsMapLoaded={this.disableIsMapLoaded}
                  toggleNiveau={this.toggleNiveau}
                  changeAge = {this.changeAge}
                  changePrice={this.changePrice}
                  toggleFree = {this.toggleFree}
                  setMarkers = {this.setMarkers}
                  filtres={filtres}
                  sideView={translating}
                  {...this.state}
                />
                
                {this.state.disableEdit &&
                  <>
                    <div className="feedback-footer">
                      <div>
                        <h5 className="color-darkColor">{t("Dispositif.informations_utiles")}</h5>
                        <span className="color-darkColor">{t("Dispositif.remerciez")}&nbsp;:</span>
                      </div>
                      <div>
                        <Button color="light" className="thanks-btn" onClick={()=>this.pushReaction(null, "merci")}>
                          {t("Merci")} <span role="img" aria-label="merci">🙏</span>
                        </Button>
                        <Button color="light" className="down-btn" onClick={()=>this.pushReaction(null, "pasMerci")}>
                          <span role="img" aria-label="merci">👎</span>
                        </Button>
                      </div>
                    </div>
                    <div className="discussion-footer backgroundColor-darkColor">
                      <h5>{t("Dispositif.Avis")}</h5>
                      <span>{t("Dispositif.bientot")}</span>
                    </div>
                    {this.state.contributeurs.length>0 && 
                      <div className="bottom-wrapper">
                        <ContribCaroussel 
                          contributeurs={this.state.contributeurs}
                        />

                        {!this.state.disableEdit &&
                          <div className="ecran-protection">
                            <div className="content-wrapper">
                              <Icon name="alert-triangle-outline" fill="#FFFFFF" />
                              <span>Ajout des contributeurs <u className="pointer" onClick={()=>this.toggleModal(true, 'construction')}>disponible prochainement</u></span>
                            </div>
                          </div>}
                      </div>}
                  </>
                }

                <Sponsors 
                  sponsors={this.state.sponsors} 
                  disableEdit={this.state.disableEdit}
                  addSponsor = {this.addSponsor}
                  deleteSponsor={this.deleteSponsor}
                  t={t}  />
                

                {false && <Commentaires />}
              </Col>
              <Col lg="2" md="2" sm="2" xs="2" className={"aside-right pt-40" + (translating ? " sideView" : "")} />
            </Row>
            
            <ReagirModal name='reaction' show={showModals.reaction} toggleModal={this.toggleModal} onValidate={this.pushReaction} />
            <SuggererModal showModals={showModals} toggleModal={this.toggleModal} onChange={this.handleModalChange} suggestion={this.state.suggestion} onValidate={this.pushReaction} />
            <MerciModal name='merci' show={showModals.merci} toggleModal={this.toggleModal} onChange={this.handleModalChange} mail={this.state.mail} />
            <EnConstructionModal name='construction' show={showModals.construction} toggleModal={this.toggleModal} />
            <ResponsableModal name='responsable' show={showModals.responsable} toggleModal={this.toggleModal} createur={this.state.creator} mainSponsor={this.state.mainSponsor} editDispositif={this.editDispositif} update_status={this.update_status} />

            <Modal isOpen={this.state.showModals.fiabilite} toggle={()=>this.toggleModal(false, 'fiabilite')} className='modal-fiabilite'>
              <h1>{t("Dispositif.fiabilite")}</h1>
              <div className="liste-fiabilite">
                <Row>
                  <Col lg="4" className="make-it-red">
                    {t("Faible")}
                  </Col>
                  <Col lg="8">
                    L’information a été rédigée par un contributeur qui n’est pas directement responsable et n’a pas été validée par l’autorité compétente.
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" className="make-it-orange">
                    {t("Moyenne")}
                  </Col>
                  <Col lg="8">
                    L’information a été rédigée par un contributeur qui n’est pas directement responsable et n’a pas été validée par l’autorité compétente.
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" className="make-it-green">
                    {t("Forte")}
                  </Col>
                  <Col lg="8">
                    L’information a été rédigée par un contributeur qui n’est pas directement responsable et n’a pas été validée par l’autorité compétente.
                  </Col>
                </Row>
              </div>
            </Modal>

            <BookmarkedModal 
              showBookmarkModal={this.state.showBookmarkModal}
              toggleBookmarkModal={this.toggleBookmarkModal}
            />
            <DispositifCreateModal 
              show={this.state.showDispositifCreateModal}
              toggle={this.toggleDispositifCreateModal}
              upcoming = {this.upcoming}
              startFirstJoyRide={this.startFirstJoyRide}
            />
            <DispositifValidateModal
              show={this.state.showDispositifValidateModal}
              toggle={this.toggleDispositifValidateModal} 
              abstract={this.state.content.abstract} 
              onChange={this.handleChange}
              validate={this.valider_dispositif}
            />

            {isDispositifLoading &&
              <div className="ecran-protection no-main">
                <div className="content-wrapper">
                  <h1 className="mb-3">Chargement...</h1>
                  <Spinner color="success" />
                </div>
              </div>}

          </Col>
        </Row>
      </div>
    );
  }
}

const FirstTooltip = ({
  index,
  step,
  backProps,
  primaryProps,
  tooltipProps,
  closeProps
}) => {
  if(step){ return (
  <div
    key="FirstJoyrideTooltip"
    className="first-tooltip-wrapper custom-tooltip" 
    {...tooltipProps}>
    <div className="tooltipContainer">
      <h3 className="tooltipTitle" aria-label={step.title}>
        {step.title}
      </h3>
      <div className="tooltipContent">{step.content}</div>
    </div>
    <div className="tooltipFooter">
      <ul className="nav nav-tabs" role="tablist">
        {steps.map((_,idx) => (
          <li role="presentation" className={idx <= index ? "active" : "disabled"} key={idx}>
            <span className="round-tab" />
          </li>
        ))}
      </ul>
      {index > 0 && 
        <FButton  type="pill pill-dark" className="mr-10" name="arrow-back-outline" fill={variables.noir} {...backProps} /> }
      <FButton type="pill pill-dark" name="arrow-forward-outline" fill={variables.noir} {...primaryProps} />
    </div>
    <EVAIcon {...closeProps} fill={variables.noir} name="close-outline" className="close-icon" />
  </div>
)}else{return false}};

const mapStateToProps = (state) => {
  return {
    languei18nCode: state.langue.languei18nCode,
    user: state.user.user,
    userId: state.user.userId,
    admin: state.user.admin,
  }
}

const mapDispatchToProps = {fetch_dispositifs, fetch_user};

export default track({
    page: 'Dispositif',
  })(
    connect(mapStateToProps, mapDispatchToProps)(
      withTranslation()(Dispositif)
    )
  );