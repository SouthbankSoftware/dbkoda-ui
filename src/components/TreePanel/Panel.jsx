/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-10T09:53:34+11:00
*/

import React from 'react';
import { inject, observer, PropTypes, Provider } from 'mobx-react';

import TreeState from './model/TreeState.js';
import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

@inject('store')
@observer
export default class TreePanel extends React.Component {
  componentWillMount() {
    this.treeState.parseJson(this.props.store.topology);
    console.log(this.treeState);
  }
  treeState = new TreeState();
  render() {
    return (
      <Provider treeState={this.treeState}>
      <div>

          <TreeToolbar />
          <TreeView />

      </div>
      </Provider>
    );
  }
}
