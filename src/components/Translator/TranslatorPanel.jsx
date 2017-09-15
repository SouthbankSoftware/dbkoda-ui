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
import {ContextMenuTarget, Button, Intent, Position} from '@blueprintjs/core';
import Prettier from 'prettier-standalone';

import 'codemirror/theme/material.css';
import CMOptions from './CMOptions';
import './translator.scss';
import {DBKodaToaster} from '../common/Toaster';

@ContextMenuTarget
export default class TranslatorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {syntax: SyntaxType.callback, value: '', shellCode: ''};
    this.syntaxChange = this.syntaxChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.syntax !== this.state.syntax) {
      this.setState({syntax: nextProps.syntax});
    }
    if (nextProps.value !== this.state.value) {
      this.setState({shellCode: nextProps.value});
      this.translate(this.state.syntax, nextProps.value);
    }
  }

  componentDidMount() {
    this.setState({shellCode: this.props.value});
    this.translate(this.state.syntax, this.props.value);
  }

  translate(syntax, value) {
    const translator = new MongoShellTranslator(syntax);
    let newValue = null;
    try {
      newValue = translator.translate(value, syntax);
    } catch (_err) {
      // failed to translate code
      DBKodaToaster(Position.RIGHT_TOP).show({
        message: (<span dangerouslySetInnerHTML={{ __html: 'Error: Failed to translate shell script.' }} />), // eslint-disable-line react/no-danger
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down'
      });
    }
    if (newValue === null) {
      return;
    }
    try {
      newValue = Prettier.format(newValue, {});
    } catch (_err) {
      //
    }
    this.setState({value: newValue, syntax});
  }

  syntaxChange(e) {
    this.translate(e.target.value, this.state.shellCode);
    this.setState({syntax: e.target.value});
  }

  renderContextMenu() {
    return (<div />);
  }

  render() {
    const {value} = this.state;
    console.log('value=', value);
    const options = {...CMOptions, readOnly: true};
    return (<div className="ReactCodeMirror translate-codemirror">
      <div className="syntax-selection">
        <div className="pt-label">Syntax</div>
        <div className="pt-select">
          <select
            onChange={this.syntaxChange}
            className="pt-intent-primary"
          >
            <option value={SyntaxType.callback}>{globalString('translator/tooltip/callback')}</option>
            <option value={SyntaxType.promise}>{globalString('translator/tooltip/promise')}</option>
            <option value={SyntaxType.await}>{globalString('translator/tooltip/await')}</option>
          </select>
        </div>
        <Button className="close-btn pt-icon-cross" onClick={() => this.props.closePanel()} />
      </div>
      <CodeMirror
        className="CodeMirror-scroll"
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
