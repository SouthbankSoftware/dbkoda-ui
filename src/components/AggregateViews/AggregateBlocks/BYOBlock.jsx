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

import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import React from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
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
import '../style.scss';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class BYOBlock extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);

    this.editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    this.block = this.editor.blockList[this.editor.selectedBlock];
    this.currentCollection = this.props.currentCollection;
    if (!this.block.code) {
      this.block.code = ' ';
    }
    this.cmOptions = {
      value: this.block.code,
      theme: 'material',
      lineNumbers: 'true',
      indentUnit: 2,
      styleActiveLine: 'true',
      scrollbarStyle: null,
      smartIndent: true,
      styleSelectedText: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      foldOptions: {
        widget: '...',
      },
      foldGutter: true,
      gutters: [
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter', // , 'CodeMirror-lint-markers'
      ],
      keyMap: 'sublime',
      mode: 'MongoScript',
    };

    this.state = {
      code: this.block.code,
    };
  }

  @action.bound
  updateCode(newCode) {
    this.block.code = newCode;
    // Update Editor Contents.
    this.props.store.treeActionPanel.formValues = this.props.onChangeCallback(
      this.editor,
    );
    this.props.store.treeActionPanel.isNewFormValues = true;
    this.setState({
      code: newCode,
    });
  }

  render() {
    return (
      <div className="editorView">
        <CodeMirror
          value={this.state.code}
          options={this.cmOptions}
          onChange={this.updateCode}
        />
      </div>
    );
  }
}
