/**
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-12T16:16:27+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-16T13:07:02+10:00
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

import { Tooltip, Intent, Position, Button } from '@blueprintjs/core';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import React from 'react';
import CodeMirror from '#/common/LegacyCodeMirror';
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
import 'codemirror/keymap/sublime.js';
import 'codemirror-formatting';
import '#/common/MongoScript.js';
import 'codemirror/theme/material.css';

type Props = {
  operation: Object,
  topConnectionsPanel: Object,
  api: *
};

type State = {
  code: string
};

@inject(({ store }) => {
  const { topConnectionsPanel } = store;
  const { selectedOperation } = topConnectionsPanel;
  return {
    api: store.api,
    topConnectionsPanel,
    operation: selectedOperation
  };
})
@observer
export default class OperationDetails extends React.Component<Props, State> {
  static propTypes = {};
  cmOptions: Object = {};
  codeMirror: any;
  constructor(props: Props) {
    super(props);

    this.cmOptions = {
      value: '',
      theme: 'material',
      indentUnit: 2,
      styleActiveLine: 'true',
      smartIndent: true,
      styleSelectedText: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      mode: 'MongoScript'
    };

    this.state = {
      code: ''
    };
    this.codeMirror = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps && nextProps.operation) {
      this.setState({ code: JSON.stringify(nextProps.operation, null, 2) });
    } else {
      this.setState({ code: '' });
    }
  }
  @action.bound
  getExplainForSelectedOp() {
    this.props.api.getExplainForSelectedTopOp();
    try {
      if (this.codeMirror) {
        this.props.api.setLineSeperator(this.codeMirror.codeMirror.doc.cm.lineSeparator());
      }
    } catch (err) {
      l.info(err);
    }
  }

  render() {
    const { topConnectionsPanel, operation } = this.props;

    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar actionsToolbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading" />
          </div>
          <div className="pt-navbar-group pt-align-right">
            {operation && (
              <Tooltip
                className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
                content="Fetch Explain Plan"
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.BOTTOM}
              >
                <Button
                  className="reset-button pt-button pt-intent-primary"
                  text="Explain"
                  loading={topConnectionsPanel.bLoadingExplain}
                  onClick={this.getExplainForSelectedOp}
                />
              </Tooltip>
            )}
          </div>
        </nav>
        <div className="editorView">
          <CodeMirror
            ref={cm => {
              this.codeMirror = cm;
            }}
            value={this.state.code}
            options={this.cmOptions}
          />
        </div>
      </div>
    );
  }
}
