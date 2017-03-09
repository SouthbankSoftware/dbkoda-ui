/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
import React from 'react';
import {inject, observer} from 'mobx-react';
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

    this.executeAll = this
      .executeAll
      .bind(this);
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

  executeAll() {
    const content = this.refs.editor1.state.code;
    console.log('Executing Script: ', content);
  }

  newEditor(newId) {
    this.setState({tabId: newId});
  }

  closeTab(removeTabId) {
    // Update Tabs
    if (removeTabId == this.state.tabId) {
      this.state.tabId = 0;
      this.state.isRemovingCurrentTab = true;
    } else {
      this.state.isRemovingCurrentTab = false;
    }
    this.state.isRemovingTab = true;
    this
      .props
      .store
      .editors
      .delete(removeTabId);
  }

  changeTab(newTab) {
    if (this.state.isRemovingTab) {
      this.state.isRemovingTab = false;
      if (this.state.isRemovingCurrentTab) {
        this.state.isRemovingCurrentTab = false;
        this.setState({tabId: 0});
      } else {
        this.setState({tabId: this.state.tabId});
      }
    } else {
      this.setState({tabId: newTab});
    }
  }

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
          sele
          onChange={this.changeTab}
          selectedTabId={this.state.tabId}>
          <Tab2 id={0} title="Default" panel={<View ref="defaultEditor" />} /> {editors.map((tab) => {
            return (
              <Tab2 id={tab[0]} title={tab[1]} panel={<View ref="defaultEditor" />}>
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
