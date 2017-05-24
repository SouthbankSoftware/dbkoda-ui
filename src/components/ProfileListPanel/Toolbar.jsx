/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-15 13:34:55
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T17:57:04+10:00
 */
/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, runInAction} from 'mobx';
import autobind from 'autobind-decorator';
import {Alert, AnchorButton, Intent, Position, Tooltip} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';
import EventLogging from '#/common/logging/EventLogging';
import {ProfileStatus} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';
import {Broker, EventType} from '../../helpers/broker';
import AddIcon from '../../styles/icons/add-icon.svg';
import EditProfileIcon from '../../styles/icons/edit-profile-icon.svg';
import CloseProfileIcon from '../../styles/icons/close-profile-icon.svg';
import RemoveProfileIcon from '../../styles/icons/remove-profile-icon.svg';
import './styles.scss';

@inject('store')
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

    this.newProfile = this
      .newProfile
      .bind(this);
  }

  /**
   * Action for opening the new Profile Drawer.
   */
  @action newProfile() {
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.NEW_PROFILE.OPEN_DIALOG, EventLogging.getFragmentEnum().PROFILES, 'User opened the New Connection Profile drawer.');
    }
    this.props.store.profileList.selectedProfile = null;
    this
      .props
      .store
      .showConnectionPane();
  }

  /**
   * Action for opening the edit Profile Drawer.
   */
  @action.bound
  editProfile() {
    const {selectedProfile} = this.props.store.profileList;
    if (selectedProfile) {
      if (selectedProfile.status === ProfileStatus.OPEN) {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().PROFILES, 'User attempted to edit active profile..');
        }
        NewToaster.show({message: globalString('profile/not'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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

  /**
   * Action for removing a profile.
   */
  @action.bound
  removeProfile() {
    // eslint-disable-line class-methods-use-this
    this
      .props
      .store
      .profiles
      .delete(this.props.store.profileList.selectedProfile.id);
    this.hideRemoveConnectionAlert();
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.REMOVE_PROFILE, EventLogging.getFragmentEnum().PROFILES, 'User removed a profile..');
    }
    NewToaster.show({message: globalString('profile/removeSuccess'), intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
  }

  @autobind
  showRemoveConnectionAlert() {
    this.setState({removeConnectionAlert: true});
  }

  @autobind
  hideRemoveConnectionAlert() {
    this.setState({removeConnectionAlert: false});
  }

  @action.bound
  closeProfile() {
    const {selectedProfile} = this.props.store.profileList;
    const {profiles} = this.props.store;
    if (selectedProfile) {
      console.log('close profile ', selectedProfile.id);
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
      NewToaster.show({message: globalString('profile/noProfile'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  @autobind
  hideCloseConnectionAlert() {
    this.setState({closeConnectionAlert: false});
  }

  @autobind
  showCloseConnectionAlert() {
    this.setState({closeConnectionAlert: true});
  }

  render() {
    const {selectedProfile} = this.props.store.profileList;
    return (
      <nav className="pt-navbar profileListToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Connection Profiles</div>
          <Alert
            className="pt-dark close-profile-alert-dialog"
            intent={Intent.PRIMARY}
            isOpen={this.state.closeConnectionAlert}
            confirmButtonText={globalString('profile/closeAlert/confirmButton')}
            cancelButtonText={globalString('profile/closeAlert/cancelButton')}
            onConfirm={this.closeProfile}
            onCancel={this.hideCloseConnectionAlert}>
            <p>{globalString('profile/closeAlert/prompt')}</p>
          </Alert>
          <Alert
            className="pt-dark remove-profile-alert-dialog"
            intent={Intent.PRIMARY}
            isOpen={this.state.removeConnectionAlert}
            confirmButtonText={globalString('profile/removeAlert/confirmButton')}
            cancelButtonText={globalString('profile/removeAlert/cancelButton')}
            onConfirm={this.removeProfile}
            onCancel={this.hideRemoveConnectionAlert}>
            <p>{globalString('profile/removeAlert/prompt')}</p>
          </Alert>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/newProfileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM_LEFT}>
            <AnchorButton
              className="newProfileButton"
              onClick={this.newProfile}>
              <AddIcon width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/editProfileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="editProfileButton"
              onClick={this.editProfile}
              disabled={!selectedProfile || selectedProfile.status === ProfileStatus.OPEN}>
              <EditProfileIcon width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/closeProfileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className=" dangerButton closeProfileButton"
              loading={this.state.closingProfile}
              disabled={!selectedProfile || selectedProfile.status === ProfileStatus.CLOSED}
              onClick={this.showCloseConnectionAlert}>
              <CloseProfileIcon width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/removeProfileTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <AnchorButton
              className="dangerButton removeProfileButton"
              onClick={this.showRemoveConnectionAlert}
              disabled={!this.props.store.profileList.selectedProfile || this.props.store.profileList.selectedProfile.status === ProfileStatus.OPEN}>
              <RemoveProfileIcon width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <span className="pt-navbar-divider" />
          <Tooltip
            intent={Intent.NONE}
            hoverOpenDelay={1000}
            content={globalString('profile/toolbar/searchTooltip')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <div className="pt-input-group .modifier">
              <span className="pt-icon pt-icon-search" />
              <input
                className="pt-input"
                type="search"
                placeholder={globalString('profile/toolbar/searchPlaceholder')}
                dir="auto"
                onChange={this.onFilterChanged} />
            </div>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
