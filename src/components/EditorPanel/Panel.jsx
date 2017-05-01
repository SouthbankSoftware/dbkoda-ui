/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-01T09:46:30+10:00
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer, PropTypes} from 'mobx-react';
import {action} from 'mobx';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
import './Panel.scss';
import WelcomeView from './WelcomePanel/WelcomeView.jsx';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: false,
      tabId: 0,
      vertical: false
    };

    this.newEditor = this
      .newEditor
      .bind(this);
    this.closeTab = this
      .closeTab
      .bind(this);
    this.changeTab = this
      .changeTab
      .bind(this);
  }

  /**
   * DEPRECATED? Remove this after refactoring.
   * Action for creating a new editor in the MobX store.
   * @param {String} newId - The id of the newly created Editor tab.
   */
  @action newEditor(newId) {
    this.props.store.editorPanel.activeDropdownId = newId;
    this.props.store.editorPanel.activeEditorId = newId;
    this.setState({tabId: newId});
  }

  /**
   * Action for closing a tab.
   * @param {Object} oldTab - The Id of the tab being removed.
   */
  @action closeTab(oldTab) {
    // Check if tab to be removed is currenlty selected tab, this will require more
    // handing in UI.
    console.log(this.props.store.editorPanel.activeEditorId);
    if ((oldTab.id) == this.props.store.editorPanel.activeEditorId) {
      this.props.store.editorPanel.activeEditorId = 'Default';
      this.props.store.editorPanel.isRemovingCurrentTab = true;
    } else {
      this.props.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.props.store.editorPanel.removingTabId = oldTab.id;
    console.log('Removing tab id: ' + this.props.store.editorPanel.removingTabId);
    this
      .props
      .store
      .editors
      .delete(oldTab.id);
    this.forceUpdate();
  }

  /**
   * Action for swapping the currently selected tab.
   * @param {String} newTab - Id of tab to swap to active.
   */
  @action changeTab(newTab) {
    // Check if last update was a remove for special Handling.
    if (this.props.store.editorPanel.removingTabId) {
      this.props.store.editorPanel.removingTabId = false;
      if (this.props.store.editorPanel.isRemovingCurrentTab) {
        this.props.store.editorPanel.isRemovingCurrentTab = false;
        this.props.store.editorPanel.activeEditorId = newTab;
        this.setState({tabId: newTab});
      } else {
        this.setState({tabId: this.state.tabId});
      }
    } else {
      this.props.store.editorPanel.activeEditorId = newTab;
      if (newTab != 'Default' && this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).executing == true) {
        this.props.store.editorToolbar.isActiveExecuting = true;
      } else {
        this.props.store.editorToolbar.isActiveExecuting = false;
      }
      this.setState({tabId: newTab});
      if (newTab != 'Default') {
        this.props.store.editorPanel.activeDropdownId = this.props.store.editors.get(newTab).currentProfile;
        if (this.props.store.profiles.get(this.props.store.editorPanel.activeDropdownId).status == 'CLOSED') {
          this.props.store.editorPanel.activeDropdownId = 'Default';
        }
        this.props.store.editorToolbar.id = this.props.store.editors.get(newTab).id;
        this.props.store.editorToolbar.shellId = this.props.store.editors.get(newTab).shellId;
      }
      console.log(`activeDropdownId: ${this.props.store.editorPanel.activeDropdownId} , id: ${this.props.store.editorToolbar.id}, shellId: ${this.props.store.editorToolbar.shellId}`);
      if (this.props.store.editorPanel.activeDropdownId == 'Default') {
        this.props.store.editorToolbar.noActiveProfile = true;
      } else {
        this.props.store.editorToolbar.noActiveProfile = false;
      }
    }
  }

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action handleDrop(item) {
    this.props.store.dragItem.item = item;
    this.props.store.dragItem.dragDrop = true;
  }

  /**
   * Action for rendering the component.
   */
  render() {
    const editors = this
      .props
      .store
      .editors
      .entries();
    return (
      <div className="pt-dark editorPanel">
        <Toolbar executeAll={this.executeAll} newEditor={this.newEditor} ref="toolbar" />
        <Tabs2
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          animate={this.state.animate}
          onChange={this.changeTab}
          selectedTabId={this.props.store.editorPanel.activeEditorId}>
          <Tab2
            className="welcomeTab"
            id="Default"
            title="Welcome"
            panel={<WelcomeView />} /> {editors.map((tab) => {
            if (tab[1].visible) {
              return (
                <Tab2
                  className={'editorTab visible ' + tab[1].fileName}
                  key={tab[1].id}
                  id={tab[1].id}
                  title={tab[1].alias + ' (' + tab[1].fileName + ')'}
                  panel={<View id={
                  tab[0]
                }
                    title={
                  tab[1].alias + ' (' + tab[1].fileName + ')'
                }
                    onDrop={
                  item => this.handleDrop(item)
                }
                    ref="defaultEditor" />}>
                  <Button
                    className="pt-minimal"
                    onClick={() => this.closeTab(tab[1])}>
                    <span className="pt-icon-cross" />
                  </Button>
                </Tab2>
              );
            }
            return (
              <Tab2
                className={'editorTab notVisible ' + tab[1].fileName}
                key={tab[1].id}
                id={tab[1].id}
                title={tab[1].alias}
                panel={<View id={
                    tab[1].id
                  }
                  ref="defaultEditor" />}>
                <Button
                  className="pt-intent-primary pt-minimal"
                  onClick={() => this.closeTab(tab[1])}>
                  <span className="pt-icon-cross" />
                </Button>
              </Tab2>
            );
          })}
        </Tabs2>
      </div>
    );
  }
}
