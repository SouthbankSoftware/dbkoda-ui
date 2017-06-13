/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-13T13:06:05+10:00
 */
import React from 'react';
import { action, reaction, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Tab2, Tabs2 } from '@blueprintjs/core';
import { DetailsPanel } from '#/DetailsPanel';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import './style.scss';
import { Explain } from '../ExplainPanel/index';
import {Broker, EventType} from '../../helpers/broker';

/**
 * The main panel for the Output view, this handles tabbing,
 * and parents the editor and toolbar components
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    /**
     * Reaction function for when the active editorPanel is changed,
     * update the active outputPanel
     * @param {function()} - The state that will trigger the reaction
     * @param {function()} - The reaction to trigger on state change
     * @param {Object} - The options object for reactions
     */
    reaction(
      () => this.props.store.editorPanel.activeEditorId,
      (activeEditorId) => {
        this.props.store.outputPanel.currentTab = activeEditorId;
      },
      { name: 'reactionOutputPanelTabChange' }
    );
  }

  componentWillMount() {
    Broker.on(EventType.EXPLAIN_OUTPUT_PARSED, this.explainOutputAvailable.bind(this));
    Broker.on(EventType.SHELL_OUTPUT_AVAILABLE, this.shellOutputAvailable.bind(this));
  }

  componentWillUnmount() {
    Broker.removeListener(EventType.EXPLAIN_OUTPUT_PARSED, this.explainOutputAvailable.bind(this));
    Broker.removeListener(EventType.SHELL_OUTPUT_AVAILABLE, this.shellOutputAvailable.bind(this));
  }

  @action.bound
  explainOutputAvailable({id, shell}) {
    console.log('explain output available ', id, shell);
    const editors = this.props.store.editors.entries();
    const that = this;
    editors.map((editor) => {
      if (editor[1].visible && editor[1].shellId == that.props.store.editorToolbar.shellId
        && editor[1].shellId == shell && editor[1].profileId == id && editor[1].explains && !editor[1].explains.active) {
        runInAction(() => {
          editor[1].explains.active = true;
        });
      }
    });
  }

  @action.bound
  shellOutputAvailable({id, shellId}) {
    const editors = this.props.store.editors.entries();
    editors.map((editor) => {
      if (editor[1].visible && editor[1].shellId == this.props.store.editorToolbar.shellId
        && editor[1].shellId == shellId && editor[1].profileId == id) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = editor[1].id;
          if (editor[1].explains) {
            editor[1].explains.active = false;
          }
        });
      }
    });
  }

  /**
   * Updates the active tab state for the Output view
   * @param {string} newTab - The html id of the new active tab
   */
  @action.bound
  changeTab(newTab) {
    this.props.store.outputPanel.currentTab = newTab;
  }

  /**
   * Renders tabs based on the number of editors currently open
   * @param {Object[]} editors - The editor states that require output rendering
   */
  renderTabs(editors) {
    const tabs = editors.map((editor) => {
      const editorTitle = editor[1].alias + ' (' + editor[1].fileName + ')';

      let tabClassName = 'notVisible';
      if (
        editor[1].visible &&
        this.props.store.editorToolbar.shellId == editor[1].shellId
      ) {
        tabClassName = 'visible';
      }
      if (editor[1].explains && editor[1].explains.active) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Explain-' + editor[1].id;
          editor[1].explains.active = false;
        });
      }
      if (editor[1].detailsView && editor[1].detailsView.visible) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Details-' + editor[1].id;
          editor[1].detailsView.visible = false;
        });
      }
      return [
        <Tab2
          className={tabClassName}
          key={editor[1].id}
          id={editor[1].id}
          title={editorTitle}
          panel={
            <OutputEditor
              title={editorTitle}
              id={editor[1].id}
              profileId={editor[1].profileId}
              connId={editor[1].currentProfile}
              initialMsg={editor[1].initialMsg}
              shellId={editor[1].shellId}
              tabClassName={tabClassName}
            />
          }
        />,
        <Tab2
          className={
            editor[1].explains && tabClassName !== 'notVisible'
              ? 'visible'
              : 'notVisible'
          }
          key={'Explain-' + editor[1].id}
          id={'Explain-' + editor[1].id}
          title={'Explain-' + editorTitle}
          panel={<Explain editor={editor[1]} />}
        />,
        <Tab2
          className={
            editor[1].detailsView && tabClassName !== 'notVisible'
              ? 'visible'
              : 'notVisible'
          }
          key={'Details-' + editor[1].id}
          id={'Details-' + editor[1].id}
          title={'Details-' + editorTitle}
          panel={<DetailsPanel isVisible={this.props.store.outputPanel.currentTab.indexOf('Details') >= 0} editor={editor[1]} />}
        />
      ];
    });
    return [].concat(...tabs);
  }

  render() {
    // Toolbar must be rendered after tabs for initialisation purposes
    const defaultVisible = this.props.store.editorPanel.activeEditorId ==
      'Default'
      ? 'visible'
      : 'notVisible';
    return (
      <div className="pt-dark outputPanel">
        <Tabs2
          id="outputPanelTabs"
          className="outputTabView"
          animate={false}
          onChange={this.changeTab}
          selectedTabId={this.props.store.outputPanel.currentTab}
        >
          <Tab2
            key={0}
            className={defaultVisible}
            id="Default"
            panel={<OutputEditor title="Default" id="Default" shellId={0} />}
            title="Default"
          />
          {this.renderTabs(this.props.store.editors.entries())}
        </Tabs2>
        <OutputToolbar />
      </div>
    );
  }
}
