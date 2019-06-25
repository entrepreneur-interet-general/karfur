import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as eva from "eva-icons";

import "./styles.css";

const SIZE = {
  SMALL: '12px',
  MEDIUM: '20px',
  LARGE: '24px',
  XLARGE: '30px',
};

class EVAIcon extends Component {

  componentDidMount() {
    this.setupEvaIcons();
  }

  componentDidUpdate() {
    this.setupEvaIcons();
  }

  setupEvaIcons() {
    const {
      fill,
      size,
    } = this.props;

    const dims = this.updateDims(size);

    const config = {
      fill,
      width: dims,
      height: dims,
    };

    eva.replace(config);
  }

  updateDims(size) {
    switch (size) {
      case 'small':
        return SIZE.SMALL;
      case 'medium':
        return SIZE.MEDIUM;  
      case 'large':
        return SIZE.LARGE;
      case 'xlarge':
        return SIZE.XLARGE;
      default:
        return SIZE.MEDIUM;
    }
  }

  render() {
    const {
      name,
      fill,
      size,
      ...props
    } = this.props;

    const dims = this.updateDims(size);
    
    const icon = (
      <span key={this.props.name} {...props}>
        <i 
          data-eva={name}
          data-eva-fill={fill}
          data-eva-height={dims}
          data-eva-width={dims}
        />
      </span>
    );
    
    return(icon);
  }
}

EVAIcon.propTypes = {
  fill: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.string,
};

EVAIcon.defaultProps = {
  fill: '#fff',
  name: '',
  size: 'medium',
};

export default EVAIcon;