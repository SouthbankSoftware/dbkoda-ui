/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 11:19:16
*/

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, inject, PropTypes} from 'mobx-react';
import {action} from 'mobx';
import {
  AnchorButton,
  Intent,
  Position,
  Tooltip,
  Hotkey,
  Hotkeys,
  HotkeysTarget
} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';
import './style.scss';

@inject('store')
@observer
@HotkeysTarget
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newConnectionLoading: false,
      currentProfile: 0,
      noActiveProfile: true,
      noExecutionRunning: true,
      id: 0,
      shellId: 0
    };

    this.addEditor = this
      .addEditor
      .bind(this);
    this.executeLine = this
      .executeLine
      .bind(this);
    this.executeAll = this
      .executeAll
      .bind(this);
    this.explainPlan = this
      .explainPlan
      .bind(this);
    this.onDropdownChanged = this
      .onDropdownChanged
      .bind(this);
    this.onFilterChanged = this
      .onFilterChanged
      .bind(this);
    this.renderHotkeys = this
      .onFilterChanged
      .bind(this);
  }

  // -------------------// . TOOLBAR ACTIONS // ----------------- //
  @action addEditor() {
    try {
      this.setState({newConnectionLoading: true});
      featherClient()
        .service('/mongo-connection')
        .create({}, {
          query: {
            url: 'mongodb://localhost/27017'
          }
        })
        .then((res) => {
          console.log('get response', res);
          this
            .props
            .store // eslint-disable-line react/prop-types
            .editors // eslint-disable-line react/prop-types
            .set(res.id, {
              id: res.id,
              alias: res.id + ':' + res.shellId,
              shellId: res.shellId,
              visible: true
            }); // eslint-disable-line react/prop-types
          this
            .props
            .store // eslint-disable-line react/prop-types
            .profiles // eslint-disable-line react/prop-types
            .set(res.id, {shellId: res.shellId}); // eslint-disable-line react/prop-types
          // eslint-disable-line react/prop-types
          this.state.noActiveProfile = false;
          this.state.id = res.id;
          this.shellId = res.shellId;
          this.setState({newConnectionLoading: false});

          // Send message to Panel to crate new editor.
          this
            .props
            .newEditor(res.id); // eslint-disable-line react/prop-types
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }
  // Placeholder - Linting disabled for this line.
  openFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  saveFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  @action executeLine() {
    this.props.store.editorPanel.executingEditorLines = true;
  }

  @action executeAll() {
    this.props.store.editorPanel.executingEditorAll = true;
  }
  // Placeholder - Linting disabled for this line.
  explainPlan() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  stopExecution() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  @action onDropdownChanged(event) {
    this.props.store.editorPanel.activeDropdownId = event.target.value;
    this.setState({currentProfile: event.target.value});
    if (event.target.value == 'Default') {
      this.setState({noActiveProfile: true});
    } else {
      this.setState({noActiveProfile: false});
    }
  }

  @action onFilterChanged(event) {
    const filter = event
      .target
      .value
      .replace(/ /g, '');
    this
      .props
      .store
      .editors
      .forEach((value) => {
        if (value.alias.includes(filter)) {
          console.log(value.alias, ' includes filter (', filter, ')');
          value.visible = true;
        } else {
          if (value.id === this.props.store.editorPanel.activeEditorId) {
            this.props.store.editorPanel.activeEditorId = 0;
          }
          value.visible = false;
        }
      });
  }

  render() {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const activeId = this.props.store.editorPanel.activeDropdownId;
    return (
      <nav className="pt-navbar editorToolBar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Add a new Editor"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary"
                loading={this.state.newConnectionLoading}
                onClick={this.addEditor} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Open a File from Disc"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-document-open pt-intent-primary"
                onClick={this.openFile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Save Editor Contents to Disc"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-floppy-disk pt-intent-primary"
                onClick={this.saveFile} />
            </Tooltip>
          </div>
          <span className="pt-navbar-divider" />
          <div className="pt-button-group pt-intent-primary">
            <div className="pt-select pt-intent-primary">
              <Tooltip
                intent={Intent.NONE}
                hoverOpenDelay={1000}
                content="Select a connection to send commands to."
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}>
                <select
                  onChange={this.onDropdownChanged}
                  value={activeId}
                  className="pt-intent-primary">
                  <option key="Default" value="Default">Default</option>; {profiles.map((profile) => {
                    return <option key={profile[0]} value={profile[0]}>{profile[0]}</option>; // eslint-disable-line react/no-array-index-key
                  })}
                </select>
              </Tooltip>
            </div>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Execute Selected Commands"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-chevron-right pt-intent-primary"
                onClick={this.executeLine}
                disabled={this.state.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Execute All Commands"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-double-chevron-right pt-intent-primary"
                onClick={this.executeAll}
                disabled={this.state.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Explain a Query"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-help pt-intent-primary"
                onClick={this.explainPlan}
                disabled={this.state.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content="Stop Execution"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-stop pt-intent-danger"
                onClick={this.stopExecution}
                disabled={this.state.noExecutionRunning} />
            </Tooltip>
          </div>
          <span className="pt-navbar-divider" />
          <Tooltip
            intent={Intent.NONE}
            hoverOpenDelay={1000}
            content="Enter a string to search for Editors"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <div className="pt-input-group .modifier">
              <span className="pt-icon pt-icon-search" />
              <input
                className="pt-input"
                type="search"
                placeholder="Filter Tabs..."
                dir="auto"
                onChange={this.onFilterChanged} />
            </div>
          </Tooltip>
        </div>
      </nav>
    );
  }

  renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey
          global
          combo="shift + n"
          label="New Editor"
          onKeyDown={this.addEditor} />
        <Hotkey
          global
          combo="shift + a"
          label="Execute All"
          onKeyDown={this.executeAll} />
        <Hotkey
          global
          combo="shift + e"
          label="Execute Selected"
          onKeyDown={this.executeLine} />
        <Hotkey
          global
          combo="shift + s"
          label="Stop Execution"
          onKeyDown={this.stopExecution} />
      </Hotkeys>
    );
  }

}
