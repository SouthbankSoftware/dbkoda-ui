/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T11:53:27+11:00
*/

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { autorun } from 'mobx';

import Store from '~/stores/global';

import TreeState from './model/TreeState.js';
import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

@inject('store')
@observer
export default class TreePanel extends React.Component {
  static get defaultProps() {
    return {
      store: undefined
    };
  }
  componentWillMount() {
    autorun(() => {
      this.treeState.parseJson(this.props.store.topology);
      this.forceUpdate();
    });
  }
  treeState = new TreeState();

  render() {
    const divStyle = {
      height: '100%'
    };
    return (
      <Provider treeState={this.treeState}>
        <div style={divStyle}>
          <TreeToolbar />
          <TreeView />
        </div>
      </Provider>
    );
  }
}

TreePanel.propTypes = {
  store: React.PropTypes.instanceOf(Store)
};
