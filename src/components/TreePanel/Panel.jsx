/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-27T16:10:57+11:00
*/

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { reaction } from 'mobx';

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
  constructor(props) {
    super(props);
    if (this.props.store.topology.json !== null) {
      this.treeState.parseJson(this.props.store.topology.json);
    }
  }
  componentWillMount() {
    reaction( // eslint-disable-line
        () => this.props.store.topology.isChanged, topologyChange => { // eslint-disable-line
      if (this.props.store.topology.isChanged && this.props.store.topology.json !== null) {
        this.treeState.parseJson(this.props.store.topology.json);
        this.forceUpdate();
      }
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
