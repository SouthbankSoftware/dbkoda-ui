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
import 'codemirror/theme/material.css';

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
      code: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.operation) {
      this.setState({ code: JSON.stringify(nextProps.operation, null, 2) });
    }
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar connectionsToolbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading" />
          </div>
        </nav>
        <div style={{ height: '100%' }}>
          <div className="editorView" />
        </div>
      </div>
    );
  }
}
