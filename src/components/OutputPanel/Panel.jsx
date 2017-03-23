/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-22T09:41:15+11:00
 */

import React from 'react';
import {action, reaction} from 'mobx';
import {inject, observer} from 'mobx-react';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import {Tabs2, Tab2} from '@blueprintjs/core';
import './style.scss';

/**
 * The main panel for the Output view, this handles tabbing,
 * and parents the editor and toolbar components
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'Default'
    }
    this.changeTab = this.changeTab.bind(this);

    /**
     * Reaction function for when the active editorPanel is changed,
     * update the active outputPanel
     * @param {function()} - The state that will trigger the reaction
     * @param {function()} - The reaction to trigger on state change
     */
    const reactionToEditorChange = reaction(
      () => this.props.store.editorPanel.activeEditorId,
      activeEditorId => {
        console.log('a ', this.props.store.editorPanel.activeEditorId);
        console.log('a ', this.props.store.outputs);
        console.log('a ', this.props.store.outputs.get(this.props.store.editorPanel.activeEditorId));
          this.setState({currentTab: this.props.store.editorPanel.activeEditorId});
      },
      { "name": "reactionOutputPanelTabChange" }
    );
  }

  /**
   * Updates the active tab state for the Output view
   * @param {string} newTab - The html id of the new active tab
   */
  changeTab(newTab) {
    this.setState({currentTab: newTab});
  }

  /**
   * Renders tabs based on the number of editors currently open
   * @param {Object[]} editors - The editor states that require output rendering
   */
  renderTabs(editors) {
    return (
      editors.map((editor) => {
        const editorTitle = editor[1].alias + ' (' + editor[1].shellId + ')';
        let tabClassName = "notVisible";
        if (editor[1].visible) {
          tabClassName = "visible";
        }
        return (
          <Tab2
            className={tabClassName}
            key={editor[1].shellId}
            id={editorTitle}
            title={editorTitle}
            panel={
              <OutputEditor
              title={editorTitle}
              id={editor[1].id}
              shellId={editor[1].shellId} />
            }>
          </Tab2>
        );
      })
    );
  }

  render() {
    // Toolbar must be rendered after tabs for initialisation purposes
    console.log('test ', this.state.currentTab);
    return (
      <div className="pt-dark outputPanel">
        <Tabs2 id="outputPanelTabs"
          className="outputTabView"
          onChange={this.changeTab}
          selectedTabId={this.state.currentTab}>
          <Tab2 key={0}
            id="Default"
            panel={
              <OutputEditor title="Default" id="Default" shellId={0} />
            }
            title="Default">
          </Tab2>
          {this.renderTabs(this.props.store.editors.entries())}
        </Tabs2>
        <OutputToolbar id={this.state.currentTab} />
      </div>
    );
  }
}
