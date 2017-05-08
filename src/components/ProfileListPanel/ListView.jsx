/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-15 13:40:45
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:40:42
 */
/* eslint-disable react/prop-types */
import _ from 'lodash';
import {inject, observer} from 'mobx-react';
import {action, runInAction, observable} from 'mobx';
import uuidV1 from 'uuid';
import autobind from 'autobind-decorator';
import {Cell, Column, SelectionModes, Table} from '@blueprintjs/table';
import {NewToaster} from '#/common/Toaster';
import {Alert, Intent, Menu, MenuItem} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import {ProfileStatus} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';
import {Broker, EventType} from '../../helpers/broker';
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
      openWithAuthorization: false
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
    NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
    this.props.store.editorToolbar.isActiveExecuting = false;
    if (this.props.store.editorToolbar.newEditorForTreeAction) {
      this.props.store.editorToolbar.newEditorForTreeAction = false;
      this.props.store.treeActionPanel.treeActionEditorId = editorId;
    }
    return editorId;
  }

  @action
  openProfile() {
    /*    console.log('PROFILE1: ', this.state.targetProfile);
     const selectedProfile = this.state.targetProfile;
    if (selectedProfile) {
      if (selectedProfile.status === ProfileStatus.OPEN) {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to edit active profile..');
        }
        NewToaster.show({message: 'Connection is not closed.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      } else {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.EDIT_PROFILE.OPEN_DIALOG, EventLogging.getFragmentEnum().PROFILES, 'User opened the Edit Connection Profile drawer.');
        }
        this.props.store.showConnectionPane();
      }
    } else {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to edit with no profile selected.');
      }
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }*/
    this.closeOpenConnectionAlert();
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
          NewToaster.show({message: 'Connection Closed', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
        })
        .catch((err) => {
          console.log('error:', err);
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().PROFILES, err.message);
          }
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({closingProfile: false, closeConnectionAlert: false});
        });
    } else {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to close a connection profile with no profile selected..');
      }
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
        NewToaster.show({message: 'Connection is not closed.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
    NewToaster.show({message: 'Remove connection success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
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

  @action
  renderBodyContextMenu(context) {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const profile = profiles[(context.regions[0].rows[0])][1];
    this.state.targetProfile = profile;
    console.log(this.state.targetProfile);
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.OPEN_CONTEXT_MENU, EventLogging.getFragmentEnum().PROFILES, 'Opened a context menu for a profile.');
    }
    let connect;
    if (profile.status == 'CLOSED') {
      connect = (
        <div>
          <MenuItem
            onClick={this.openOpenConnectionAlert}
            text="Open Connection ( TO DO )"
            iconName="pt-icon-unlock"
            intent={Intent.NONE} />
          <MenuItem
            onClick={this.editProfile}
            text="Edit Profile"
            iconName="pt-icon-edit"
            intent={Intent.NONE} />
        </div>
      );
    } else {
      connect = (
        <div>
          <MenuItem
            onClick={this.openCloseConnectionAlert}
            text="Close Connection"
            iconName="pt-icon-lock"
            intent={Intent.NONE} />
          <MenuItem
            onClick={this.newEditorWindow}
            text="New Window"
            iconName="pt-icon-new-text-box"
            intent={Intent.NONE} />
        </div>
      );
    }

    return (
      <Menu>
        {connect}
        <MenuItem
          onClick={this.openRemoveConnectionAlert}
          text="Delete Profile"
          iconName="pt-icon-delete"
          intent={Intent.NONE} />
        <MenuItem
          onClick={this.openRemoveConnectionAlert}
          text="Editors ( TO DO )"
          iconName="pt-icon-delete"
          intent={Intent.NONE} />
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
        return <Cell className={className}>{profiles[rowIndex][1].alias}</Cell>;
      }
      return (
        <Cell className={className}>
          <i className="closedProfile">{profiles[rowIndex][1].alias}</i>
        </Cell>
      );
    };
    return (
      <div className="profileList">
        <Table
          allowMultipleSelection={false}
          numRows={this.props.store.profiles.size}
          isRowHeaderShown={false}
          selectionModes={SelectionModes.ROWS_AND_CELLS}
          isColumnResizable={false}
          renderBodyContextMenu={this.renderBodyContextMenu}
          isRowResizable={false}
          defaultColumnWidth={1024}
          onSelection={region => this.onSelection(region)}>
          <Column name="Connection Profiles" renderCell={renderCell} />
        </Table>
        <Alert
          className="pt-dark close-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isCloseWarningActive}
          confirmButtonText="Close Connection"
          cancelButtonText="Cancel"
          onConfirm={this.closeProfile}
          onCancel={this.closeConnectionCloseAlert}>
          <p>Are you sure you want to close this connection?</p>
        </Alert>
        <Alert
          className="pt-dark remove-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isRemoveWarningActive}
          confirmButtonText="Remove"
          cancelButtonText="Cancel"
          onConfirm={this.deleteProfile}
          onCancel={this.closeConnectionRemoveAlert}>
          <p>Are you sure you want to remove this connection?</p>
        </Alert>
        <Alert
          className="pt-dark open-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.isOpenWarningActive}
          confirmButtonText="Open"
          cancelButtonText="Cancel"
          onConfirm={this.openProfile}
          onCancel={this.closeOpenConnectionAlert}>
          <p>Are you sure you want to remove this connection?</p>
        </Alert>
      </div>
    );
  }
}
