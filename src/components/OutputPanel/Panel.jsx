/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-21T08:54:59+11:00
 */

import React from 'react';
import {action, reaction} from 'mobx';
import {inject, observer} from 'mobx-react';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';

import {Tabs2, Tab2} from '@blueprintjs/core';

@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0
    }
    this.changeTab = this.changeTab.bind(this);
  }

  changeTab(newTab) {
    this.setState({currentTab: newTab});
  }

  getTabs(editors) {
    return (
      editors.map((editor) => {
        const editorTitle = `${editor[1].id}:${editor[1].shellId}`;
        return (
          <Tab2
            key={editor[1].shellId}
            id={editor[1].id}
            title={editorTitle}
            panel={
              <OutputEditor
              id={editor[1].id}
              shellId={editor[1].shellId} />
            }>
          </Tab2>
        )
      })
    )
  }

  render() {
    // Toolbar must be rendered after tabs for initialisation purposes
    return (
      <div className="pt-dark outputPanel">
        <Tabs2 id="outputPanelTabs"
          className="outputTabView"
          onChange={this.changeTab}
          selectedTabIndex={this.state.currentTab}>
          <Tab2 key={0}
            id={0}
            panel={
              <OutputEditor id={0} shellId={0} />
            }
            title="Default">
          </Tab2>
          {this.getTabs(this.props.store.editors.entries())}
        </Tabs2>
        <OutputToolbar id={this.state.currentTab} />
      </div>
    );
  }
}
