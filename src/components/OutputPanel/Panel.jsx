/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-09T12:02:26+10:00
 */
import React from 'react';
import { action, reaction, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Tab2, Tabs2 } from '@blueprintjs/core';
import { DetailsPanel } from '#/DetailsPanel';
import { StoragePanel } from '#/StoragePanel';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import './style.scss';
import { Explain } from '../ExplainPanel/index';
import { Broker, EventType } from '../../helpers/broker';
import { EnhancedJson } from '../EnhancedJsonPanel';

/**
 * The main panel for the Output view, this handles tabbing,
 * and parents the editor and toolbar components
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { enhancedJson: '' };
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
      if (this.props.store.editorPanel.activeEditorId === editor[1].id) {
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
      const arrTabs = [];
      arrTabs.push(
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
        />
      );
      if (this.props.store.editorPanel.activeEditorId === editor[1].id) {
        if (
          editor[1].detailsView &&
          editor[1].detailsView.currentProfile !== editor[1].currentProfile
        ) {
          // This is the condition to switch the editor to first one if the profile got change.
          runInAction(() => {
            this.props.store.outputPanel.currentTab = editor[1].id;
          });
        }
        if (
          process.env.NODE_ENV === 'development' &&
          this.props.store.outputs.get(editor[1].id).enhancedJson
        ) {
          arrTabs.push(
            <Tab2
              className={(tabClassName !== 'notVisible') ? 'visible' : 'notVisible'}
              key={'EnhancedJson-' + editor[1].id}
              id={'EnhancedJson-' + editor[1].id}
              title={'EnhancedJson-' + editorTitle}
              panel={<EnhancedJson enhancedJson={this.props.store.outputs.get(editor[1].id).enhancedJson} />}
            />
          );
        }
        arrTabs.push(
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
          />
        );
        arrTabs.push(
          <Tab2
            className={
              editor[1].detailsView &&
                tabClassName !== 'notVisible' &&
                editor[1].detailsView.currentProfile == editor[1].currentProfile
                ? 'visible'
                : 'notVisible'
            }
            key={'Details-' + editor[1].id}
            id={'Details-' + editor[1].id}
            title={'Details-' + editorTitle}
            panel={
              <DetailsPanel
                isVisible={
                  this.props.store.outputPanel.currentTab.indexOf('Details') >=
                    0
                }
                editor={editor[1]}
              />
            }
          />
        );
      }
      return arrTabs;
    });
    const profileTabs = [];
    const selectedProfile = this.props.store.profileList.selectedProfile;
    if (selectedProfile && selectedProfile.storageView && selectedProfile.storageView.visible) {
      profileTabs.push(
        <Tab2
          className="visible"
          key={'Storage-' + selectedProfile.id}
          id={'Storage-' + selectedProfile.id}
          title={'Storage-' + selectedProfile.alias}
          panel={
            <StoragePanel />
          }
        />
      );
      tabs.push(profileTabs);
      if (selectedProfile.storageView.shouldFocus) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Storage-' + selectedProfile.id;
          this.props.store.profileList.selectedProfile.storageView.shouldFocus = false;
        });
      }
    }
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
