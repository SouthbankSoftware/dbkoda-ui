/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-12T16:16:27+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-06-22T16:16:36+10:00
 *
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

/* eslint import/no-dynamic-require: warn */

import { observer, inject } from 'mobx-react';
import React from 'react';
import { toJS } from 'mobx';
import autobind from 'autobind-decorator';
import { Tooltip, Intent, Position, Button, Tab, Tabs } from '@blueprintjs/core';
import CodeMirror from '#/common/LegacyCodeMirror'; // eslint-disable-line
import StageProgress from '#/ExplainPanel/StageProgress';
import { StageStepsTable } from '#/ExplainPanel/StageStepsTable';
import { getExecutionStages } from '#/ExplainPanel/ExplainStep';
import QueryCommandView from '#/ExplainPanel/QueryCommandView';
import ErrorView from '#/common/ErrorView';
// import ShardsStageProgress from '#/ExplainPanel/ShardsStageProgress';

import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/addon/edit/matchbrackets.js';
// Patched for codemirror@5.28.0. Need to check this file when upgrade codemirror
import '#/common/closebrackets.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/keymap/sublime.js';
import 'codemirror-formatting';
import '#/common/MongoScript.js';

import 'codemirror/theme/material.css';

@inject(({ store }) => {
  return {
    api: store.api
  };
})
@observer
export default class OperationDetails extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'explain',
      suggestionText:
        props.operation && props.operation.suggestionText ? props.operation.suggestionText : null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.operation && nextProps.operation.suggestionText) {
      this.setState({ suggestionText: nextProps.operation.suggestionText });
    }
  }

  @autobind
  changeTab(newTab: string) {
    if (IS_DEVELOPMENT) {
      l.info(`changeTab(${newTab})`);
    }
    this.setState({ currentTab: newTab });
  }

  @autobind
  getIndexAdvisorForSelectedOp() {
    const { api, operation } = this.props;
    const getSuggestionText = operation => {
      this.setState({ suggestionText: operation.suggestionText, currentTab: 'indexAdvice' });
      // setTimeout(() => {
      //   const suggestionsPanel = document.getElementsByClassName('explain-command-panel');
      //   if (suggestionsPanel && suggestionsPanel.length >= 1) {
      //     suggestionsPanel[0].scrollIntoView();
      //   }
      // }, 500);
    };
    if (!operation.explainPlan) {
      api
        .getExplainForOperation(operation)
        .then(resOperation => {
          getSuggestionText(resOperation);
        })
        .catch(error => {
          api.showToaster({
            message: error.message,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down'
          });
        });
    }
  }

  render() {
    const execStats = toJS(this.props.execStats);
    const executionStages = getExecutionStages(execStats);
    return (
      <div className="explainView">
        <nav className="pt-navbar explainToolbar">
          <div className="pt-navbar-group exampleGroup pt-align-left">
            {/* <div className="pt-navbar-heading">
              <span className="explainTitle">
                {' '}
                {globalString('performance/profiling/results/explainTitle')}
              </span>
            </div> */}
          </div>
          <div className="pt-navbar-group pt-align-right">
            {this.props.operation &&
              !this.props.operation.suggestionText && (
                <Tooltip
                  className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
                  content="Index Advisor"
                  hoverOpenDelay={1000}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.BOTTOM}
                >
                  <Button
                    className="reset-button pt-button pt-intent-primary"
                    text="Index Advisor"
                    onClick={this.getIndexAdvisorForSelectedOp}
                  />
                </Tooltip>
              )}
            {this.state.suggestionText &&
              this.state.suggestionText.indexOf('Looks good') < 0 && (
                <Tooltip
                  className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
                  content="Copy code to new Editor"
                  hoverOpenDelay={1000}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.BOTTOM}
                >
                  <Button
                    className="reset-button use-suggestions-button pt-button pt-intent-primary"
                    text="Use Suggestions"
                    onClick={() => {
                      this.setState({ currentTab: 'indexAdvice' });
                      this.props.api.openEditorWithAdvisorCode(this.state.suggestionText);
                    }}
                  />
                </Tooltip>
              )}
          </div>
        </nav>
        <Tabs
          id="explainViewTabs"
          className="explainViewTabs"
          animate={false}
          onChange={this.changeTab}
          selectedTabId={this.state.currentTab}
        >
          <Tab
            key={0}
            className="explain-plan-tab"
            id="explain"
            panel={
              <div className="explainBody explain-statistic-container-view">
                {executionStages && <StageProgress stages={executionStages} />}
                {executionStages && (
                  <StageStepsTable
                    stages={executionStages}
                    shardMergeStage={executionStages}
                    shard={executionStages.shards !== undefined}
                  />
                )}
                {!executionStages && (
                  <ErrorView
                    title={globalString('performance/profiling/results/noExplainTitle')}
                    error={globalString('performance/profiling/results/noExplainBody')}
                  />
                )}
              </div>
            }
            title="Explain Plan"
          />
          {this.state.suggestionText && (
            <Tab
              key={1}
              className="index-advice-tab"
              id="indexAdvice"
              panel={<QueryCommandView command={this.state.suggestionText} />}
              title="Index Advice"
            />
          )}
        </Tabs>
      </div>
    );
  }
}
