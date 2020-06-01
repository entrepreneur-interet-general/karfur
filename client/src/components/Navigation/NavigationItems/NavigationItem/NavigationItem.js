import React from "react";
import { NavLink } from "react-router-dom";

import "./NavigationItem.scss";

const navigationItem = (props) => (
  <li className="NavigationItem">
    <NavLink to={props.link} onClick={props.closed} exact>
      {props.children}
    </NavLink>
  </li>
);

export default navigationItem;
