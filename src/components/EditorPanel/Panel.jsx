/*
 * Created on Mon Mar 06 2017
 *
 * Copyright (c) 2017
 * Author: Michael Harrison.
 */
/* eslint-disable react/no-string-refs */
import React from 'react';
import {Tabs2, Tab2} from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
// import {featherClient} from '../../helper/feathers';

export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: true,
      tabId: '1',
      vertical: false
    };

    this.executeAll = this
      .executeAll
      .bind(this);
  }

  executeAll() {
    const content = this.refs.editor1.state.code;
    console.log(content);
  }

  render() {
    return (
      <div className="pt-dark editorPanel"> 
        <Toolbar executeAll={this.executeAll} ref="toolbar"/>
        <Tabs2
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          onChange={(newTab) => {
          this.setState({tabId: newTab});
        }}
          selectedTabId={this.state.tabId}>
          <span className="pt-navbar-divider " />
          <Tab2 id="1" title="First" panel={<View ref="editor1" />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="2" title="Second" panel={<View />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="3" title="Third" panel={<View />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="4" title="Fourth" panel={<View />} />
          <span className="pt-navbar-divider" />
        </Tabs2>
      </div>
    );
  }
}
