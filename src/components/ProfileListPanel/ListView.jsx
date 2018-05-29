/**
 * @Mike TODO -> Add Flow.
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-29T15:23:28+10:00
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

import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import autobind from 'autobind-decorator';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { Cell, Column, SelectionModes, Table } from '@blueprintjs/table';
import { NewToaster } from '#/common/Toaster';
import { DialogHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import {
  AnchorButton,
  Dialog,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  PopoverInteractionKind
} from '@blueprintjs/core';
import { terminalTypes } from '~/api/Terminal';
import { performancePanelStatuses } from '~/api/PerformancePanel';
import { ProfileStatus } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
import { Broker, EventType } from '../../helpers/broker';
import ConnectionIcon from '../../styles/icons/connection-icon-2.svg';
import DropdownIcon from '../../styles/icons/dropdown-menu-icon.svg';

import './styles.scss';

const React = require('react');

const PasswordDialogTypes = {
  SHA: 'sha',
  SSH: 'ssh'
};

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config,
  profileStore: allStores.profileStore
}))
@observer
export default class ListView extends React.Component {
  api;
  store;
  constructor(props) {
    super(props);
    this.state = {
      targetProfile: null,
      isCloseWarningActive: false,
      isRemoveWarningActive: false,
      isOpenWarningActive: false,
      isSshOpenWarningActive: false,
      passwordText: null,
      lastSelectRegion: null,
      remotePass: null,
      passPhrase: null,
      needsPassword: false,
      needsRemotePassword: false,
      needsRemotePassphrase: false
    };

    this.api = this.props.api;
    this.store = this.props.store;

    /**
     * @Mike TODO -> These can probably all be replaced with action.bound decorators, as it's cleaner.
     */
    this.renderBodyContextMenu = this.renderBodyContextMenu.bind(this);
    this.openProfile = this.openProfile.bind(this);
    this.closeProfile = this.closeProfile.bind(this);
    this.editProfile = this.editProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.swapToEditor = this.swapToEditor.bind(this);
  }

  componentWillMount() {
    this.reactionToEditorToolbarComboChange = reaction(
      () => this.props.store.editorPanel.activeDropdownId,
      () => {
        if (
          this.props.store.editorPanel.activeDropdownId &&
          this.props.store.editorPanel.activeDropdownId != 'Default'
        ) {
          const editorProfile = this.props.profileStore.profiles.get(
            this.props.store.editorPanel.activeDropdownId
          );
          this.props.store.profileList.selectedProfile = editorProfile;
          this.setState({ lastSelectRegion: null });
          this.forceUpdate();
        }
      }
    );
  }

  componentWillUnmount() {
    this.reactionToEditorToolbarComboChange();
  }

  reactionToEditorToolbarComboChange;

  @action
  onSelection(region) {
    if (region.length == 0) {
      return;
    }
    const profiles = _.sortBy(
      [...this.props.profileStore.profiles.entries()],
      [
        function(o) {
          return o[1].alias;
        }
      ]
    );
    const profile = profiles[region[0].rows[0]][1];
    this.props.store.profileList.selectedProfile = profile;
    this.setState({ lastSelectRegion: region });
  }

  @action
  async openProfile() {
    this.props.store.layout.alertIsLoading = true;
    const selectedProfile = this.state.targetProfile;
    const profile = _.clone(selectedProfile);
    if (profile.useClusterConfig) {
      profile.passwordCluster = this.state.passwordText;
    } else {
      profile.password = this.state.passwordText;
    }

    profile.remotePass = this.state.remotePass;
    profile.passPhrase = this.state.passPhrase;
    profile.bReconnect = true;

    // Fix to make sure loading spinner begins before the profile is actually connecting, otherwise it won't appear until re-render.
    this.store.profileStore.profiles.get(profile.id).status = ProfileStatus.CONNECTING;
    this.forceUpdate();

    this.api.connectProfile(profile).then(res => {
      runInAction('Turn off loading spinner in dialog.', () => {
        this.props.store.layout.alertIsLoading = false;
      });
      this.onSuccess(res, profile);
    });
  }

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
  @action
  onSuccess(res, profile) {
    this.props.store.layout.alertIsLoading = false;
    this.closeOpenConnectionAlert();
    if (profile && profile.ssh) {
      const { terminals } = this.props.store;
      let shouldCreateSshTerminal = true;

      for (const terminal of terminals.values()) {
        if (terminal.profileId && terminal.profileId === profile.id) {
          shouldCreateSshTerminal = false;
          break;
        }
      }

      if (shouldCreateSshTerminal) {
        this.state.targetProfile = profile;
        this.openSshConnectionAlert({
          switchToUponCreation: false,
          eagerCreation: true
        });
      }
    }
  }

  @action
  closeProfile() {
    const selectedProfile = this.state.targetProfile;
    const { profiles } = this.props.profileStore;
    if (selectedProfile) {
      const { api } = this.props;

      api.hasPerformancePanel(selectedProfile.id) &&
        api.transformPerformancePanel(selectedProfile.id, performancePanelStatuses.stopped);

      this.setState({ closingProfile: true });
      this.props.store.layout.alertIsLoading = true;
      featherClient()
        .service('/mongo-connection')
        .remove(selectedProfile.id)
        .then(_v => {
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
          this.props.api.deleteProfileFromDrill({ profile: selectedProfile });
          if (this.props.store.profileList.selectedProfile.status == 'CLOSED') {
            runInAction(() => {
              this.props.store.treePanel.isRefreshDisabled = true;
            });
          }
          runInAction(() => {
            this.props.store.editorToolbar.noActiveProfile = true;
          });
          this.closeConnectionCloseAlert();
        })
        .catch(err => {
          l.error('Failed to close profile:', err);
          NewToaster.show({
            message: 'Error: ' + err.message,
            className: 'danger',
            icon: 'thumbs-down'
          });
          this.setState({ closingProfile: false, closeConnectionAlert: false });
          this.closeConnectionCloseAlert();
        });
    } else {
      NewToaster.show({
        message: globalString('profile/noProfile'),
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
    this.closeConnectionCloseAlert();
  }

  @action
  editProfile() {
    const selectedProfile = this.state.targetProfile;
    this.props.store.profileList.selectedProfile = selectedProfile;
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

  @action
  deleteProfile() {
    const { id: profileId } = this.state.targetProfile;
    const { profileStore, api } = this.props;

    profileStore.profiles.delete(profileId);
    profileStore.save();
    api.removeAllTerminalsForProfile(profileId);
    api.transformPerformancePanel(profileId, null);
    NewToaster.show({
      message: globalString('profile/removeSuccess'),
      className: 'success',
      icon: 'thumbs-up'
    });
    this.closeConnectionRemoveAlert();
  }

  @action.bound
  openSshShell() {
    this.props.store.layout.alertIsLoading = true;
    const { addSshTerminal } = this.props.api;
    const query = {};
    const selectedProfile = this.state.targetProfile;

    query.username = selectedProfile.remoteUser;
    query.host = selectedProfile.remoteHost;
    query.port = selectedProfile.sshPort;

    if (selectedProfile.passRadio) {
      query.password = this.state.remotePass;
    } else if (selectedProfile.keyRadio) {
      query.privateKey = selectedProfile.sshKeyFile;
      query.passphrase = this.state.passPhrase;
    }

    query.profileId = selectedProfile.id;

    addSshTerminal(query, this._openSshTerminalOptions);
    this._openSshTerminalOptions = null;
    this.setState({ remotePass: null, passPhrase: null });
    this.closeSshConnectionAlert();
  }

  @autobind
  openCloseConnectionAlert() {
    this.setState({ isCloseWarningActive: true });
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closeConnectionCloseAlert);
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.closeProfile);
  }

  @action.bound
  closeConnectionCloseAlert() {
    this.props.store.layout.alertIsLoading = false;
    this.setState({ isCloseWarningActive: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.closeConnectionCloseAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.closeProfile);
  }

  @autobind
  openRemoveConnectionAlert() {
    this.setState({ isRemoveWarningActive: true });
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closeConnectionRemoveAlert);
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.deleteProfile);
  }

  @action.bound
  closeConnectionRemoveAlert() {
    this.props.store.layout.alertIsLoading = false;
    this.setState({ isRemoveWarningActive: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.closeConnectionRemoveAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.deleteProfile);
  }

  @autobind
  needPassword(id, isSshPassword) {
    if (isSshPassword) {
      return this.api.passwordApi.isProfileMissingFromStore(`${id}-s`);
    }
    return this.api.passwordApi.isProfileMissingFromStore(id);
  }

  @autobind
  shouldShowPasswordDialog(profile, dialogType) {
    l.log('shouldShowPasswordDialog');
    l.log(profile);
    let showPasswordDialog = false;
    const { passwordStoreEnabled } = this.props.config.settings;
    const { id, useClusterConfig, shaCluster, bRemotePass, bPassPhrase } = profile;
    const sha = useClusterConfig ? shaCluster : profile.sha;
    const ssh = profile.ssh && (bRemotePass || bPassPhrase);

    if (dialogType === PasswordDialogTypes.SHA) {
      // this is the case of reconnect profile
      if (!passwordStoreEnabled) {
        if (sha || ssh) {
          showPasswordDialog = true;
          this.setState({
            needsPassword: sha,
            needsRemotePassword: ssh && bRemotePass,
            needsRemotePassphrase: ssh && bPassPhrase
          });
        }
      } else {
        l.log('password store is enabled');
        let storeNeedsPassword = false;
        let storeNeedsRemotePassword = false;
        if (sha) {
          storeNeedsPassword = this.needPassword(id, false);
        }
        if (ssh) {
          storeNeedsRemotePassword = this.needPassword(id, true);
        }
        showPasswordDialog = storeNeedsPassword || storeNeedsRemotePassword;

        this.setState({
          needsPassword: sha && storeNeedsPassword,
          needsRemotePassword: ssh && bRemotePass && storeNeedsRemotePassword,
          needsRemotePassphrase: ssh && bPassPhrase && storeNeedsRemotePassword
        });
      }
    } else if (dialogType === PasswordDialogTypes.SSH) {
      // this is the case of SSH Terminal
      if (!passwordStoreEnabled && ssh) {
        showPasswordDialog = true;
        this.setState({
          needsRemotePassword: ssh && bRemotePass,
          needsRemotePassphrase: ssh && bPassPhrase
        });
      } else if (ssh) {
        const storeNeedsRemotePassword = this.needPassword(id, true);
        showPasswordDialog = storeNeedsRemotePassword;
        this.setState({
          needsRemotePassword: ssh && bRemotePass && storeNeedsRemotePassword,
          needsRemotePassphrase: ssh && bPassPhrase && storeNeedsRemotePassword
        });
      }
    }
    return showPasswordDialog;
  }

  @autobind
  openOpenConnectionAlert() {
    const profile = this.state.targetProfile;
    if (profile.ssh) {
      const showEditProfile = () => {
        NewToaster.show({
          message: globalString('profile/maybeCorrupt'),
          className: 'warning',
          icon: 'warning-sign'
        });
        this.editProfile();
      };
      if (!profile.keyRadio && profile.bRemotePass == undefined) {
        showEditProfile();
        return;
      } else if (profile.keyRadio && profile.bPassPhrase == undefined) {
        showEditProfile();
        return;
      }
    }
    if (this.shouldShowPasswordDialog(profile, PasswordDialogTypes.SHA)) {
      this.setState({ isOpenWarningActive: true });
      Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closeOpenConnectionAlert);
      Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.openProfile);
    } else {
      this.openProfile();
    }
  }

  @action.bound
  closeOpenConnectionAlert() {
    this.props.store.layout.alertIsLoading = false;
    this.setState({ isOpenWarningActive: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.closeOpenConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.openConnection);
  }

  @action.bound
  openSshConnectionAlert(options) {
    this._openSshTerminalOptions = options;
    const profile = this.state.targetProfile;
    if (this.shouldShowPasswordDialog(profile, PasswordDialogTypes.SSH)) {
      this.setState({ isSshOpenWarningActive: true });
      Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closeSshConnectionAlert);
      Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.openSshShell);
    } else {
      this.openSshShell();
    }
  }

  @action.bound
  closeSshConnectionAlert() {
    this.props.store.layout.alertIsLoading = false;
    this.setState({ isSshOpenWarningActive: false });
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.closeSshConnectionAlert);
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.openSshShell);
  }

  @autobind
  setPWText(event) {
    this.setState({ passwordText: event.target.value });
  }

  @action.bound
  swapToEditor(event) {
    this.props.store.editorToolbar.id = event.id;
    this.props.store.editorToolbar.shellId = event.shellId;
    this.props.store.editorPanel.shouldScrollToActiveTab = true;
    this.props.store.editorPanel.activeEditorId = event.id;
  }

  @action.bound
  onDoubleClickHandler(profile) {
    this.state.targetProfile = profile;
    this.props.store.profileList.selectedProfile = profile;
    this.openOpenConnectionAlert(profile);
    // setTimeout(this.openOpenConnectionAlert(profile), 0);
  }

  @action
  renderBodyContextMenu(context, buttonProfile) {
    // Get profiles, sort alphabetically and use that as a reference.
    const profiles = _.sortBy(
      [...this.props.profileStore.profiles.entries()],
      [
        function(o) {
          return o[1].alias;
        }
      ]
    );
    let profile;
    if (buttonProfile) {
      profile = buttonProfile;
    } else {
      [, profile] = profiles[context.regions[0].rows[0]];
      this.state.targetProfile = profile;
    }

    let connect;
    const terminalOperations = [];
    const windows = [];
    if (profile.status == 'CLOSED') {
      connect = (
        <div className="contextMenuGroup">
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu openProfile"
              onClick={this.openOpenConnectionAlert}
              text={globalString('profile/menu/openConnection')}
              intent={Intent.NONE}
              icon="unlock"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu editProfile"
              onClick={this.editProfile}
              text={globalString('profile/menu/editProfile')}
              intent={Intent.NONE}
              icon="edit"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu deleteProfile"
              onClick={this.openRemoveConnectionAlert}
              text={globalString('profile/menu/deleteProfile')}
              intent={Intent.NONE}
              icon="delete"
            />
          </div>
        </div>
      );
    } else {
      const { api } = this.props;

      this.props.store.editors.forEach(value => {
        if (value.currentProfile.trim() == profile.id.trim()) {
          windows.push(
            <div key={windows.length} className="menuItemWrapper">
              <MenuItem
                className={'profileListContextMenu editorListing ' + value.fileName}
                text={api.getEditorDisplayName(value)}
                onClick={() => this.swapToEditor(value)}
                intent={Intent.NONE}
                icon="document"
              />
            </div>
          );
        }
      });

      const hasPerformancePanel = api.hasPerformancePanel(profile.id);

      connect = (
        <div className="contextMenuGroup">
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu closeProfile"
              onClick={this.openCloseConnectionAlert}
              text={globalString('profile/menu/closeConnection')}
              intent={Intent.NONE}
              icon="lock"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu editProfile"
              onClick={this.editProfile}
              text={globalString('profile/menu/editProfile')}
              intent={Intent.NONE}
              icon="edit"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu newWindow"
              onClick={() => this.props.api.addEditor({ profileId: profile.id })}
              text={globalString('profile/menu/newWindow')}
              intent={Intent.NONE}
              icon="new-text-box"
            />
          </div>
          <MenuDivider />
          <div className="menuItemWrapper">
            <MenuItem
              className={`profileListContextMenu ${
                !hasPerformancePanel ? 'createPerformancePanel' : 'openPerformancePanel'
              }`}
              onClick={() => {
                // Emit event for performance panel
                runInAction(() => {
                  if (this.props.store.editorToolbar.reloadToolbar) {
                    this.props.store.editorToolbar.reloadToolbar = false;
                  }
                  this.props.store.editorToolbar.reloadToolbar = true;
                });
                Broker.emit(EventType.FEATURE_USE, 'PerformancePanel');
                this.props.api.transformPerformancePanel(
                  profile.id,
                  performancePanelStatuses.external
                );
              }}
              text={globalString(
                `profile/menu/${
                  !hasPerformancePanel ? 'createPerformancePanel' : 'openPerformancePanel'
                }`
              )}
              intent={Intent.NONE}
              icon="heat-grid"
            />
          </div>
          {hasPerformancePanel ? (
            <div className="menuItemWrapper">
              <MenuItem
                className="profileListContextMenu destroyPerformancePanel"
                onClick={() => {
                  runInAction(() => {
                    this.props.store.editorToolbar.reloadToolbar = true;
                  });
                  this.props.api.transformPerformancePanel(profile.id, null);
                }}
                text={globalString('profile/menu/destroyPerformancePanel')}
                intent={Intent.NONE}
                icon="heat-grid"
              />
            </div>
          ) : null}
          {hasPerformancePanel ? (
            <div className="menuItemWrapper">
              <MenuItem
                className="profileListContextMenu reset-high-water-mark"
                onClick={() => this.props.api.resetHighWaterMark(profile.id)}
                text={globalString('profile/menu/resetHWM')}
                intent={Intent.NONE}
                icon="heat-grid"
              />
            </div>
          ) : null}
        </div>
      );
    }

    if (profile.ssh) {
      terminalOperations.push(
        <div key={terminalOperations.length} className="menuItemWrapper">
          <MenuItem
            className="profileListContextMenu newSshTerminal"
            onClick={() => this.openSshConnectionAlert()}
            text={globalString('profile/menu/newSshTerminal')}
            intent={Intent.NONE}
            icon="new-text-box"
          />
        </div>
      );
    }

    terminalOperations.push(
      <div key={terminalOperations.length} className="menuItemWrapper">
        <MenuItem
          className="profileListContextMenu newLocalTerminal"
          onClick={() => {
            const { addTerminal } = this.props.api;

            addTerminal(terminalTypes.local);
          }}
          text={globalString('profile/menu/newLocalTerminal')}
          intent={Intent.NONE}
          icon="new-text-box"
        />
      </div>
    );

    return (
      <Menu className="profileListContextMenu">
        <div className="profileAlias">{profile.alias}</div>
        {connect}
        <MenuDivider />
        {terminalOperations}
        {windows.length > 0 ? <MenuDivider title={globalString('profile/menu/editors')} /> : null}
        {windows}
      </Menu>
    );
  }

  render() {
    // Sort profile list first.
    const profiles = _.sortBy(
      [...this.props.profileStore.profiles.entries()],
      [
        function(o) {
          return o[1].alias;
        }
      ]
    );

    // Individual function for creating a single profile listing.
    const renderCell = (rowIndex: number) => {
      const className =
        this.props.store.profileList &&
        this.props.store.profileList.selectedProfile &&
        profiles[rowIndex][1].id === this.props.store.profileList.selectedProfile.id
          ? 'connection-profile-cell connection-profile-cell-selected'
          : 'connection-profile-cell';
      if (profiles[rowIndex][1].status == 'OPEN') {
        return (
          <Cell className={className + ' profileListItem ' + profiles[rowIndex][1].alias}>
            <ConnectionIcon className="pt-icon dbKodaSVG" width={40} height={40} />
            <p className="profileListing">{profiles[rowIndex][1].alias}</p>
            <span className="additionalActions">
              <Popover
                minimal
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="toolTip"
                content={this.renderBodyContextMenu(null, profiles[rowIndex][1])}
                target={
                  <AnchorButton
                    className="button"
                    onClick={() => {
                      l.info('Open Context Menu');
                      [, this.state.targetProfile] = profiles[rowIndex];
                    }}
                  >
                    <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />
                  </AnchorButton>
                }
              />
            </span>
          </Cell>
        );
      } else if (profiles[rowIndex][1].status == ProfileStatus.CONNECTING) {
        return (
          <Cell className={className + ' profileListItem ' + profiles[rowIndex][1].alias}>
            <ConnectionIcon className="pt-icon dbKodaSVG" width={40} height={40} />
            <p className="profileListing">{profiles[rowIndex][1].alias}</p>
            <AnchorButton
              style={{ marginLeft: 'auto' }}
              className="profile-loading pt-button pt-intent-primary pt-icon-chevron-right"
              loading
            />
          </Cell>
        );
      }
      return (
        <Cell interactive className={className}>
          <div
            className="doubleClickWrapper"
            onDoubleClick={() => this.onDoubleClickHandler(profiles[rowIndex][1])}
          >
            <ConnectionIcon className="pt-icon dbKodaSVG closedProfile" width={40} height={40} />
            <i className="profileListing closedProfile">{profiles[rowIndex][1].alias}</i>
            <span className="additionalActions">
              <Popover
                minimal
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="toolTip"
                content={this.renderBodyContextMenu(null, profiles[rowIndex][1])}
                target={
                  <AnchorButton
                    className="button"
                    onClick={() => {
                      l.info('Open Context Menu');
                      [, this.state.targetProfile] = profiles[rowIndex];
                    }}
                  >
                    <DropdownIcon className="pt-icon dbKodaSVG" width={16} height={16} />
                  </AnchorButton>
                }
              />
            </span>
          </div>
        </Cell>
      );
    };

    return (
      <div className="profileList">
        <Table
          enableMultipleSelection={false}
          numRows={this.props.profileStore.profiles.size}
          enableRowHeader={false}
          selectionModes={SelectionModes.ROWS_AND_CELLS}
          enableColumnResizing={false}
          bodyContextMenuRenderer={this.renderBodyContextMenu}
          enableRowResizing={false}
          defaultColumnWidth={100}
          defaultRowHeight={60}
          onSelection={region => this.onSelection(region)}
          selectedRegions={this.state.lastSelectRegion}
          columnWidths={[200]}
        >
          <Column name="Connection Profiles" cellRenderer={renderCell} />
        </Table>
        <Dialog
          className="pt-dark close-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isCloseWarningActive}
        >
          <div className="dialogContent">
            <p>{globalString('profile/closeAlert/prompt')}</p>
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="submitButton"
              type="submit"
              intent={Intent.SUCCESS}
              onClick={() => {
                setTimeout(() => {
                  runInAction(() => {
                    if (this.props.store.editorToolbar.reloadToolbar) {
                      this.props.store.editorToolbar.reloadToolbar = false;
                    }
                    this.props.store.editorToolbar.reloadToolbar = true;
                  });
                }, 500);
                this.closeProfile();
              }}
              loading={this.props.store.layout.alertIsLoading}
              text={globalString('profile/closeAlert/confirmButton')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              text={globalString('profile/closeAlert/cancelButton')}
              onClick={this.closeConnectionCloseAlert}
              loading={this.props.store.layout.alertIsLoading}
            />
          </div>
        </Dialog>
        <Dialog
          className="pt-dark remove-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isRemoveWarningActive}
        >
          <div className="dialogContent">
            <p>{globalString('profile/removeAlert/prompt')}</p>
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="submitButton"
              type="submit"
              intent={Intent.SUCCESS}
              onClick={this.deleteProfile}
              loading={this.props.store.layout.alertIsLoading}
              text={globalString('profile/removeAlert/confirmButton')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              onClick={this.closeConnectionRemoveAlert}
              loading={this.props.store.layout.alertIsLoading}
              text={globalString('profile/removeAlert/cancelButton')}
            />
          </div>
        </Dialog>
        <Dialog
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isOpenWarningActive}
        >
          {this.state.needsPassword && (
            <div className="dialogContent">
              <p>{globalString('profile/openAlert/passwordPrompt')}</p>
              <input
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                className="pt-input passwordInput"
                placeholder={globalString('profile/openAlert/passwordPlaceholder')}
                type="password"
                dir="auto"
                onChange={this.setPWText}
              />
              {!this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreInfo')}</p>
              )}
              {this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreAdd')}</p>
              )}
            </div>
          )}
          {this.state.needsRemotePassword && (
            <div className="dialogContent">
              <p>{globalString('profile/openAlert/remotePassPrompt')}</p>
              <input
                autoFocus={!this.state.targetProfile.sha} // eslint-disable-line jsx-a11y/no-autofocus
                className="pt-input remotePassInput"
                placeholder={globalString('profile/openAlert/remotePassPlaceholder')}
                type="password"
                dir="auto"
                onChange={event => {
                  this.setState({ remotePass: event.target.value });
                }}
              />
              {!this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreInfo')}</p>
              )}
              {this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreAdd')}</p>
              )}
            </div>
          )}
          {this.state.needsRemotePassphrase && (
            <div className="dialogContent">
              <p>{globalString('profile/openAlert/passPhrasePrompt')}</p>
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={!this.state.targetProfile.sha && !this.state.targetProfile.bRemotePass}
                className="pt-input passPhraseInput"
                placeholder={globalString('profile/openAlert/passPhrasePlaceholder')}
                type="password"
                dir="auto"
                onChange={event => {
                  this.setState({ passPhrase: event.target.value });
                }}
              />
              {!this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreInfo')}</p>
              )}
              {this.props.config.settings.passwordStoreEnabled && (
                <p>{globalString('profile/openAlert/passwordStoreAdd')}</p>
              )}
            </div>
          )}
          <div className="dialogButtons">
            <AnchorButton
              className="openButton"
              intent={Intent.SUCCESS}
              type="submit"
              onClick={this.openProfile}
              loading={this.props.store.layout.alertIsLoading}
              text={globalString('profile/openAlert/confirmButton')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              text={globalString('profile/openAlert/cancelButton')}
              onClick={this.closeOpenConnectionAlert}
            />
          </div>
        </Dialog>
        <Dialog
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isSshOpenWarningActive}
        >
          {this.state.targetProfile &&
            this.state.targetProfile.bRemotePass && (
              <div className="dialogContent">
                <p>{globalString('profile/openAlert/remotePassPrompt')}</p>
                <input
                  autoFocus={this.state.targetProfile.bRemotePass} // eslint-disable-line jsx-a11y/no-autofocus
                  className="pt-input remotePassInput"
                  placeholder={globalString('profile/openAlert/remotePassPlaceholder')}
                  type="password"
                  dir="auto"
                  onChange={event => {
                    this.setState({ remotePass: event.target.value });
                  }}
                />
                {!this.props.config.settings.passwordStoreEnabled && (
                  <p>{globalString('profile/openAlert/passwordStoreInfo')}</p>
                )}
                {this.props.config.settings.passwordStoreEnabled && (
                  <p>{globalString('profile/openAlert/passwordStoreAdd')}</p>
                )}
              </div>
            )}
          {this.state.targetProfile &&
            this.state.targetProfile.bPassPhrase && (
              <div className="dialogContent">
                <p>{globalString('profile/openAlert/passPhrasePrompt')}</p>
                <input
                  autoFocus={!this.state.targetProfile.bRemotePass} // eslint-disable-line jsx-a11y/no-autofocus
                  className="pt-input passPhraseInput"
                  placeholder={globalString('profile/openAlert/passPhrasePlaceholder')}
                  type="password"
                  dir="auto"
                  onChange={event => {
                    this.setState({ passPhrase: event.target.value });
                  }}
                />
                {!this.props.config.settings.passwordStoreEnabled && (
                  <p>{globalString('profile/openAlert/passwordStoreInfo')}</p>
                )}
                {this.props.config.settings.passwordStoreEnabled && (
                  <p>{globalString('profile/openAlert/passwordStoreAdd')}</p>
                )}
              </div>
            )}
          <div className="dialogButtons">
            <AnchorButton
              className="openButton"
              intent={Intent.SUCCESS}
              type="submit"
              onClick={this.openSshShell}
              loading={this.props.store.layout.alertIsLoading}
              text={globalString('profile/openAlert/confirmButton')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              text={globalString('profile/openAlert/cancelButton')}
              onClick={this.closeSshConnectionAlert}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}
