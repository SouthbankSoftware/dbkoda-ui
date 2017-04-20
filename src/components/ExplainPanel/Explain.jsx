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
      Broker.on(EventType.createExplainExeuctionEvent(editor.id, editor.shellId), this.explainOutputAvailable);
    }
  }

  @action.bound
  explainOutputAvailable({id, shell, command, type, output}) {
    this.explainCommand = command;
    this.explainOutput = '';
    this.explainType = type;
    let currentEditorId = false;
    this.props.editors.forEach((value, key) => {
      if (value.id === id && value.shellId === shell) {
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
        output: JSON.parse(this.parseOutput(output.replace(/\n/, '').replace(/\s/g, ''))),
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
