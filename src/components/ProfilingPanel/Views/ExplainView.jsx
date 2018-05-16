/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-12T16:16:27+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-16T16:04:10+10:00
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

import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import { observer, inject } from 'mobx-react';
import React from 'react';
import { Tooltip, Intent, Position, Button } from '@blueprintjs/core';
import CodeMirror from '#/common/LegacyCodeMirror'; // eslint-disable-line
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

import StageProgress from '#/ExplainPanel/StageProgress';
import { StageStepsTable } from '#/ExplainPanel/StageStepsTable';
import { getExecutionStages } from '#/ExplainPanel/ExplainStep';
import QueryCommandView from '#/ExplainPanel/QueryCommandView';
import ErrorView from '#/common/ErrorView';
// import ShardsStageProgress from '#/ExplainPanel/ShardsStageProgress';
import 'codemirror/theme/material.css';

@inject(({ store }) => {
  return {
    api: store.api
  };
})
@observer
export default class OperationDetails extends React.Component {
  static propTypes = {};

  render() {
    const executionStages = getExecutionStages(this.props.execStats);
    return (
      <div className="explainView">
        {this.props.showSuggestion &&
          this.props.operation &&
          this.props.operation.suggestionText && (
            <QueryCommandView command={this.props.operation.suggestionText} />
          )}
        <nav className="pt-navbar explainToolbar">
          <div className="pt-navbar-group exampleGroup pt-align-left">
            <div className="pt-navbar-heading">
              <span className="explainTitle">
                {' '}
                {globalString('performance/profiling/results/explainTitle')}
              </span>
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right">
            {this.props.operation &&
              this.props.operation.explainPlan && (
                <Tooltip
                  className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
                  content="Index Advisor"
                  hoverOpenDelay={1000}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.BOTTOM}
                >
                  <Button
                    className="reset-button pt-button pt-intent-primary"
                    text="Index Advisor"
                    onClick={() =>
                      this.props.api.getIndexAdvisorForSelectedOp(this.props.operation)
                    }
                  />
                </Tooltip>
              )}
          </div>
        </nav>
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
      </div>
    );
  }
}
