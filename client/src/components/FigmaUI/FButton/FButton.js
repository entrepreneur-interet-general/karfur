import React, {Component} from 'react';

import './FButton.scss';
import EVAIcon from '../../UI/EVAIcon/EVAIcon';

const defaultProps = {
  type: 'default',
  tag: 'button',
};

class FButton extends Component { //Je passe par une classe parce que le bouton d'impression passe des refs dans ses "children"
  render() {
    //Possible types: default, dark, validate, outline (retour, en blanc), outline-black, pill (vocal), light-action (light-PDF), theme (ac couleur de theme dark), error (rouge), help (rouge clair)
    let {type, className, fill, name, size, tag: Tag, ...bProps}= this.props;
    if (bProps.href && Tag === 'button') { Tag = 'a'; }
    return (
      <Tag className={'figma-btn ' + (type || '') + ' ' + (className || '') + (type === "theme" ? " backgroundColor-darkColor" : "")} {...bProps}>
        {name && 
          <EVAIcon name={name} fill={fill} size={size} className={this.props.children ? "mr-10" : ""} />}
        {this.props.children}
      </Tag>
    )
  }
};

FButton.defaultProps = defaultProps;

export default FButton;