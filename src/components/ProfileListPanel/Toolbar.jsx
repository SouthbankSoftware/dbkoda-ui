/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:34:55
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:34:51
*/

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {observer, inject} from 'mobx-react';
import {action, runInAction} from 'mobx';
import autobind from 'autobind-decorator';
import {AnchorButton, Intent, Position, Tooltip, Alert} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';
import {ProfileStatus} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';
import {Broker, EventType} from '../../helpers/broker';

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
      removeConnectionAlert: false,
    };

    this.newProfile = this.newProfile.bind(this);
  }

  // Placeholder - Linting disabled for this line.
 @action newProfile() { // eslint-disable-line class-methods-use-this
   this.props.store.profileList.selectedProfile = null;
   this.props.store.layout.drawerOpen = true;
  }

  // Placeholder - Linting disabled for this line.
  @action.bound
  editProfile() { // eslint-disable-line class-methods-use-this
    const {selectedProfile} = this.props.store.profileList;
    if(selectedProfile){
      if(selectedProfile.status === ProfileStatus.OPEN){
        NewToaster.show({message: 'Connection is not closed.', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      }else {
        this.props.store.layout.drawerOpen = true;
      }
    }else{
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  // Placeholder - Linting disabled for this line.
  @action.bound
  removeProfile() { // eslint-disable-line class-methods-use-this
    this.props.store.profiles.delete(this.props.store.profileList.selectedProfile.id);
    this.hideRemoveConnectionAlert();
    NewToaster.show({message: 'Remove connection success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
  }

  @autobind
  showRemoveConnectionAlert(){
    this.setState({removeConnectionAlert: true});
  }

  @autobind
  hideRemoveConnectionAlert(){
    this.setState({removeConnectionAlert: false});
  }

  @action.bound
  closeProfile(){
    const {selectedProfile} = this.props.store.profileList;
    if(selectedProfile){
      console.log('close profile ', selectedProfile.id);
      this.setState({closingProfile: true});
      featherClient().service('/mongo-connection').remove(selectedProfile.id)
        .then(v=>{
          console.log('got close response ', v);
          this.setState({closingProfile: false, closeConnectionAlert:false});
          runInAction(()=>selectedProfile.status = ProfileStatus.CLOSED);
          NewToaster.show({message: 'Connection Closed', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
        })
        .catch(err=>{
          console.log('error:', err);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({closingProfile: false, closeConnectionAlert:false});
        })
    } else {
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  @autobind
  hideCloseConnectionAlert(){
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
          <div className="pt-button-group">
            <Alert className="alert" intent={Intent.PRIMARY} isOpen={this.state.closeConnectionAlert} confirmButtonText="Close Connection"
                   cancelButtonText="Cancel" onConfirm={this.closeProfile}
                   onCancel={this.hideCloseConnectionAlert}>
              <p>Are you sure you want to close this connection?</p>
            </Alert>
            <Alert className="alert" intent={Intent.PRIMARY} isOpen={this.state.removeConnectionAlert} confirmButtonText="Remove Connection"
                   cancelButtonText="Cancel" onConfirm={this.removeProfile}
                   onCancel={this.hideRemoveConnectionAlert}>
              <p>Are you sure you want to remove this connection?</p>
            </Alert>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Create a new Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM_LEFT}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary newProfileButton"
                loading={this.props.store.profileList.creatingNewProfile}
                onClick={this.newProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Edit a Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-edit pt-intent-primary editProfileButton"
                onClick={this.editProfile}
                disabled={!selectedProfile || selectedProfile.status === ProfileStatus.OPEN } />
            </Tooltip>
            <Tooltip intent={Intent.PRIMARY}
                     hoverOpenDelay={1000}
                     content="Close a Profile"
                     tooltipClassName="pt-dark"
                     position={Position.BOTTOM}>
              <AnchorButton className="pt-icon-remove pt-intent-danger closeProfileButton"
                            loading={this.state.closingProfile}
                            disabled={!selectedProfile
                              || selectedProfile.status === ProfileStatus.CLOSED}
                            onClick={this.showCloseConnectionAlert}/>
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Remove a Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-cross pt-intent-danger removeProfileButton"
                onClick={this.showRemoveConnectionAlert}
                disabled = {!this.props.store.profileList.selectedProfile
                || this.props.store.profileList.selectedProfile.status === ProfileStatus.OPEN} />
            </Tooltip>
          </div>
          <span className="pt-navbar-divider" />
          <Tooltip
            intent={Intent.NONE}
            hoverOpenDelay={1000}
            content="Enter a string to search for Profiles"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <div className="pt-input-group .modifier">
              <span className="pt-icon pt-icon-search" />
              <input
                className="pt-input"
                type="search"
                placeholder="Filter Profiles..."
                dir="auto"
                onChange={this.onFilterChanged} />
            </div>
          </Tooltip>
        </div>
      </nav>
    );
  }
}
