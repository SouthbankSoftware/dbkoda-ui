/**
 * explain component is used to handle explain output
 */
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {inject, observer} from 'mobx-react';
import {action, observable} from 'mobx';

import {Broker, EventType} from '../../helpers/broker/index';
import Panel from './Panel';

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
      Broker.on(EventType.createExplainExeuctionEvent(editor.id, editor.shellId), ({id, shell, command, type}) => {
        this.explainCommand = command;
        this.explainOutput = '';
        this.explainType = type;
        this.brokerEvent = EventType.createShellOutputEvent(id, shell);
        Broker.on(this.brokerEvent, this.explainAvailable);
      });
    }
  }

  /**
   * get explain output message
   *
   * @param output
   */
  @action.bound
  explainAvailable(output) {
    const outputMsg = output.output;
    let currentEditorId = false;
    this.props.editors.forEach((value, key) => {
      if (value.id === output.id && value.shellId === output.shellId) {
        currentEditorId = key;
      }
    });

    if (!currentEditorId) {
      return;
    }
    if (outputMsg.indexOf(this.explainCommand) >= 0 && outputMsg.indexOf('dbenvy>') >= 0) {
      // beginning of the explain command
      this.explainOutput = '';
    } else if (outputMsg.trim() === 'dbenvy>' && this.brokerEvent) {
      // end of the explain
      Broker.removeListener(this.brokerEvent, this.explainAvailable);
      this.brokerEvent = undefined;
      const currentEditor = this.props.editors.get(currentEditorId);
      this.props.editors.set(currentEditorId, {
        ...currentEditor,
        explains: {output:this.explainOutput, active: true, type: this.explainType, command: this.explainCommand},
      });
      this.explainOutput = '';
    } else {
      this.explainOutput += outputMsg.trim();
    }
  }

  render() {
    return (<Panel editor={this.props.editor} />);
  }
}
