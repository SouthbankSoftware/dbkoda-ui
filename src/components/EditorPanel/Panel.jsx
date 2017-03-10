/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';

@inject('store')
@observer
export default class Panel extends React.Component {

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

  @action newEditor(newId) {
    this.props.store // eslint-disable-line react/prop-types
      .activeDropdownId = newId; // eslint-disable-line react/prop-types
    this.props.store // eslint-disable-line react/prop-types
      .activeEditorId = newId; // eslint-disable-line react/prop-types
    this.setState({tabId: newId});
  }

  @action closeTab(removeTabId) {
    // Update Tabs
    if (removeTabId == this.state.tabId) {
      this.state.tabId = 0;
      this.state.isRemovingCurrentTab = true;
      this.props.store.activeEditorId = 0;
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

  @action changeTab(newTab) {
    // Check if last update was a remove for specialHandling.
    if (this.state.isRemovingTab) {
      this.state.isRemovingTab = false;
      if (this.state.isRemovingCurrentTab) {
        this.state.isRemovingCurrentTab = false;
        this.props.store.activeEditorId = newTab;
        this.setState({tabId: newTab});
      } else {
        this.setState({tabId: this.state.tabId});
      }
    } else {
      this.props.store.activeEditorId = newTab;
      this.setState({tabId: newTab});
    }
  }

  render() {
    console.log(this.props.store.activeEditorId);
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
          selectedTabId={this.props.store.activeEditorId}>
          <Tab2 id={0} title="Default" panel={<View id={0} ref="defaultEditor" />} /> {editors.map((tab) => {
            return (
              <Tab2
                key={tab[0]}
                id={tab[0]}
                title={tab[0] + ':' + tab[1]}
                panel={<View id={tab[0]} ref="defaultEditor" />}>
                <Button
                  className="pt-intent-primary pt-minimal"
                  onClick={() => this.closeTab(tab[0], tab[1])}>
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
