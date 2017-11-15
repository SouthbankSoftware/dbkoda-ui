/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-21T09:27:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-14T23:26:13+11:00
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

/* eslint-disable react/prop-types */
/* eslint no-unused-vars:warn */
import { inject, observer } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import autobind from 'autobind-decorator';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { Cell, Column, SelectionModes, Table } from '@blueprintjs/table';
import { DBKodaToaster, NewToaster } from '#/common/Toaster';
import { DialogHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import {
  AnchorButton,
  Dialog,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  Position,
} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import { terminalTypes } from '~/api/Terminal';
import { ProfileForm } from '../ConnectionPanel/ProfileForm';
import { ProfileStatus } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
import { Broker, EventType } from '../../helpers/broker';
import ConnectionIcon from '../../styles/icons/connection-icon-2.svg';

import './styles.scss';

const React = require('react');

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config,
  profiles: allStores.profiles,
}))
@observer
export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetProfile: null,
      isCloseWarningActive: false,
      isRemoveWarningActive: false,
      isOpenWarningActive: false,
      passwordText: null,
      lastSelectRegion: null,
      remotePass: null,
      passPhrase: null,
    };
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
          const editorProfile = this.props.profiles.profiles.get(
            this.props.store.editorPanel.activeDropdownId,
          );
          this.props.store.profileList.selectedProfile = editorProfile;
          this.setState({ lastSelectRegion: null });
          this.forceUpdate();
        }
      },
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
    const profiles = this.props.profiles.profiles.entries();
    const profile = profiles[region[0].rows[0]][1];
    this.props.store.profileList.selectedProfile = profile;
    this.setState({ lastSelectRegion: region });
  }

  @action
  async openProfile() {
    const selectedProfile = this.state.targetProfile;
    const newPassword = this.state.passwordText;
    const usrRemotePass = this.state.remotePass;
    const usrPassPhrase = this.state.passPhrase;
    let connectionUrl;
    let query = {}; // eslint-disable-line
    if (selectedProfile.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + selectedProfile.host + ':' + selectedProfile.port;
    } else if (selectedProfile.urlRadio) {
      connectionUrl = selectedProfile.url;
    }
    if (selectedProfile.ssh) {
      query.ssh = selectedProfile.ssh;
      query.remoteHost = selectedProfile.host;
      query.remotePort = selectedProfile.port;
      query.sshHost = selectedProfile.remoteHost;
      query.remoteUser = selectedProfile.remoteUser;
      query.localHost = '127.0.0.1';
      selectedProfile.sshLocalPort = await ProfileForm.getRandomPort();
      query.localPort = selectedProfile.sshLocalPort;
      connectionUrl = ProfileForm.mongoProtocol + query.localHost + ':' + query.localPort;
      if (selectedProfile.passRadio) {
        query.remotePass = usrRemotePass;
      } else if (selectedProfile.keyRadio) {
        query.sshKeyFile = selectedProfile.sshKeyFile;
        query.passPhrase = usrPassPhrase;
      }
    }
    if (selectedProfile.sha) {
      query.username = selectedProfile.username;
      query.password = newPassword;
    }
    if (selectedProfile.ssl) {
      connectionUrl.indexOf('?') > 0
        ? (connectionUrl += '&ssl=true')
        : (connectionUrl += '?ssl=true');
    }
    query.database = selectedProfile.database;
    query.url = connectionUrl;
    query.ssl = selectedProfile.ssl;
    query.test = selectedProfile.test;
    query.authorization = selectedProfile.authorization;
    if (selectedProfile) {
      query.id = selectedProfile.id;
      query.shellId = selectedProfile.shellId;
    }
    this.props.store.profileList.creatingNewProfile = true;
    const service = featherClient().service('/mongo-connection');
    service.timeout = 30000;
    runInAction(() => {
      this.props.store.layout.alertIsLoading = true;
    });
    return service
      .create({}, { query })
      .then((res) => {
        this.onSuccess(res, selectedProfile);
      })
      .catch((err) => {
        console.error(err.stack);
        this.props.store.profileList.creatingNewProfile = false;
        this.closeOpenConnectionAlert();
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: <span dangerouslySetInnerHTML={{ __html: 'Error: ' + err.message }} />, // eslint-disable-line react/no-danger
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      });
  }

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
  @action
  onSuccess(res, data) {
    let message = globalString('connection/success');
    let position = Position.LEFT_BOTTOM;
    this.props.store.profileList.creatingNewProfile = false;
    if (!data.test) {
      Broker.emit(EventType.createShellOutputEvent(res.id, res.shellId), {
        id: res.id,
        shellId: res.shellId,
        output: res.output.join('\n'),
      });
      position = Position.RIGHT_TOP;
      // @TODO -> Someone should go through these and see which are unchanged from a new connection.
      const profile = {
        id: res.id,
        shellId: res.shellId,
        password: null,
        status: 'OPEN',
        database: data.database,
        alias: data.alias,
        authorization: data.authorization,
        host: data.host,
        hostRadio: data.hostRadio,
        port: data.port,
        ssl: data.ssl,
        test: data.test,
        url: data.url,
        urlRadio: data.urlRadio,
        username: data.username,
        sha: data.sha,
        ssh: data.ssh,
        remoteHost: data.remoteHost,
        remoteUser: data.remoteUser,
        sshLocalPort: data.sshLocalPort,
        passRadio: data.passRadio,
        keyRadio: data.keyRadio,
        sshKeyFile: data.sshKeyFile,
        dbVersion: res.dbVersion,
        shellVersion: res.shellVersion,
        initialMsg: res.output ? res.output.join('\r') : '',
      };
      if ((data.passPhrase && data.passPhrase != '') || data.bPassPhrase) {
        profile.bPassPhrase = true;
      }
      if ((data.remotePass && data.remotePass != '') || data.bRemotePass) {
        profile.bRemotePass = true;
      }
      this.props.profiles.profiles.set(res.id, profile);
      this.props.store.profileList.selectedProfile = this.props.profiles.profiles.get(res.id);
      Broker.emit(EventType.RECONNECT_PROFILE_CREATED, this.props.profiles.profiles.get(res.id));
      this.props.store.editors.forEach((value, _) => {
        if (value.shellId == res.shellId) {
          // the default shell is using the same shell id as the profile
          value.status = ProfileStatus.OPEN;
        } else if (value.profileId === res.id) {
          featherClient()
            .service('/mongo-shells')
            .create(
              {
                id: res.id,
              },
              {
                query: {
                  shellId: value.shellId,
                },
              },
            )
            .then(() => {
              value.status = ProfileStatus.OPEN;
            })
            .catch(err => console.error('failed to create shell connection', err));
        }
      });
    } else {
      message = globalString('connection/test', message);
    }
    this.closeOpenConnectionAlert();
    DBKodaToaster(position).show({
      message,
      className: 'success',
      iconName: 'pt-icon-thumbs-up',
    });
  }

  @action
  closeProfile() {
    const selectedProfile = this.state.targetProfile;
    const profiles = this.props.profiles.profiles;
    if (selectedProfile) {
      this.setState({ closingProfile: true });
      this.props.store.layout.alertIsLoading = true;
      featherClient()
        .service('/mongo-connection')
        .remove(selectedProfile.id)
        .then((v) => {
          runInAction(() => {
            selectedProfile.status = ProfileStatus.CLOSED;
            profiles.set(selectedProfile.id, selectedProfile);
          });
          this.setState({ closingProfile: false, closeConnectionAlert: false });
          if (this.props.config.settings.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.CLOSE_PROFILE,
              EventLogging.getFragmentEnum().PROFILES,
              'User closed a profile connection.',
            );
          }
          NewToaster.show({
            message: globalString('profile/toolbar/connectionClosed'),
            className: 'success',
            iconName: 'pt-icon-thumbs-up',
          });
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
          this.props.api.deleteProfileFromDrill({ profile: selectedProfile });
          if (this.props.store.profileList.selectedProfile.status == 'CLOSED') {
            runInAction(() => {
              this.props.store.treePanel.isRefreshDisabled = true;
            });
          }
          this.closeConnectionCloseAlert();
        })
        .catch((err) => {
          console.error('error:', err);
          if (this.props.config.settings.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().ERROR,
              EventLogging.getFragmentEnum().PROFILES,
              err.message,
            );
          }
          NewToaster.show({
            message: 'Error: ' + err.message,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
          this.setState({ closingProfile: false, closeConnectionAlert: false });
          this.closeConnectionCloseAlert();
        });
    } else {
      if (this.props.config.settings.telemetryEnabled) {
        EventLogging.recordManualEvent(
          EventLogging.getTypeEnum().WARNING,
          EventLogging.getFragmentEnum().PROFILES,
          'User attempted to close a connection profile with no profile selected..',
        );
      }
      NewToaster.show({
        message: globalString('profile/noProfile'),
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
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
        if (this.props.config.settings.telemetryEnabled) {
          EventLogging.recordManualEvent(
            EventLogging.getTypeEnum().WARNING,
            EventLogging.getFragmentEnum().PROFILES,
            'User attempted to edit active profile..',
          );
        }
        NewToaster.show({
          message: globalString('profile/notClosed'),
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      } else {
        if (this.props.config.settings.telemetryEnabled) {
          EventLogging.recordManualEvent(
            EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.EDIT_PROFILE.OPEN_DIALOG,
            EventLogging.getFragmentEnum().PROFILES,
            'User opened the Edit Connection Profile drawer.',
          );
        }
        this.props.store.showConnectionPane();
      }
    } else {
      if (this.props.config.settings.telemetryEnabled) {
        EventLogging.recordManualEvent(
          EventLogging.getTypeEnum().WARNING,
          EventLogging.getFragmentEnum().PROFILES,
          'User attempted to edit with no profile selected.',
        );
      }
      NewToaster.show({
        message: globalString('profile/noProfile'),
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }

  @action
  deleteProfile() {
    const { id: profileId } = this.state.targetProfile;
    const { profiles, api } = this.props;

    profiles.profiles.delete(profileId);
    profiles.save();
    api.removeAllTerminalsForProfile(profileId);

    if (this.props.config.settings.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.REMOVE_PROFILE,
        EventLogging.getFragmentEnum().PROFILES,
        'User removed a profile..',
      );
    }
    NewToaster.show({
      message: globalString('profile/removeSuccess'),
      className: 'success',
      iconName: 'pt-icon-thumbs-up',
    });
    this.closeConnectionRemoveAlert();
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
  openOpenConnectionAlert() {
    if (
      this.state.targetProfile.sha ||
      this.state.targetProfile.bPassPhrase ||
      this.state.targetProfile.bRemotePass
    ) {
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

  @action
  renderBodyContextMenu(context) {
    const profiles = this.props.profiles.profiles.entries();
    const profile = profiles[context.regions[0].rows[0]][1];
    this.state.targetProfile = profile;
    if (this.props.config.settings.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.OPEN_CONTEXT_MENU,
        EventLogging.getFragmentEnum().PROFILES,
        'Opened a context menu for a profile.',
      );
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
              iconName="pt-icon-unlock"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu editProfile"
              onClick={this.editProfile}
              text={globalString('profile/menu/editProfile')}
              intent={Intent.NONE}
              iconName="pt-icon-edit"
            />
          </div>
        </div>
      );
    } else {
      const { api: { getEditorDisplayName } } = this.props;

      windows.push(<MenuItem key={windows.length} text={globalString('profile/menu/editors')} />);
      this.props.store.editors.forEach((value) => {
        if (value.currentProfile.trim() == this.state.targetProfile.id.trim()) {
          windows.push(
            <div key={windows.length} className="menuItemWrapper">
              <MenuItem
                className={'profileListContextMenu editorListing ' + value.fileName}
                text={getEditorDisplayName(value)}
                onClick={() => this.swapToEditor(value)}
                intent={Intent.NONE}
                iconName="pt-icon-document"
              />
            </div>,
          );
        }
      });
      connect = (
        <div className="contextMenuGroup">
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu closeProfile"
              onClick={this.openCloseConnectionAlert}
              text={globalString('profile/menu/closeConnection')}
              intent={Intent.NONE}
              iconName="pt-icon-lock"
            />
          </div>
          <div className="menuItemWrapper">
            <MenuItem
              className="profileListContextMenu newWindow"
              onClick={() => this.props.api.addEditor({ profileId: profile.id })}
              text={globalString('profile/menu/newWindow')}
              intent={Intent.NONE}
              iconName="pt-icon-new-text-box"
            />
          </div>
        </div>
      );

      terminalOperations.push(
        <div key={terminalOperations.length} className="menuItemWrapper">
          <MenuItem
            className="profileListContextMenu newSshTerminal"
            onClick={() => {
              const { addTerminal } = this.props.api;

              addTerminal(terminalTypes.ssh, { profileId: profile.id });
            }}
            text={globalString('profile/menu/newSshTerminal')}
            intent={Intent.NONE}
            iconName="pt-icon-new-text-box"
          />
        </div>,
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
          iconName="pt-icon-new-text-box"
        />
      </div>,
    );

    return (
      <Menu className="profileListContextMenu">
        {connect}
        <div className="menuItemWrapper">
          <MenuItem
            className="profileListContextMenu deleteProfile"
            onClick={this.openRemoveConnectionAlert}
            text={globalString('profile/menu/deleteProfile')}
            intent={Intent.NONE}
            iconName="pt-icon-delete"
          />
        </div>
        <MenuDivider />
        {terminalOperations}
        {windows.length > 0 ? <MenuDivider /> : null}
        {windows}
      </Menu>
    );
  }

  render() {
    const profiles = this.props.profiles.profiles.entries();
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
            <ConnectionIcon className="dbKodaSVG" width={20} height={20} />
            <p className="profileListing">{profiles[rowIndex][1].alias}</p>
          </Cell>
        );
      }
      return (
        <Cell className={className}>
          <ConnectionIcon className="dbKodaSVG closedProfile" width={20} height={20} />
          <i className="profileListing closedProfile">{profiles[rowIndex][1].alias}</i>
        </Cell>
      );
    };
    return (
      <div className="profileList">
        <Table
          allowMultipleSelection={false}
          numRows={this.props.profiles.profiles.size}
          isRowHeaderShown={false}
          isColumnHeaderShown={false}
          selectionModes={SelectionModes.ROWS_AND_CELLS}
          isColumnResizable={false}
          renderBodyContextMenu={this.renderBodyContextMenu}
          isRowResizable={false}
          defaultColumnWidth={100}
          defaultRowHeight={60}
          onSelection={region => this.onSelection(region)}
          selectedRegions={this.state.lastSelectRegion}
        >
          <Column name="Connection Profiles" renderCell={renderCell} />
        </Table>
        <Dialog
          className="pt-dark close-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isCloseWarningActive}
        >
          <p>{globalString('profile/closeAlert/prompt')}</p>
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
          <p>{globalString('profile/removeAlert/prompt')}</p>
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
          {this.state.targetProfile &&
            this.state.targetProfile.sha && (
              <div className="dialogContent">
                <p>{globalString('profile/openAlert/passwordPrompt')}</p>
                <input
                  autoFocus
                  className="pt-input passwordInput"
                  placeholder={globalString('profile/openAlert/passwordPlaceholder')}
                  type="password"
                  dir="auto"
                  onChange={this.setPWText}
                />
              </div>
            )}
          {this.state.targetProfile &&
            this.state.targetProfile.bRemotePass && (
              <div className="dialogContent">
                <p>{globalString('profile/openAlert/remotePassPrompt')}</p>
                <input
                  autoFocus={!this.state.targetProfile.sha}
                  className="pt-input remotePassInput"
                  placeholder={globalString('profile/openAlert/remotePassPlaceholder')}
                  type="password"
                  dir="auto"
                  onChange={(event) => {
                    this.setState({ remotePass: event.target.value });
                  }}
                />
              </div>
            )}
          {this.state.targetProfile &&
            this.state.targetProfile.bPassPhrase && (
              <div className="dialogContent">
                <p>{globalString('profile/openAlert/passPhrasePrompt')}</p>
                <input
                  autoFocus={!this.state.targetProfile.sha && !this.state.targetProfile.bRemotePass}
                  className="pt-input passPhraseInput"
                  placeholder={globalString('profile/openAlert/passPhrasePlaceholder')}
                  type="password"
                  dir="auto"
                  onChange={(event) => {
                    this.setState({ passPhrase: event.target.value });
                  }}
                />
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
              loading={this.props.store.layout.alertIsLoading}
              onClick={this.closeOpenConnectionAlert}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}
