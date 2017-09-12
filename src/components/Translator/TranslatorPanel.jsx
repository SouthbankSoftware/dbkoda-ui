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
 * Created by joey on 12/9/17.
 */

import React from 'react';
import CodeMirror from 'react-codemirror';
import CM from 'codemirror';
import {MongoShellTranslator, SyntaxType} from 'mongo-shell-translator';


import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
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
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/jump-to-line.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/scroll/annotatescrollbar.js';
import 'codemirror/keymap/sublime.js';
import 'codemirror-formatting';
import CMOptions from './CMOptions';
import './translator.scss';

export default class TranslatorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {syntax: SyntaxType.callback, value: ''};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.syntax !== this.state.syntax) {
      this.setState({syntax: nextProps.syntax});
    }
    if (nextProps.value !== this.state.value) {
      this.translate(this.state.syntax, nextProps.value);
    }
  }

  componentDidMount() {
    this.translate(this.state.syntax, this.props.value);
  }

  translate(syntax, value) {
    const translator = new MongoShellTranslator(syntax);
    const newValue = translator.translate(value, syntax);
    this.setState({value: newValue});
  }

  render() {
    const {value} = this.state;
    const options = {...CMOptions, readOnly: true};
    const cbClassName = this.state.syntax === SyntaxType.callback ? 'pt-button pt-active' : 'pt-button';
    const proClassName = this.state.syntax === SyntaxType.promise ? 'pt-button pt-active' : 'pt-button';
    const asClassName = this.state.syntax === SyntaxType.await ? 'pt-button pt-active' : 'pt-button';
    return (<div className="translate-codemirror">
      <div className="pt-button-group pt-vertical">
        <button type="button" className={cbClassName} onClick={() => this.translate(SyntaxType.callback, this.state.value)}>CB</button>
        <button type="button" className={proClassName} onClick={() => this.translate(SyntaxType.promise, this.state.value)}>PRO</button>
        <button type="button" className={asClassName} onClick={() => this.translate(SyntaxType.await, this.state.value)}>A/S</button>
      </div>
      <CodeMirror
        options={options}
        codeMirrorInstance={CM} value={value} />
    </div>);
  }
}

TranslatorPanel.defaultProps = {
  value: '',
};

TranslatorPanel.propTypes = {
  value: React.PropTypes.string,
};
