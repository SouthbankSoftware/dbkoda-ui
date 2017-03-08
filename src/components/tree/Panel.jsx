/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T15:51:31+11:00
*/

import React from 'react';

import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

export default class TreePanel extends React.Component {
  render() {
    return (
      <div>
        <TreeToolbar />
        <TreeView />
      </div>
    );
  }
}
