/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-15 13:40:45
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-23T08:50:01+10:00
 */
/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import _ from 'lodash';
import {inject, observer} from 'mobx-react';
import {action, runInAction, observable} from 'mobx';
import uuidV1 from 'uuid';
import autobind from 'autobind-decorator';
import {Cell, Column, SelectionModes, Table} from '@blueprintjs/table';
import {NewToaster, DBCodaToaster} from '#/common/Toaster';
import {
  Alert,
  Intent,
  Menu,
  MenuItem,
  Position,
  MenuDivider
} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import {ProfileForm} from '../ConnectionPanel/ProfileForm';
import {ProfileStatus} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';
import {Broker, EventType} from '../../helpers/broker';
import ConnectionIcon from '../../styles/icons/connection-icon-2.svg';
import OpenProfileIcon from '../../styles/icons/open-icon.svg';
import CloseProfileIcon from '../../styles/icons/close-profile-icon.svg';
import EditProfileIcon from '../../styles/icons/edit-profile-icon.svg';
import DeleteProfileIcon from '../../styles/icons/remove-profile-icon.svg';
import DocumentProfileIcon from '../../styles/icons/document-icon.svg';
import NewDocumentProfileIcon from '../../styles/icons/document-solid-icon.svg';

import './styles.scss';

const React = require('react');

