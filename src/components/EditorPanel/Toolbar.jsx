/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-24T08:56:20+10:00
*/

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, inject} from 'mobx-react';
import {action, reaction} from 'mobx';
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
import EventLogging from '#/common/logging/EventLogging';
import './Panel.scss';
import {Broker, EventType} from '../../helpers/broker';
import ExplainPopover from './ExplainPopover';

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
    this.openFile = this
      .openFile
      .bind(this);
    this.saveFile = this
      .saveFile
      .bind(this);

    const reactionToAddTabForTreeAction = reaction( // eslint-disable-line
        () => this.props.store.editorToolbar.newEditorForTreeAction, () => {
      if (this.props.store.editorToolbar.newEditorForTreeAction) {
        this.addEditor();
      }
    });
  }

  componentWillMount() {
    Broker.on(EventType.NEW_PROFILE_CREATED, (profile) => {
      this.profileCreated(profile);
    });
  }

  /**
   * called when there is new connection profile get created.
   *
   * @param profile the newly created connection profile
   */
  profileCreated(profile) {
    const {editors, editorToolbar, editorPanel} = this.props.store;
    const fileName = `new${profile.editorCount}.js`;
    profile.editorCount += 1;
    editors.set(profile.alias + ' (' + fileName + ')', {
      // eslint-disable-line react/prop-types
      id: profile.id,
      alias: profile.alias,
      shellId: profile.shellId,
      currentProfile: profile.id,
      fileName,
      visible: true,
      executing: false
    });
    editorToolbar.noActiveProfile = false;
    editorToolbar.id = profile.id;
    editorToolbar.shellId = profile.shellId;
    editorToolbar.newConnectionLoading = false;
    editorPanel.activeEditorId = profile.alias + ' (' + fileName + ')';
    editorPanel.activeDropdownId = profile.id;
    editorToolbar.currentProfile = profile.id;
    editorToolbar.noActiveProfile = false;
  }

  /**
   * Method for adding a new editor to an existing connection.
   */
  @action addEditor() {
    try {
      this.props.store.editorPanel.creatingNewEditor = true;
      this.setNewEditorLoading(true);
      const profileTitle = this.props.store.editorPanel.activeDropdownId;
      let profileId = 'UNKNOWN';
      this
        .props
        .store
        .profiles
        .forEach((value) => {
          console.log('Profile Alias: ', value.alias);
          console.log('Active Dropdown: ', profileTitle);
          if (value.id == profileTitle) {
            profileId = value.id;
          }
        });
      if (profileId == 'UNKNOWN') {
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.NEW_EDITOR.FAILED_DEFAULT, EventLogging.getFragmentEnum().EDITORS, 'Cannot create new Editor for Default Tab.');
        }
        NewToaster.show({message: 'Cannot create new Editor for "No Active Connection".', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
        this.onFail();
        this.setNewEditorLoading(false);
        return null;
      }
      console.log('Create new Editor for ID:', profileId);
      featherClient()
        .service('/mongo-shells')
        .create({id: profileId})
        .then((res) => {
          console.log('get response', res);
          this.setNewEditorState(res);
        })
        .catch((err) => {
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
          }
          this.onFail();
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setNewEditorLoading(false);
        });
    } catch (err) {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, err.message);
      }
      NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      this.onFail();
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
   * Action for setting the new editor state.
   * Note: This function exists only because of an issue with MobX strict mode in callbacks.
   * Guan has found a solution to this using runInAction (@Mike, Replace this some time.)
   * @param {Object} res - The response recieved from Feathers.
   */
  @action
  setNewEditorState(res) {
    const fileName = `new${this
      .props
      .store
      .profiles
      .get(res.id)
      .editorCount}.js`;
    const editorId = this
      .props
      .store
      .profiles
      .get(res.id)
      .alias + ' (' + fileName + ')';
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
      .set(editorId, {
        // eslint-disable-line react/prop-types
        id: res.id,
        alias: this
          .props
          .store
          .profiles
          .get(res.id)
          .alias,
        shellId: res.shellId,
        currentProfile: this
          .props
          .store
          .profiles
          .get(res.id)
          .id,
        fileName,
        visible: true
      });
    this.props.store.editorPanel.creatingNewEditor = false;
    this.props.store.editorToolbar.noActiveProfile = false;
    this.props.store.editorToolbar.id = res.id;
    this.props.store.editorToolbar.shellId = res.shellId;
    this.props.store.editorToolbar.newConnectionLoading = false;
    this.props.store.editorPanel.activeEditorId = this
      .props
      .store
      .profiles
      .get(res.id)
      .alias + ' (' + fileName + ')';
    this.props.store.editorToolbar.currentProfile = res.id;
    this.props.store.editorToolbar.noActiveProfile = false;
    NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
    this.setNewEditorLoading(false);
    if (this.props.store.editorToolbar.newEditorForTreeAction) {
      this.props.store.editorToolbar.newEditorForTreeAction = false;
      this.props.store.treeActionPanel.treeActionEditorId = editorId;
    }
  }

  @action
  onFail() {
    this.props.store.editorPanel.creatingNewEditor = false;
  }

  /**
   * NOT YET IMPLEMENTED: Open a File from Localhost.
   */
  openFile() { // eslint-disable-line class-methods-use-this
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, 'Tried to execute non-implemented openFile');
    }
    // NewToaster.show({message: 'Sorry, not yet implemented!', intent:
    // Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    this
      .props
      .store
      .load();
  }

  /**
   * NOT YET IMPLEMENTED: Save a File to Localhost.
   */
  saveFile() { // eslint-disable-line class-methods-use-this
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, 'Tried to execute non-implemented saveFile');
    }
    // NewToaster.show({message: 'Sorry, not yet implemented!', intent:
    // Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    this
      .props
      .store
      .save();
  }

  /**
   * Execute the line currently selected in the active CodeMirror instance.
   */
  @action executeLine() {
    if (this.props.store.editors.get(this.props.store.editorPanel.activeEditorId) == 'Default') {
      NewToaster.show({message: 'Cannot Execute on Welcome Page.', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
    } else {
      this.props.store.editorPanel.executingEditorLines = true;
    }
  }

  /**
   * Execute all the contents of the currently active CodeMirror instance.
   */
  @action executeAll() {
    if (this.props.store.editors.get(this.props.store.editorPanel.activeEditorId) == 'Default') {
      NewToaster.show({message: 'Cannot Execute on Welcome Page.', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
    } else {
      this.props.store.editorPanel.executingEditorAll = true;
    }
  }

  /**
   * NOT YET IMPLEMENTED: Open the Explain Plan dialog for the currently selected line in the active
   * codemirror instance.
   */
  explainPlan() { // eslint-disable-line class-methods-use-this
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().WARNING, EventLogging.getFragmentEnum().EDITORS, 'Tried to execute non-implemented explainPlan');
    }
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.WARNING, iconName: 'pt-icon-thumbs-down'});
  }

  /**
   * NOT YET IMPLEMENTED: Stop the current execution on this connection.
   */
  @action.bound
  stopExecution() { // eslint-disable-line class-methods-use-this
    this.props.store.editorPanel.stoppingExecution = true;
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

    // Send command through current editor to swap DB: Get current editor instance:
    const editor = this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId);
    const profile = this
      .props
      .store
      .profiles
      .get(this.props.store.editorToolbar.currentProfile);
    console.log('Editor: ', editor);
    console.log('Profile: ', profile);

    // Send Command:
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(editor.id, {
      shellId: editor.shellId,
      newProfile: profile.id,
      swapProfile: true // eslint-disable-line
    })
      .then((res) => {
        console.log(res);
        console.log(editor);
        editor.currentProfile = profile.id;
        console.log(editor);
      });
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
    this.props.store.editorPanel.tabFilter = filter;
    console.log(this.props.store.editors);
    this
      .props
      .store
      .editors
      .forEach((value) => {
        if (value.alias.includes(filter)) {
          value.visible = true;
        } else {
          if ((value.alias + ' (' + value.shellId + ')') == this.props.store.editorPanel.activeEditorId) {
            this.props.store.editorPanel.activeEditorId = 'Default';
          }
          value.visible = false;
        }
      });
  }

  /**
   * Render function for this component.
   */
  render() {
    console.log('TEST!!!', this.props.store.editorPanel.activeDropdownId);
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
                disabled={this.props.store.editorToolbar.noActiveProfile}
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
              <select
                onChange={this.onDropdownChanged}
                value={this.props.store.editorPanel.activeDropdownId}
                className="pt-intent-primary">
                <option key="Default" value="Default">No Active Connection</option>; {profiles.map((profile) => {
                  if (profile[1].status == 'OPEN') {
                    return <option key={profile[0]} value={profile[1].id}>{profile[1].alias}</option>; // eslint-disable-line react/no-array-index-key
                  }
                })}
              </select>
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
                loading={this.props.store.editorToolbar.isActiveExecuting}
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
                loading={this.props.store.editorToolbar.isActiveExecuting}
                disabled={this.props.store.editorToolbar.noActiveProfile} />
            </Tooltip>
            <ExplainPopover
              editorToolbar={this.props.store.editorToolbar}
              editorPanel={this.props.store.editorPanel} />
            <Tooltip
              intent={Intent.DANGER}
              hoverOpenDelay={1000}
              content="Stop Execution"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-stop pt-intent-danger stopExecutionButton"
                loading={this.props.store.editorPanel.stoppingExecution}
                onClick={this.stopExecution}
                disabled={!this.props.store.editorToolbar.isActiveExecuting} />
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
        <Hotkey global combo="shift + n" label="New Editor" onKeyDown={this.addEditor} />
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
