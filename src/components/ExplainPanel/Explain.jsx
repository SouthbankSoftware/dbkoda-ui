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
 * @Author: chris
 * @Date:   2017-04-20T17:58:30+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T13:31:37+10:00
 */

/**
 * explain component is used to handle explain output
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import Panel from './Panel';
import {Broker, EventType} from '../../helpers/broker/index';

export const parseOutput = (output) => {
  return output.replace(/NumberLong\((\d*)\)/g, '$1')
    .replace(/\n/g, '').replace(/\s/g, '').replace(/\r/g, '')
    .replace(/:(\/[^\/]*\/)/g, ':"$1"');
};

@inject(allStores => ({
  explainPanel: allStores.store.explainPanel,
  editors: allStores.store.editors,
  outputPanel: allStores.store.outputPanel,
}))
@observer
export default class Explain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {viewType: 0};
  }

  componentDidMount() {
    const {editor} = this.props;
    if (editor) {
      Broker.on(EventType.EXPLAIN_OUTPUT_AVAILABLE, this.explainOutputAvailable);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editor.explains) {
      this.setState({viewType: nextProps.editor.explains.viewType});
    }
  }

  componentWillUnmount() {
    const {editor} = this.props;
    if (editor) {
      Broker.removeListener(EventType.EXPLAIN_OUTPUT_AVAILABLE, this.explainOutputAvailable);
    }
  }

  @action.bound
  explainOutputAvailable({id, shell, command, type, output}) {
    this.explainCommand = command;
    this.explainOutput = '';
    this.explainType = type;
    let currentEditorId = false;
    let currentEditor = null;
    this.props.editors.forEach((value, key) => {
      if (value.currentProfile === id && value.shellId === shell) {
        currentEditorId = key;
        currentEditor = value;
      }
    });

    if (!currentEditor) {
      console.log('can"t find editor by id:', id, shell);
      return;
    }
    // const currentEditor = editor;
    let explainOutputJson;
    try {
      explainOutputJson = {
        output: JSON.parse(parseOutput(output)),
        type: this.explainType,
        command: this.explainCommand,
        viewType: 0,
      };
    } catch (err) {
      console.log('err parse explain output ', err, parseOutput(output));
      explainOutputJson = {error: globalString('explain/parseError'), command: this.explainCommand, output: parseOutput(output)};
    }
    this.props.editors.set(currentEditorId, {
      ...currentEditor,
      explains: explainOutputJson,
    });
    Broker.emit(EventType.EXPLAIN_OUTPUT_PARSED, {id, shell});
  }

  @action.bound
  switchExplainView() {
    const {viewType} = this.props.editor.explains;
    this.props.editor.explains.viewType = 1 - viewType;
    this.setState({viewType: this.props.editor.explains.viewType});
  }

  render() {
    return (<Panel editor={this.props.editor}
      viewType={this.state.viewType}
      switchExplainView={this.switchExplainView} />);
  }

}
