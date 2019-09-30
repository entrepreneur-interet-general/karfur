import React from 'react';
import {TabPane} from 'reactstrap';

import UsersTab from './UsersTab/UsersTab';
import LanguesTab from './LanguesTab/LanguesTab';
import ThemesTab from './ThemesTab/ThemesTab';
import StructuresTab from './StructuresTab/StructuresTab';

const customTabPane = (props) => {
  return(
    <>
      <TabPane tabId="1">
        <UsersTab {...props}/>
      </TabPane>
      <TabPane tabId="2">
        <LanguesTab {...props} />
      </TabPane>
      <TabPane tabId="3">
        <ThemesTab {...props} />
      </TabPane>
      <TabPane tabId="4">
        <StructuresTab {...props} />
      </TabPane>
    </>
  )
}

export default customTabPane;