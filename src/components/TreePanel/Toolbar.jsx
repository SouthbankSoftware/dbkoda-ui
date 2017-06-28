/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T12:00:43+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-07T08:08:03+10:00
*/
import React from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {reaction, runInAction, action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {AnchorButton, Position} from '@blueprintjs/core';
import {GlobalHotkeys} from '#/common/hotkeys/hotkeyList.jsx';
import TreeState from './model/TreeState.js';
import {featherClient} from '../../helpers/feathers';
import {DBKodaToaster} from '../common/Toaster';

@inject(allStores => ({store: allStores.store, treeState: allStores.treeState}))
@observer
export default class TreeToolbar extends React.Component {
  static get defaultProps() {
    return {treeState: undefined};
  }
  constructor(props) {
    super(props);
    this.updateFilter = this
      .updateFilter
      .bind(this);
    this.refresh = this
      .refresh
      .bind(this);

    this.reactionToProfile = reaction(() => this.props.store.profileList.selectedProfile, () => this.onSelectProfile());
  }

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.refreshTree.keys, this.refresh);
  }
  componentWillUnmount() {
    Mousetrap.unbindGlobal(GlobalHotkeys.refreshTree.keys, this.refresh);
  }

  @action.bound
  onSelectProfile() {
    const profile = this.props.store.profileList.selectedProfile;
    if (profile) {
      if (profile.status == 'OPEN') {
        this.props.store.treePanel.isRefreshDisabled = false;
      } else {
        this.props.store.treePanel.isRefreshDisabled = true;
      }
    } else {
      this.props.store.treePanel.isRefreshDisabled = true;
    }
  }

  updateFilter(event) {
    const value = event
      .target
      .value
      .replace(/ /g, '');
    this
      .props
      .treeState
      .setFilter(value);
  }
  @action
  refresh() {
    if (this.props.store.treePanel.isRefreshDisabled) {
      return;
    }
    this.props.store.treePanel.isRefreshing = true;
    const profile = this.props.store.profileList.selectedProfile;
    const service = featherClient().service('/mongo-inspector'); // Calls the controller to load the topology associated with the selected Profile
    service.timeout = 60000;
    service
      .get(profile.id)
      .then((res) => {
        if (this.props.store.profileList.selectedProfile.id == res.profileId) {
          this
            .props
            .store
            .updateTopology(res);
        }
        runInAction(() => {
          this.props.store.treePanel.isRefreshing = false;
        });
      })
      .catch((err) => {
        console.log(err.stack);
        DBKodaToaster(Position.LEFT_BOTTOM).show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      });
  }

  render() {
    return (
      <nav className=" treeToolbar pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">{this.props.treeState.profileAlias}</div>
          <input
            className="pt-input"
            placeholder="Search..."
            type="text"
            onChange={this.updateFilter} />
        </div>
        <div className="pt-navbar-group pt-align-right">
          <AnchorButton
            className="pt-button pt-icon-refresh refreshTreeButton"
            onClick={this.refresh}
            loading={this.props.store.treePanel.isRefreshing}
            disabled={this.props.store.treePanel.isRefreshDisabled} />
        </div>
      </nav>
    );
  }
}

TreeToolbar.propTypes = {
  treeState: React
    .PropTypes
    .instanceOf(TreeState)
};
