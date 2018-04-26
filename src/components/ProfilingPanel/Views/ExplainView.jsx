/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-12T16:16:27+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-13T09:59:09+10:00
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
import { observer } from 'mobx-react';
import React from 'react';
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
// import ShardsStageProgress from '#/ExplainPanel/ShardsStageProgress';
import 'codemirror/theme/material.css';

@observer
export default class OperationDetails extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      operation: null,
      stages: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.operation) {
      this.state.operation = nextProps.operation;

      const stages = getExecutionStages(this.state.operation.execStats);
      if (stages) {
        this.setState({ stages });
      }
    }
  }

  render() {
    const executionStages = this.state.stages;
    return (
      <div className="explainView" style={{ height: '100%' }}>
        <nav className="pt-navbar explainToolbar">
          <div className="pt-navbar-group exampleGroup pt-align-left">
            <div className="pt-navbar-heading">
              <span className="explainTitle">
                {' '}
                {globalString('performance/profiling/results/explainTitle')}
              </span>
            </div>
          </div>
        </nav>
        <div className="explainBody explain-statistic-container-view" style={{ height: '100%' }}>
          {this.state.stages && <StageProgress stages={this.state.stages} />}
          {this.state.stages && (
            <StageStepsTable
              stages={this.state.stages}
              shardMergeStage={this.state.stages}
              shard={executionStages.shards !== undefined}
            />
          )}
        </div>
      </div>
    );
  }
}
