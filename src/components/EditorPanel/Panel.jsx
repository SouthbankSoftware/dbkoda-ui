/*
 * Created on Mon Mar 06 2017
 *
 * Copyright (c) 2017
 * Author: Michael Harrison.
 */
/* eslint-disable react/no-string-refs */
import React from 'react';
import _ from 'lodash';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';

// import {featherClient} from '../../helper/feathers';

export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabs: [],
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
    console.log(content);
  }

  newEditor(newId) {
    const newTabs = this.state.tabs;
    newTabs.push({id: newId, title: newId});
    this.setState({tabs: newTabs});
  }

  closeTab(removeTabId, removeTabTitle) {
    const newTabs = this.state.tabs;
    const index = _.findIndex(newTabs, {id: removeTabId, title: removeTabTitle});
    if (removeTabId == this.state.tabId) {
       this.state.tabId = 0;
       this.state.isRemovingCurrentTab = true;
    } else {
     this.state.isRemovingCurrentTab = false;
    }
    newTabs.splice(index, 1);
    this.state.isRemovingTab = true;
    this.setState({tabs: newTabs});
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
    console.log('Tabs: ', this.state.tabs);
    console.log('TabId: ', this.state.tabId);
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
          <Tab2 id={0} title="Default" panel={<View ref="defaultEditor" />} />
          {this
            .state
            .tabs
            .map((tab) => {
              return (
                <Tab2 id={tab.id} title={tab.title} panel={<View ref="defaultEditor" />}>
                  <Button
                    className="pt-intent-primary pt-minimal"
                    onClick={() => this.closeTab(tab.id, tab.title)}>
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
