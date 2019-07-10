import React, {Component} from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import EVAIcon from '../../../components/UI/EVAIcon/EVAIcon';

import './Tags.scss';
import variables from 'scss/colors.scss';

class Tags extends Component {
  state= {
    isDropdownOpen: new Array(this.props.tags.length).fill(false),
  }

  toggleDropdown = (e, key) => {
    if(this.state.isDropdownOpen[key] && e.currentTarget.id){
      this.props.changeTag(key, e.target.innerText)
    }
    this.setState({ isDropdownOpen: this.state.isDropdownOpen.map((x,i)=> i===key ? !x : false)})
  };

  addTag = () => {
    this.setState({isDropdownOpen:[...this.state.isDropdownOpen,false]})
    this.props.addTag();
  }

  removeTag = (idx) => {
    this.setState({isDropdownOpen:[...this.state.isDropdownOpen].filter((_,i) => i!==idx)})
    this.props.deleteTag(idx);
  }

  render(){
    return(
      <div className="tags">
        {(this.props.tags || []).map((tag, key) => {
          let shortTag = (this.props.filtres.find(x => x.name ===tag ) || {} ).short
          return (
            <ButtonDropdown isOpen={!this.props.disableEdit && this.state.isDropdownOpen[key]} toggle={(e)=>this.toggleDropdown(e, key)} className="tags-dropdown" key={key}>
              <DropdownToggle caret={!this.props.disableEdit}>
                {shortTag || tag}
              </DropdownToggle>
              <DropdownMenu>
                {this.props.filtres.map((e, i) => {
                  return (
                    <DropdownItem key={i} id={i}>
                      {e.short || e.name}
                    </DropdownItem>
                  )} 
                )}
              </DropdownMenu>
              {!this.props.disableEdit && 
                <div className="tags-icons">
                  <div onClick={()=>this.removeTag(key)}>
                    <EVAIcon name="minus-circle" fill={variables.noirCD} className="delete-icon" size="xlarge"/>
                  </div>
                </div>}
            </ButtonDropdown>
          )}
        )}
        {!this.props.disableEdit && 
          <Button className="plus-button ml-10" onClick={this.addTag}>
            <EVAIcon className="mr-10" name="plus-circle-outline" fill="#CDCDCD" />
            Ajouter un tag
          </Button>}
      </div>
    )
  }
}

export default Tags;