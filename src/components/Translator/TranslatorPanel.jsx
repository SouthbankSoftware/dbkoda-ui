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
import {action} from 'mobx';
import {MongoShellTranslator, SyntaxType} from 'mongo-shell-translator';
import { Broker, EventType } from '~/helpers/broker';
import {Button, ContextMenuTarget, Intent, Position, MenuItem, Menu} from '@blueprintjs/core';
import Prettier from 'prettier-standalone';
import _ from 'lodash';

import 'codemirror/theme/material.css';
import CMOptions from './CMOptions';
import './translator.scss';
import {DBKodaToaster} from '../common/Toaster';
import {featherClient} from '../../helpers/feathers';

@ContextMenuTarget
export default class TranslatorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {syntax: SyntaxType.callback, value: '', shellCode: '', syntaxErrors: []};
    Broker.emit(EventType.FEATURE_USE, 'NodeTranslator');
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
    const newSyntaxErrors = [];
    const translator = new MongoShellTranslator(syntax);
    if (this.props.editorCodeMirror) {
      _.times(this.props.editorCodeMirror.lineCount(), (l) => {
        this.props.editorCodeMirror.removeLineClass(l, 'background', 'error-syntax-translator');
      });
    }
    let newValue = null;
    try {
      newValue = translator.translate(value, syntax);
      console.log('translated ', value, newValue);
    } catch (_err) {
      console.error(_err);
      let msg = 'Error: Failed to translate shell script.';
      if (_err.lineNumber > 0 && _err.description) {
        console.log('cm:', this.codeMirror);
        msg += `<br>${_err.description} on line ${_err.lineNumber}`;
        if (this.props.editorCodeMirror) {
          this.props.editorCodeMirror.focus();
          this.props.editorCodeMirror.setCursor({line: _err.lineNumber - 1});
          this.props.editorCodeMirror.addLineClass(_err.lineNumber - 1, 'background', 'error-syntax-translator');
          newSyntaxErrors.push({lineNumber: _err.lineNumber - 1});
        }
      }
      // failed to translate code
      DBKodaToaster(Position.RIGHT_TOP).show({
        message: (<span dangerouslySetInnerHTML={{__html: msg}} />), // eslint-disable-line react/no-danger
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down'
      });
    }
    this.setState({syntaxErrors : newSyntaxErrors});
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

  @action.bound
  syntaxChange(e) {
    this.translate(e.target.value, this.state.shellCode);
    this.setState({syntax: e.target.value});
  }

  @action.bound
  executeCommands() {
    console.log('execute commands ', this.state.value);
    const service = featherClient().service('/mongo-driver');
    service.timeout = 30000;
    service.update(this.props.profileId, {commands: this.state.value, shellId: this.props.shellId})
      .then((doc) => {
        console.log('execute response ', doc);
      }).catch((err) => {
        console.error(err.message);
        DBKodaToaster(Position.RIGHT_TOP).show({
          message: (<span dangerouslySetInnerHTML={{__html: err.message}} />), // eslint-disable-line react/no-danger
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
        });
    });
  }

  renderContextMenu() {
    return (
      <Menu>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.executeCommands}
            text={globalString('editor/view/menu/executeAll')}
            iconName="pt-icon-double-chevron-right"
            intent={Intent.NONE}
          />
        </div>
      </Menu>
    );
  }

  renderSyntaxSelection() {
    return (
      <div>
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
      </div>);
  }

  render() {
    const {value} = this.state;
    const options = {...CMOptions};
    return (<div className="ReactCodeMirror translate-codemirror">
      <div className="syntax-selection">
        <div className="nodejs-driver">{globalString('translator/label/driver-code')}</div>
        <Button className="close-btn pt-icon-cross" onClick={() => this.props.closePanel()} />
      </div>
      <CodeMirror
        className="CodeMirror-scroll"
        ref={(r) => {
            this.codeMirror = r;
          }
        }
        options={options}
        onChange={doc => this.setState({value: doc})}
        codeMirrorInstance={CM} value={value} />
    </div>);
  }
}

TranslatorPanel.defaultProps = {
  value: '',
  profileId: '',
  shellId: '',
};

TranslatorPanel.propTypes = {
  value: React.PropTypes.string,
  profileId: React.PropTypes.string.required,
  shellId: React.PropTypes.string.required,
};
