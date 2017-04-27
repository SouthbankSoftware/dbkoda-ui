/**
 * @Author: chris
 * @Date:   2017-04-20T17:58:30+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-26T16:29:28+10:00
 */

/**
 * explain component is used to handle explain output
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import Panel from './Panel';
import {Broker, EventType} from '../../helpers/broker/index';

@inject(allStores => ({
  explainPanel: allStores.store.explainPanel,
  editors: allStores.store.editors,
  outputPanel: allStores.store.outputPanel,
}))
@observer
export default class Explain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    const {editor} = this.props;
    if (editor) {
      Broker.on(EventType.createExplainExecutionEvent(editor.currentProfile, editor.shellId), this.explainOutputAvailable);
    }
  }

  @action.bound
  explainOutputAvailable({id, shell, command, type, output}) {
    this.explainCommand = command;
    this.explainOutput = '';
    this.explainType = type;
    let currentEditorId = false;
    this.props.editors.forEach((value, key) => {
      if (value.currentProfile === id && value.shellId === shell) {
        currentEditorId = key;
      }
    });

    if (!currentEditorId) {
      console.log('can"t find editor by id:' + currentEditorId);
      return;
    }
    // const currentEditor = editor;
    let explainOutputJson;
    try {
      explainOutputJson = {
        output: JSON.parse(this.parseOutput(output.replace(/\n/g, '').replace(/\s/g, '').replace(/\r/g, ''))),
        active: true,
        type: this.explainType,
        command: this.explainCommand
      };
    } catch (err) {
      console.log('err parse explain output ', err);
      explainOutputJson = {error: 'Failed to parse output JSON'};
    }
    this.props.editors.set(currentEditorId, {
      ...this.props.editor,
      explains: explainOutputJson,
    });
  }

  parseOutput(output) {
    return output.replace(/NumberLong\((\d*)\)/g, '$1');
  }

  render() {
    return (<Panel editor={this.props.editor} />);
  }

}
