/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-03T10:41:02+10:00
*/

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { reaction } from 'mobx';
import Store from '~/stores/global';
import { Intent, Position } from '@blueprintjs/core';
import { featherClient } from '../../helpers/feathers';
import { DBenvyToaster } from '../common/Toaster';
import TreeState from './model/TreeState.js';
import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

@inject('store')
@observer
export default class TreePanel extends React.Component {
  static get defaultProps() {
    return {
      store: undefined,
    };
  }
  constructor(props) {
    super(props);
    if (this.props.store.topology.json !== null) {
      this.treeState.parseJson(this.props.store.topology.json);
    }
  }
  componentWillMount() {
    /**
     * Reaction to change in selected Profile from the profile pane
     * @param  {function} this - condition to react on change
     * @param  {function} if   - Reaction callback Function
     */
    reaction(
      () => this.props.store.profileList.selectedProfile,
      () => {
        if (this.props.store.profileList.selectedProfile) {
          this.treeState.setProfileAlias(this.props.store.profileList.selectedProfile.alias);
          featherClient()                 // Calls the controller to load the topology associated with the selected Profile
            .service('/mongo-inspector')
            .get(this.props.store.profileList.selectedProfile.id)
            .then((res) => {
              this.props.store.updateTopology(res);
            })
            .catch((err) => {
              DBenvyToaster(Position.LEFT_BOTTOM).show({
                message: err.message,
                intent: Intent.DANGER,
                iconName: 'pt-icon-thumbs-down',
              });
            });
        }
      },
    );
    /**
     * Reaction to update tree when topology is changed
     * @param  {function} this Condition to react on changed
     * @param  {function} if   Reaction callback function
     */
    reaction(
      () => this.props.store.topology.isChanged,
      () => {
        if (this.props.store.topology.isChanged && this.props.store.topology.json !== null) {
          this.treeState.parseJson(this.props.store.topology.json);
          this.props.store.topology.isChanged = false;
          this.forceUpdate();
        }
      },
    );
  }
  treeState = new TreeState();

  render() {
    const divStyle = {
      height: '100%',
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
  store: React.PropTypes.instanceOf(Store),
};
