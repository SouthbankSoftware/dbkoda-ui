/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T16:01:13+11:00
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer, PropTypes} from 'mobx-react';
import {action} from 'mobx';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
import './style.scss';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 */
@inject('store')
@observer
export default class Panel extends React.Component {
   static propTypes = {
    store: PropTypes.observableObject.isRequired,
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
    this.props.store.editorPanel
      .activeDropdownId = newId;
    this.props.store.editorPanel
      .activeEditorId = newId;
    this.setState({tabId: newId});
  }

  /**
   * Action for closing a tab.
   * @param {String} removeTabId - The Id of the tab being removed.
   */
  @action closeTab(removeTabId) {
    // Check if tab to be removed is currenlty selected tab, this will require more handing in UI.
    if (removeTabId == this.state.tabId) {
      this.state.tabId = 0;
      this.state.isRemovingCurrentTab = true;
      this.props.store.editorPanel.activeEditorId = 0;
    } else {
      this.state.isRemovingCurrentTab = false;
    }
    this.state.isRemovingTab = true;
    this
      .props
      .store
      .editors
      .delete(removeTabId);
    this
      .props
      .store
      .profiles
      .delete(removeTabId);
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
            id={0}
            title="Default"
            panel={<View id={
            0
          } onDrop={item => this.handleDrop(item)}
              ref="defaultEditor" />} /> {editors.map((tab) => {
            if (tab[1].visible) {
              return (
                <Tab2
                  className="visible"
                  key={tab[1].shellId}
                  id={tab[1].id}
                  title={tab[1].id + ':' + tab[1].shellId}
                  panel={<View id={
                  tab[1].id
                } onDrop={item => this.handleDrop(item)}
                    ref="defaultEditor" />}>
                  <Button
                    className="pt-intent-primary pt-minimal"
                    onClick={() => this.closeTab(tab[1].id, tab[1].shellId)}>
                    <span className="pt-icon-cross" />
                  </Button>
                </Tab2>
              );
            }
              return (
                <Tab2
                  className="notVisible"
                  key={tab[1].shellId}
                  id={tab[1].id}
                  title={tab[1].alias}
                  panel={<View id={
                  tab[1].id
                }
                    ref="defaultEditor" />}>
                  <Button
                    className="pt-intent-primary pt-minimal"
                    onClick={() => this.closeTab(tab[1].id, tab[1].shellId)}>
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
