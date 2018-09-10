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
import { observer, inject } from 'mobx-react';
import React from 'react';
import CodeMirror from '#/common/LegacyCodeMirror';
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

    this.cmOptions = {
      value: '',
      theme: 'material',
      // lineNumbers: 'false',
      indentUnit: 2,
      readOnly: true,
      styleActiveLine: 'true',
      scrollbarStyle: null,
      smartIndent: true,
      styleSelectedText: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      // foldOptions: {
      //   widget: '...',
      // },
      // foldGutter: false,
      // gutters: [
      //   'CodeMirror-linenumbers',
      //   'CodeMirror-foldgutter', // , 'CodeMirror-lint-markers'
      // ],
      keyMap: 'sublime',
      mode: 'MongoScript'
    };

    this.state = {
      code: 'Select a database and operation to see an example query.'
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.operation && nextProps.api) {
      const { api, operation } = nextProps;
      api
        .getExampleForSelectedProfileOp(operation)
        .then(res => {
          l.log(res);
          if (res && res.length > 0) {
            this.setState({
              code: res
            });
            setTimeout(() => {
              this.forceUpdate();
            }, 100);
          }
        })
        .catch(error => {
          api.showToaster({
            message: error.message,
            className: 'danger',
            iconName: 'pt-icon-thumbs-down'
          });
          this.setState({
            code: JSON.stringify(nextProps.operation.example, null, 2)
          });
          setTimeout(() => {
            this.forceUpdate();
          }, 100);
        });
    }
  }

  render() {
    const { code } = this.state;
    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar exampleToolbar">
          <div className="pt-navbar-group exampleGroup pt-align-left">
            <div className="pt-navbar-heading">
              <span className="exampleTitle">
                {' '}
                {globalString('performance/profiling/results/exampleTitle')}
              </span>
            </div>
          </div>
        </nav>
        <div style={{ height: '100%' }}>
          <div className="editorView">
            <CodeMirror value={code} options={this.cmOptions} />
          </div>
        </div>
      </div>
    );
  }
}
