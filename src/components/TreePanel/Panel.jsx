/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-07T09:57:54+10:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {reaction, runInAction, observable, action} from 'mobx';
import Store from '~/stores/global';
import {Intent, Position} from '@blueprintjs/core';
import {featherClient} from '../../helpers/feathers';
import {DBCodaToaster} from '../common/Toaster';
import ConnectionIcon from '../../styles/icons/connection-icon.svg';
import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

@inject(allStores => ({store: allStores.store, treeState: allStores.treeState}))
@observer
export default class TreePanel extends React.Component {
  static get defaultProps() {
    return {store: undefined};
  }
  // constructor(props) {   super(props);   if (this.props.store.topology.json !==
  // null) {     this.props.treeState.parseJson(this.props.store.topology.json); }
  // }
  componentWillMount() {
    const onSelectProfile = () => {
      const profile = this.props.store.profileList.selectedProfile;
      if (profile) {
        this
          .props
          .treeState
          .setProfileAlias(profile.alias);
        if (profile.status == 'OPEN') {
          if (this.props.treeState.profileId == profile.id) {
            this.updateStatus('LOADED');
          } else {
            this.updateStatus('LOADING');
            this
              .props
              .treeState
              .setProfileId(profile.id);
            const service = featherClient().service('/mongo-inspector'); // Calls the controller to load the topology associated with the selected Profile
            service.timeout = 60000;
            this.props.store.treePanel.isRefreshing = true;
            service
              .get(profile.id)
              .then((res) => {
                runInAction(() => {
                  this.props.store.treePanel.isRefreshing = false;
                  this.props.store.treePanel.isRefreshDisabled = false;
                  this.props.store.topology.isChanged = false;
                });

                if (this.props.store.profileList.selectedProfile.id == res.profileId) {
                  this
                    .props
                    .store
                    .updateTopology(res);
                  this.updateStatus('LOADED');
                } else {
                  DBCodaToaster(Position.LEFT_BOTTOM).show({message: 'Profile got changed before loading completes.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
                  this.updateStatus('FAILED');
                }
              })
              .catch((err) => {
                console.log(err.stack);
                this.updateStatus('FAILED');
                DBCodaToaster(Position.LEFT_BOTTOM).show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
              });
          }
        } else {
          this.props.store.treePanel.isRefreshDisabled = true;
          this.updateStatus('NOPROFILE');
        }
      } else {
        this.updateStatus('NEW');
      }
    };
    /**
     * Reaction to change in selected Profile from the profile pane
     * @param  {function} this - condition to react on change
     * @param  {function} if   - Reaction callback Function
     */
    this.reactionToProfile = reaction(() => this.props.store.profileList.selectedProfile, () => onSelectProfile());
    /**
     * Reaction to update tree when topology is changed
     * @param  {function} this Condition to react on changed
     * @param  {function} if   Reaction callback function
     */
    this.reactionToTopology = reaction(() => this.props.store.topology.isChanged, () => {
      if (this.props.store.topology.isChanged && this.props.store.topology.json !== null) {
        this
          .props
          .treeState
          .parseJson(this.props.store.topology.json, this.props.store.topology.profileId);
        runInAction('update topology isChanged', () => {
          this.props.store.topology.isChanged = false;
        });
      }
    });

    onSelectProfile();
  }
  componentWillUnmount() {
    this.reactionToProfile();
    this.reactionToTopology();
  }
  @action updateStatus(value) {
    this.treeStatus = value;
  }
  reactionToProfile;
  reactionToTopology;
  @observable treeStatus = 'NEW';
  render() {
    const divStyle = {
      height: '100%'
    };
    console.log(this.treeStatus);
    return (
      <div style={divStyle}>
        <TreeToolbar /> {this.treeStatus == 'NOPROFILE' && <div className="tree-msg-div noProfileMessage">
          <div className="messageWrapper">
            <div className="iconWrapper">
              <ConnectionIcon width={50} height={50} className="dbKodaLogo" />
            </div>
            <span>An active connection is required to view topology.</span>
          </div>
        </div>}
        {this.treeStatus == 'LOADING' && <div className="tree-msg-div loadingMessage">
          <div className="messageWrapper">
            <div className="iconWrapper">
              <div className="loader" />
              <span>Loading topology...</span>
            </div>
          </div>
        </div>}
        {this.treeStatus == 'FAILED' && <div className="tree-msg-div failedMessage">
          <div className="messageWrapper">
            <div className="iconWrapper">
              <span style={{
                color: 'red'
              }}>
                Failed to load topology.
              </span>
            </div>
          </div>
        </div>}
        {this.treeStatus == 'LOADED' && <TreeView />}
      </div>
    );
  }
}

TreePanel.propTypes = {
  store: React
    .PropTypes
    .instanceOf(Store)
};
