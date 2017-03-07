/*
 * Created on Mon Mar 06 2017
 *
 * Copyright (c) 2017
 * Author: Michael Harrison.
 */
import React from 'react';
import {Tabs2, Tab2} from '@blueprintjs/core';
import EditorToolBar from './EditorToolBar.jsx';
import EditorView from './EditorView.jsx';

export default class EditorPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: true,
      tabId: '1',
      vertical: false
    };
  }

  render() {
    return (
      <div className="pt-dark">
        <EditorToolBar />
        <Tabs2
          id="EditorTabs"
          renderActiveTabPanelOnly={false}
          onChange={(newTab) => {
          this.setState({tabId: newTab});
        }}
          selectedTabId={this.state.tabId}>
          <span className="pt-navbar-divider " />
          <Tab2 id="1" title="First" panel={<EditorView />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="2" title="Second" panel={<EditorView />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="3" title="Third" panel={<EditorView />} />
          <span className="pt-navbar-divider" />
          <Tab2 id="4" title="Fourth" panel={<EditorView />} />
          <span className="pt-navbar-divider" />
        </Tabs2>
      </div>
    );
  }
}
