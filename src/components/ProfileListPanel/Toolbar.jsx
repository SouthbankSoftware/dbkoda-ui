/**
 * @Mike TODO -> Add Flow.
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-15 13:34:55
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-22T11:50:58+10:00
 *
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
 * Fix linting errors and remove these disables.
 */
/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
/* eslint no-unused-vars:warn */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import autobind from 'autobind-decorator';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { Dialog, AnchorButton, Intent, Position, Tooltip } from '@blueprintjs/core';
import { NewToaster } from '#/common/Toaster';
import { GlobalHotkeys, DialogHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import { performancePanelStatuses } from '~/api/PerformancePanel';
import { ProfileStatus } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
import { Broker, EventType } from '../../helpers/broker';
import AddIcon from '../../styles/icons/add-icon.svg';
import EditProfileIcon from '../../styles/icons/edit-profile-icon.svg';
import CloseProfileIcon from '../../styles/icons/close-profile-icon.svg';
import RemoveProfileIcon from '../../styles/icons/remove-profile-icon.svg';
import './styles.scss';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  configStore: allStores.configStore,
  profileStore: allStores.profileStore
}))
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editDisabled: true,
      removeDisabled: true,
      closingProfile: false,
      closeConnectionAlert: false,
      removeConnectionAlert: false
    };

    /**
     * Can probably be replaced with action.bound decorator.
     */
    this.newProfile = this.newProfile.bind(this);
  }
  componentWillUnmount() {
    Mousetrap.unbindGlobal(GlobalHotkeys.createNewProfile.keys, this.newProfile);
  }
  componentDidMount() {
    Mousetrap.bindGlobal(GlobalHotkeys.createNewProfile.keys, this.newProfile);
  }

  /**
   * Action for opening the new Profile Drawer.
   */
  @action
  newProfile() {
    this.props.store.profileList.selectedProfile = null;
    this.props.store.showConnectionPane();
  }

  /**
   * Action for opening the edit Profile Drawer.
   */
  @action.bound
  editProfile() {
    const { selectedProfile } = this.props.store.profileList;
    if (selectedProfile) {
      if (selectedProfile.status === ProfileStatus.OPEN) {
        NewToaster.show({
          message: globalString('profile/notClosed'),
          className: 'warning',
          icon: 'warning-sign'
        });
      }
      this.props.store.showConnectionPane();
    } else {
      NewToaster.show({
        message: globalString('profile/noProfile'),
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
  }

  /**
   * Action for removing a profile.
   */
  @action.bound
  removeProfile() {
    const { id: profileId } = this.props.store.profileList.selectedProfile;
    const { api } = this.props;

    api.transformPerformancePanel(profileId, null);

    // eslint-disable-line class-methods-use-this
    this.props.profileStore.profiles.delete(profileId);
    this.props.profileStore.save();
    this.hideRemoveConnectionAlert();
    NewToaster.show({
      message: globalString('profile/removeSuccess'),
      className: 'success',
      icon: 'thumbs-up'
    });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.hideRemoveConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.removeProfile);
  }

  @autobind
  showRemoveConnectionAlert() {
    this.setState({ removeConnectionAlert: true });
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.hideRemoveConnectionAlert);
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.removeProfile);
  }

  @autobind
  hideRemoveConnectionAlert() {
    this.setState({ removeConnectionAlert: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.hideRemoveConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.removeProfile);
  }

  @action.bound
  closeProfile() {
    const { selectedProfile } = this.props.store.profileList;
    const { profiles } = this.props.profileStore;
    if (selectedProfile) {
      const { api } = this.props;

      api.hasPerformancePanel(selectedProfile.id) &&
        api.transformPerformancePanel(selectedProfile.id, performancePanelStatuses.stopped);

      this.setState({ closingProfile: true });
      featherClient()
        .service('/mongo-connection')
        .remove(selectedProfile.id)
        .then(() => {
          runInAction(() => {
            selectedProfile.status = ProfileStatus.CLOSED;
            profiles.set(selectedProfile.id, selectedProfile);
          });
          this.setState({ closingProfile: false, closeConnectionAlert: false });
          NewToaster.show({
            message: globalString('profile/toolbar/connectionClosed'),
            className: 'success',
            icon: 'thumbs-up'
          });
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
        })
        .catch(err => {
          l.error('Failed to close profile:', err);
          NewToaster.show({
            message: err.message,
            className: 'danger',
            icon: 'thumbs-down'
          });
          this.setState({ closingProfile: false, closeConnectionAlert: false });
        });
    } else {
      NewToaster.show({
        message: globalString('profile/noProfile'),
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.hideCloseConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.closeProfile);
  }

  @autobind
  hideCloseConnectionAlert() {
    this.setState({ closeConnectionAlert: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.hideCloseConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.closeProfile);
  }

  @autobind
  showCloseConnectionAlert() {
    this.setState({ closeConnectionAlert: true });
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.hideCloseConnectionAlert);
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.closeProfile);
  }

  render() {
    const { selectedProfile } = this.props.store.profileList;
    return (
      <nav className="pt-navbar profileListToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Connection Profiles</div>
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Dialog
            className="pt-dark close-profile-alert-dialog"
            intent={Intent.PRIMARY}
            isOpen={this.state.closeConnectionAlert}
          >
            <div className="dialogContent">
              <p>{globalString('profile/closeAlert/prompt')}</p>
            </div>
            <div className="dialogButtons">
              <AnchorButton
                className="submitButton"
                type="submit"
                intent={Intent.SUCCESS}
                onClick={this.closeProfile}
                loading={this.props.store.layout.alertIsLoading}
                text={globalString('profile/closeAlert/confirmButton')}
              />
              <AnchorButton
                className="cancelButton"
                intent={Intent.DANGER}
                text={globalString('profile/closeAlert/cancelButton')}
                onClick={this.hideCloseConnectionAlert}
                loading={this.props.store.layout.alertIsLoading}
              />
            </div>
          </Dialog>
          <Dialog
            className="pt-dark remove-profile-alert-dialog"
            intent={Intent.PRIMARY}
            isOpen={this.state.removeConnectionAlert}
          >
            <div className="dialogContent">
              <p>{globalString('profile/removeAlert/prompt')}</p>
            </div>
            <div className="dialogButtons">
              <AnchorButton
                className="submitButton"
                type="submit"
                intent={Intent.SUCCESS}
                onClick={this.removeProfile}
                loading={this.props.store.layout.alertIsLoading}
                text={globalString('profile/removeAlert/confirmButton')}
              />
              <AnchorButton
                className="cancelButton"
                intent={Intent.DANGER}
                onClick={this.hideRemoveConnectionAlert}
                loading={this.props.store.layout.alertIsLoading}
                text={globalString('profile/removeAlert/cancelButton')}
              />
            </div>
          </Dialog>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/newProfileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM_LEFT}
          >
            <AnchorButton className="newProfileButton" onClick={this.newProfile}>
              <AddIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
