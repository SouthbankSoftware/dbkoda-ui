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
import {action} from 'mobx';
import {AnchorButton, Intent, Position, Tooltip} from '@blueprintjs/core';
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
  removeProfile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
          this.setState({closingProfile: false});
          selectedProfile.status = ProfileStatus.CLOSED;
          NewToaster.show({message: 'Connection Closed', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          Broker.emit(EventType.PROFILE_CLOSED, selectedProfile.id);
        })
        .catch(err=>{
          console.log('error:', err);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({closingProfile: false});
        })
    } else {
      NewToaster.show({message: 'No Profile Selected!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  render() {
    return (
      <nav className="pt-navbar profileListToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
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
                disabled={!this.props.store.profileList.selectedProfile} />
            </Tooltip>
            <Tooltip intent={Intent.PRIMARY}
                     hoverOpenDelay={1000}
                     content="Close a Profile"
                     tooltipClassName="pt-dark"
                     position={Position.BOTTOM}>
              <AnchorButton className="pt-icon-cross pt-intent-danger closeProfileButton"
                            loading={this.state.closingProfile}
                            disabled={!this.props.store.profileList.selectedProfile}
                            onClick={this.closeProfile}/>
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Remove a Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-remove pt-intent-danger removeProfileButton"
                onClick={this.removeProfile}
                disabled />
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
