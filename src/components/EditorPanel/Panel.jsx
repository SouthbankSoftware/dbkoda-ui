/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-11T12:30:47+10:00
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer, PropTypes} from 'mobx-react';
import {action} from 'mobx';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
import './Panel.scss';
import WelcomeView from './WelcomeView.jsx';

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
      isRemovingTab: false,
      isRemovingCurrentTab: false,
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
    if ((oldTab.alias + ' (' + oldTab.shellId + ')') == this.props.store.editorPanel.activeEditorId) {
      this.props.store.editorPanel.activeEditorId = 'Default';
      this.state.isRemovingCurrentTab = true;
    } else {
      this.state.isRemovingCurrentTab = false;
    }
    this.state.isRemovingTab = true;
    this
      .props
      .store
      .editors
      .delete(oldTab.alias + ' (' + oldTab.shellId + ')');
    this.setState({isRemovingTab: true});
    this.forceUpdate();
  }

  /**
   * Action for swapping the currently selected tab.
   * @param {String} newTab - Id of tab to swap to active.
   */
  @action changeTab(newTab) {
    // Check if last update was a remove for special Handling.
    if (this.state.isRemovingTab) {
      this.state.isRemovingTab = false;
      if (this.state.isRemovingCurrentTab) {
        this.state.isRemovingCurrentTab = false;
        this.props.store.editorPanel.activeEditorId = newTab;
        this.setState({tabId: newTab});
      } else {
        this.setState({tabId: this.state.tabId});
      }
    } else {
      this.props.store.editorPanel.activeEditorId = newTab;
      this.setState({tabId: newTab});
      this.props.store.editorPanel.activeDropdownId = this.props.store.editors.get(newTab).alias;
      this.props.store.editorToolbar.id = this.props.store.editors.get(newTab).id;
      this.props.store.editorToolbar.shellId = this.props.store.editors.get(newTab).shellId;
      console.log(`activeDropdownId: ${this.props.store.editorPanel.activeDropdownId} , id: ${this.props.store.editorToolbar.id}, shellId: ${this.props.store.editorToolbar.shellId}`);
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
            id="Default"
            title="Welcome"
            panel={<WelcomeView />} /> {editors.map((tab) => {
            if (tab[1].visible) {
              return (
                <Tab2
                  className="visible"
                  key={tab[1].alias + ' (' + tab[1].shellId + ')'}
                  id={tab[1].alias + ' (' + tab[1].shellId + ')'}
                  title={tab[1].alias + ' (' + tab[1].shellId + ')'}
                  panel={<View id={
                  tab[1].id
                }
                    title={
                  tab[1].alias + ' (' + tab[1].shellId + ')'
                }
                    onDrop={
                  item => this.handleDrop(item)
                }
                    ref="defaultEditor" />}>
                  <Button
                    className="pt-intent-primary pt-minimal"
                    onClick={() => this.closeTab(tab[1])}>
                    <span className="pt-icon-cross" />
                  </Button>
                </Tab2>
              );
            }
            return (
              <Tab2
                className="notVisible"
                key={tab[1].alias + ' (' + tab[1].shellId + ')'}
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
