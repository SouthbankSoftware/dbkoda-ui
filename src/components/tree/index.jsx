/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-08T15:47:09+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T17:24:08+11:00
*/

import React from 'react';
import { inject, observer, PropTypes, Provider } from 'mobx-react';

import TreeState from './model/TreeState.js';
import TreePanel from './Panel.jsx';

@inject('store')
@observer
export default class Tree extends React.Component {
  componentWillMount() {
    this.treeState.parseJson(this.props.store.topology);
    console.log(this.treeState);
  }
  treeState = new TreeState();
  render() {
    return (
      <div>
        <Provider treeState={this.treeState}>
          <TreePanel />
        </Provider>
      </div>
    );
  }
}
