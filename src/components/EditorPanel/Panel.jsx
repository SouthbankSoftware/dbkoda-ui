/*
 * Created on Mon Mar 06 2017
 *
 * Copyright (c) 2017
 * Author: Michael Harrison.
 */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-string-refs */
import React from 'react';
import {Button, Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
// import {featherClient} from '../../helper/feathers';

export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabs: [],
      activePanelOnly: false,
      animate: true,
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

  closeTab(removeTabId) {
    const newTabs = this.state.tabs;
    const index = newTabs.indexOf();
    newTabs.splice(index, 1);
    this.setState({tabs: newTabs});
    this.setState({tabId: 0});
    console.log(this.state.tabs);
    console.log(this.state.tabId);
  }

  render() {
    return (
      <div className="pt-dark editorPanel">
        <Toolbar executeAll={this.executeAll} newEditor={this.newEditor} ref="toolbar" />
        <Tabs2
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          sele
          onChange={(newTab) => {
          this.setState({tabId: newTab});
        }}
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
                    onClick={() => this.closeTab(tab.id)}>
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
