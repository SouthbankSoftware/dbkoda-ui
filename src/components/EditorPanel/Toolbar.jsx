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
import {observer, inject} from 'mobx-react';
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
import './Panel.scss';

/**
 * Defines the Toolbar for the Tabbed Editor Panel.
 */
@inject('store')
@observer
@HotkeysTarget
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);

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

   /**
   * Method for adding a new editor to an existing connection.
   */
  @action addEditor() {
    try {
      this.setNewEditorLoading(true);
      const profileTitle = this.props.store.editorToolbar.activeDropdownId;
      const profileId = 'UNKNOWN';
      this.props.store.profiles.forEach((value) => {
        if (value.alias == profileTitle) {
          this.profileId = value.id;
        }
      });
      featherClient()
        .service('/mongo-shell')
        .create({
          id:  profileId
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
          // eslint-disable-line react/prop-types
          this.props.store.editorToolbar.noActiveProfile = false;
          this.props.store.editorToolbar.id = res.id;
          this.props.store.editorToolbar.shellId = res.shellId;
          this.setNewEditorLoading(false);
          this
            .props
            .newEditor(res.id); // eslint-disable-line react/prop-types
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          this.setNewEditorLoading(false);
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setNewEditorLoading(false);
        });
    } catch (err) {
      console.log(err);
      NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }

  /**
   * Action for setting if the new Editor is loading.
   * Note: This function exists only because of an issue with MobX strict mode in callbacks.
   * Guan has found a solution to this using runInAction (@Mike, Replace this some time.)
   * @param {Boolean} isLoading - Is the editor loading.
   */
  @action
  setNewEditorLoading(isLoading) {
    this.props.store.editorToolbar.newConnectionLoading = isLoading;
  }

  /**
   * NOT YET IMPLEMENTED: Open a File from Localhost.
   */
  openFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * NOT YET IMPLEMENTED: Save a File to Localhost.
   */
  saveFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * Execute the line currently selected in the active CodeMirror instance.
   */
  @action executeLine() {
    this.props.store.editorPanel.executingEditorLines = true;
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   */
  @action executeAll() {
    this.props.store.editorPanel.executingEditorAll = true;
  }

  /**
   * NOT YET IMPLEMENTED: Open the Explain Plan dialog for the currently selected line in the active
   * codemirror instance.
   */
  explainPlan() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * NOT YET IMPLEMENTED: Stop the current execution on this connection.
   */
  stopExecution() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the dropdown.
   */
  @action onDropdownChanged(event) {
    this.props.store.editorPanel.activeDropdownId = event.target.value;
    this.props.store.editorToolbar.currentProfile = event.target.value;
    if (event.target.value == 'Default') {
     this.props.store.editorToolbar.noActiveProfile = true;
    } else {
    this.props.store.editorToolbar.noActiveProfile = false;
    }
  }

  /**
   * Event triggered when the dropdown changes.
   * @param {Object} event - The event that triggered this action.
   * @param {Object} event.target - The target of the event.
   * @param {String} event.target.value - The new value of the filter.
   */
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

  /**
   * Render function for this component.
   */
  render() {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
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
                className="pt-button pt-icon-add pt-intent-primary addEditorButton"
                loading={this.props.store.editorToolbar.newConnectionLoading}
                onClick={this.addEditor} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Open a File from Disc"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-document-open pt-intent-primary openFileButton"
                onClick={this.openFile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Save Editor Contents to Disc"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-floppy-disk pt-intent-primary saveFileButton"
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
                  value={this.props.store.editorPanel.activeDropdownId}
                  className="pt-intent-primary">
                  <option key="Default" value="Default">Default</option>; {profiles.map((profile) => {
                    return <option key={profile[0]} value={profile[1].alias}>{profile[1].alias}</option>; // eslint-disable-line react/no-array-index-key
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
                className="pt-button pt-icon-chevron-right pt-intent-primary executeLineButton"
                onClick={this.executeLine}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Execute All Commands"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-double-chevron-right pt-intent-primary executeAllButton"
                onClick={this.executeAll}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Explain a Query"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-help pt-intent-primary explainPlanButton"
                onClick={this.explainPlan}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content="Stop Execution"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-stop pt-intent-danger stopExecutionButton"
                onClick={this.stopExecution}
                disabled={this.props.store.editorToolbar.noExecutionRunning} />
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

  /**
   * Render function for the hotkeys associated with this component.
   */
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
