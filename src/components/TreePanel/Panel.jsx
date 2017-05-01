/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-01T13:56:12+10:00
*/

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { reaction, runInAction, observable } from 'mobx';
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

    const onSelectProfile = () => {
      const profile = this.props.store.profileList.selectedProfile;
      if (profile) {
        if (profile.status == 'OPEN') {
          this.bShowTree = true;
          this.treeState.setProfileAlias(profile.alias);
          const service = featherClient()                 // Calls the controller to load the topology associated with the selected Profile
            .service('/mongo-inspector');
            service.timeout = 60000;
            service.get(profile.id)
            .then((res) => {
              this.props.store.updateTopology(res);
            })
            .catch((err) => {
              console.log(err.stack);
              DBenvyToaster(Position.LEFT_BOTTOM).show({
                message: err.message,
                intent: Intent.DANGER,
                iconName: 'pt-icon-thumbs-down',
              });
            });
        } else {
          this.bShowTree = false;
        }
      }
    };
    this.reactionToProfile = reaction(
      () => this.props.store.profileList.selectedProfile,
      () => onSelectProfile()
    );
    /**
     * Reaction to update tree when topology is changed
     * @param  {function} this Condition to react on changed
     * @param  {function} if   Reaction callback function
     */
    this.reactionToTopology = reaction(
      () => this.props.store.topology.isChanged,
      () => {
        if (this.props.store.topology.isChanged && this.props.store.topology.json !== null) {
          this.treeState.parseJson(this.props.store.topology.json);
          runInAction('update topology isChanged', () => {
            this.props.store.topology.isChanged = false;
          });
        }
      },
    );

    onSelectProfile();
  }
  componentWillUnmount() {
    this.reactionToProfile();
    this.reactionToTopology();
  }
  treeState = new TreeState();
  reactionToProfile;
  reactionToTopology;
  @observable bShowTree = false;
  render() {
    const divStyle = {
      height: '100%',
    };
    return (
      <Provider treeState={this.treeState}>
        <div style={divStyle}>
          <TreeToolbar />
          {(this.bShowTree == false) && <div className="pt-navbar-heading">Please reconnect profile to view its topology.</div>}
          {this.bShowTree && <TreeView />}
        </div>
      </Provider>
    );
  }
}

TreePanel.propTypes = {
  store: React.PropTypes.instanceOf(Store),
};