@inject('store')
@observer
export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetProfile: null,
      isCloseWarningActive: false,
      isRemoveWarningActive: false,
      openWithAuthorization: false,
      passwordText: null
    };
    this.renderBodyContextMenu = this
      .renderBodyContextMenu
      .bind(this);
    this.openProfile = this
      .openProfile
      .bind(this);
    this.closeProfile = this
      .closeProfile
      .bind(this);
    this.newEditorWindow = this
      .newEditorWindow
      .bind(this);
    this.editProfile = this
      .editProfile
      .bind(this);
    this.deleteProfile = this
      .deleteProfile
      .bind(this);
    this.swapToEditor = this
      .swapToEditor
      .bind(this);
  }

  @action
  onSelection(region) {
    if (region.length == 0) {
      this.props.store.profileList.selectedProfile = null;
      return;
    }
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const profile = profiles[(region[0].rows[0])][1];
    this.props.store.profileList.selectedProfile = profile;
  }

  /**
   * Action for setting the new editor state.
   * Note: This function exists only because of an issue with MobX strict mode in callbacks.
   * Guan has found a solution to this using runInAction (@Mike, Replace this some time.)
   * @param {Object} res - The response recieved from Feathers.
   * @param {Object} options - options for new editor
   * @return {string} editor ID
   */
  @action setNewEditorState(res, options = {}) {
    const fileName = `new${this
      .props
      .store
      .profiles
      .get(res.id)
      .editorCount}.js`;
    const editorId = uuidV1();
    this
      .props
      .store
      .profiles
      .get(res.id)
      .editorCount += 1;
    this
      .props
      .store
      .editors
      .set(editorId, observable(_.assign({
        // eslint-disable-line react/prop-types
        id: editorId,
        alias: this
          .props
          .store
          .profiles
          .get(res.id)
          .alias,
        profileId: res.id,
        shellId: res.shellId,
        currentProfile: res.id,
        fileName,
        executing: false,
        visible: true,
        initialMsg: res.output
          ? res
            .output
            .join('\n')
          : '',
        code: '',
        path: null
      }, options)));
    this.props.store.editorPanel.creatingNewEditor = false;
    this.props.store.editorToolbar.noActiveProfile = false;
    this.props.store.editorToolbar.id = res.id;
    this.props.store.editorToolbar.shellId = res.shellId;
    this.props.store.editorToolbar.newConnectionLoading = false;
    this.props.store.editorPanel.activeEditorId = editorId;
    this.props.store.editorToolbar.currentProfile = res.id;
    this.props.store.editorToolbar.noActiveProfile = false;
    NewToaster.show({message: globalString('connection/success'), intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
    this.props.store.editorToolbar.isActiveExecuting = false;
    if (this.props.store.editorToolbar.newEditorForTreeAction) {
      this.props.store.editorToolbar.newEditorForTreeAction = false;
      this.props.store.treeActionPanel.treeActionEditorId = editorId;
    }
    return editorId;
  }

  @action
  openProfile() {
    const selectedProfile = this.state.targetProfile;
    const newPassword = this.state.passwordText;
    let connectionUrl;
    let query = {}; // eslint-disable-line
    if (selectedProfile.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + selectedProfile.host + ':' + selectedProfile.port;
    } else if (selectedProfile.urlRadio) {
      connectionUrl = selectedProfile.url;
    }
    if (selectedProfile.sha) {
      query.username = selectedProfile.username;
      query.password = newPassword;
    }
    if (selectedProfile.ssl) {
      connectionUrl.indexOf('?') > 0
        ? connectionUrl += '&ssl=true'
        : connectionUrl += '?ssl=true';
    }
    query.database = 'admin';
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
    console.log('Q: ', query);
    return service.create({}, {query}).then((res) => {
      this.onSuccess(res, selectedProfile);
    }).catch((err) => {
      console.log(err.stack);
      this.props.store.profileList.creatingNewProfile = false;
      this.closeOpenConnectionAlert();
      DBCodaToaster(Position.LEFT_BOTTOM).show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    });
  }

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
  @action
  onSuccess(res, data) {
    console.log('connect successfully ', res);
    let message = globalString('connection/success');
    let position = Position.LEFT_BOTTOM;
    this.props.store.profileList.creatingNewProfile = false;
    if (!data.test) {
      this
        .props
        .store
        .profiles
        .delete(data.id);
      Broker.emit(EventType.createShellOutputEvent(res.id, res.shellId), {
        id: res.id,
        shellId: res.shellId,
        output: res
          .output
          .join('\r')
      });
      position = Position.RIGHT_TOP;
      this
        .props
        .store
        .profiles
        .set(res.id, {
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
          editorCount: 1,
          dbVersion: res.dbVersion,
          shellVersion: res.shellVersion,
          initialMsg: res.output
            ? res
              .output
              .join('\r')
            : ''
        });
      this.props.store.profileList.selectedProfile = this
        .props
        .store
        .profiles
        .get(res.id);
      Broker.emit(EventType.NEW_PROFILE_CREATED, this.props.store.profiles.get(res.id));
    } else {
      message = globalString('connection/test', message);
    }
    this.closeOpenConnectionAlert();
    DBCodaToaster(position).show({message, intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
  }

  @action
  closeProfile() {
    console.log('Close Profile: ', this.state.targetProfile);
    const selectedProfile = this.state.targetProfile;
    const profiles = this.props.store.profiles;
    if (selectedProfile) {
      this.setState({closingProfile: true});
      featherClient()
        .service('/mongo-connection')
        .remove(selectedProfile.id)
        .then((v) => {
          console.log('got close response ', v);
          runInAction(() => {
            selectedProfile.status = ProfileStatus.CLOSED;
            profiles.set(selectedProfile.id, selectedProfile);
          });
          this.setState({closingProfile: false, closeConnectionAlert: false});
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.CLOSE_PROFILE, EventLogging.getFragmentEnum().PROFILES, 'User closed a profile connection.');
          }
          NewToaster.show({message: globalString('profile/toolbar/connectionClosed'), intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
          console.log('TEST123: ', this.props.store.profileList.selectedProfile.status);
          if (this.props.store.profileList.selectedProfile.status == 'CLOSED') {
            runInAction(() => {
              this.props.store.treePanel.isRefreshDisabled = true;
            });
          }
          this.closeConnectionCloseAlert();
        })
        .catch((err) => {
          console.log('error:', err);
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().PROFILES, err.message);
          }
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({closingProfile: false, closeConnectionAlert: false});
          this.closeConnectionCloseAlert();
        });
    } else {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to close a connection profile with no profile selected..');
      }
      NewToaster.show({message: globalString('profile/noProfile'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
    this.closeConnectionCloseAlert();
  }

  @action
  newEditorWindow() {
    console.log('PROFILE3: ', this.state.targetProfile);
    const options = {};
    try {
      runInAction(() => {
        this.props.store.editorPanel.creatingNewEditor = true;
        this.props.store.editorToolbar.newConnectionLoading = true;
      });

      const profileId = this.state.targetProfile.id;
      return featherClient()
        .service('/mongo-shells')
        .create({id: profileId})
        .then((res) => {
          console.log('get response', res);
          return this.setNewEditorState(res, options);
        })
        .catch((err) => {
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
          }
          this.props.store.editorPanel.creatingNewEditor = false;
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          runInAction(() => {
            this.props.store.editorToolbar.newConnectionLoading = false;
          });
        });
    } catch (err) {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
      }
      NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      this.props.store.editorPanel.creatingNewEditor = false;
    }
  }

  @action
  editProfile() {
    const selectedProfile = this.state.targetProfile;
    if (selectedProfile) {
      if (selectedProfile.status === ProfileStatus.OPEN) {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to edit active profile..');
        }
        NewToaster.show({message: globalString('profile/notClosed'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      } else {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.EDIT_PROFILE.OPEN_DIALOG, EventLogging.getFragmentEnum().PROFILES, 'User opened the Edit Connection Profile drawer.');
        }
        this
          .props
          .store
          .showConnectionPane();
      }
    } else {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to edit with no profile selected.');
      }
      NewToaster.show({message: globalString('profile/noProfile'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  @action
  deleteProfile() {
    this
      .props
      .store
      .profiles
      .delete(this.props.store.profileList.selectedProfile.id);
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.REMOVE_PROFILE, EventLogging.getFragmentEnum().PROFILES, 'User removed a profile..');
    }
    NewToaster.show({message: globalString('profile/removeSuccess'), intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
    this.closeConnectionRemoveAlert();
  }
  @autobind
  openCloseConnectionAlert() {
    this.setState({isCloseWarningActive: true});
  }
  @autobind
  closeConnectionCloseAlert() {
    this.setState({isCloseWarningActive: false});
  }
  @autobind
  openRemoveConnectionAlert() {
    this.setState({isRemoveWarningActive: true});
  }
  @autobind
  closeConnectionRemoveAlert() {
    this.setState({isRemoveWarningActive: false});
  }
  @autobind
  openOpenConnectionAlert() {
    if (this.state.targetProfile.sha) {
      this.state.openWithAuthorization = true;
      this.setState({isOpenWarningActive: true});
    } else {
      this.state.openWithAuthorization = false;
      this.openProfile();
    }
  }
  @autobind
  closeOpenConnectionAlert() {
    this.setState({isOpenWarningActive: false});
  }
  @autobind
  setPWText(event) {
    this.setState({passwordText: event.target.value});
  }
  @autobind
  @action
  swapToEditor(event) {
    this.props.store.editorToolbar.id = event.id;
    this.props.store.editorToolbar.shellId = event.shellId;
    this.props.store.editorPanel.activeEditorId = event.id;
  }
  @action
  renderBodyContextMenu(context) {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const profile = profiles[(context.regions[0].rows[0])][1];
    this.state.targetProfile = profile;
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.OPEN_CONTEXT_MENU, EventLogging.getFragmentEnum().PROFILES, 'Opened a context menu for a profile.');
    }
    let connect;
    const windows = [];
    if (profile.status == 'CLOSED') {
      connect = (
        <div className="contextMenuGroup">
          <div className="menuItemWrapper">
            <OpenProfileIcon className="dbCodaSVG" width={20} height={20} />
            <MenuItem
              className="profileListContextMenu openProfile"
              onClick={this.openOpenConnectionAlert}
              text={globalString('profile/menu/openConnection')}
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper">
            <EditProfileIcon className="dbCodaSVG" width={20} height={20} />
            <MenuItem
              className="profileListContextMenu editProfile"
              onClick={this.editProfile}
              text={globalString('profile/menu/editProfile')}
              intent={Intent.NONE} />
          </div>
        </div>
      );
    } else {
      windows.push((<MenuItem text={globalString('profile/menu/editors')} />));
      this
        .props
        .store
        .editors
        .forEach((value) => {
          if (value.profileId.trim() == this.state.targetProfile.id.trim()) {
            windows.push((
              <div className="menuItemWrapper">
                <DocumentProfileIcon className="dbCodaSVG" width={20} height={20} />
                <MenuItem
                  className={'profileListContextMenu editorListing ' + value.fileName}
                  text={value.fileName}
                  onClick={() => this.swapToEditor(value)}
                  intent={Intent.NONE} />
              </div>
            ));
          }
        });
      connect = (
        <div className="contextMenuGroup">
          <div className="menuItemWrapper">
            <CloseProfileIcon className="dbCodaSVG" width={20} height={20} />
            <MenuItem
              className="profileListContextMenu closeProfile"
              onClick={this.openCloseConnectionAlert}
              text={globalString('profile/menu/closeConnection')}
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper">
            <NewDocumentProfileIcon className="dbCodaSVG" width={20} height={20} />
            <MenuItem
              className="profileListContextMenu newWindow"
              onClick={this.newEditorWindow}
              text={globalString('profile/menu/newWindow')}
              intent={Intent.NONE} />
          </div>
        </div>
      );
    }
    return (
      <Menu className="profileListContextMenu">
        {connect}
        <div className="menuItemWrapper">
          <DeleteProfileIcon className="dbCodaSVG" width={20} height={20} />
          <MenuItem
            className="profileListContextMenu deleteProfile"
            onClick={this.openRemoveConnectionAlert}
            text={globalString('profile/menu/deleteProfile')}
            intent={Intent.NONE} />
        </div>
        <MenuDivider /> {windows}
      </Menu>

    );
  }

  render() {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const renderCell = (rowIndex : number) => {
      const className = this.props.store.profileList && this.props.store.profileList.selectedProfile && profiles[rowIndex][1].id === this.props.store.profileList.selectedProfile.id
        ? 'connection-profile-cell connection-profile-cell-selected'
        : 'connection-profile-cell';
      if (profiles[rowIndex][1].status == 'OPEN') {
        return (
          <Cell className={className + ' profileListItem ' + profiles[rowIndex][1].alias}>
            <ConnectionIcon className="dbCodaSVG" width={20} height={20} />
            <p className="profileListing">{profiles[rowIndex][1].alias}</p>
          </Cell>
        );
      }
      return (
        <Cell className={className}>
          <ConnectionIcon className="dbCodaSVG" width={20} height={20} />
          <i className="profileListing closedProfile">{profiles[rowIndex][1].alias}</i>
        </Cell>
      );
    };
    return (
      <div className="profileList">
        <Table
          allowMultipleSelection={false}
          numRows={this.props.store.profiles.size}
          isRowHeaderShown={false}
          isColumnHeaderShown={false}
          selectionModes={SelectionModes.ROWS_AND_CELLS}
          isColumnResizable={false}
          renderBodyContextMenu={this.renderBodyContextMenu}
          isRowResizable={false}
          defaultColumnWidth={1024}
          defaultRowHeight={60}
          onSelection={region => this.onSelection(region)}>
          <Column name="Connection Profiles" renderCell={renderCell} />
        </Table>
        <Alert
          className="pt-dark close-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isCloseWarningActive}
          confirmButtonText={globalString('profile/closeAlert/confirmButton')}
          cancelButtonText={globalString('profile/closeAlert/cancelButton')}
          onConfirm={this.closeProfile}
          onCancel={this.closeConnectionCloseAlert}>
          <p>{globalString('profile/closeAlert/prompt')}</p>
        </Alert>
        <Alert
          className="pt-dark remove-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isRemoveWarningActive}
          confirmButtonText={globalString('profile/removeAlert/confirmButton')}
          cancelButtonText={globalString('profile/removeAlert/cancelButton')}
          onConfirm={this.deleteProfile}
          onCancel={this.closeConnectionRemoveAlert}>
          <p>{globalString('profile/removeAlert/prompt')}</p>
        </Alert>
        <Alert
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isOpenWarningActive}
          confirmButtonText={globalString('profile/openAlert/confirmButton')}
          cancelButtonText={globalString('profile/openAlert/cancelButton')}
          onConfirm={this.openProfile}
          onCancel={this.closeOpenConnectionAlert}>
          <p>{globalString('profile/openAlert/prompt')}</p>
          <input
            className="pt-input passwordInput"
            placeholder={globalString('profile/openAlert/inputPlaceholder')}
            type="password"
            dir="auto"
            onChange={this.setPWText} />
        </Alert>
      </div>
    );
  }
}
