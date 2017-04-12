/**
 * explain component is used to handle explain output
 */
import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';

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
      console.log('create shell execution event ', editor);
      Broker.on(EventType.createExplainExeuctionEvent(editor.id, editor.shellId), ({id, shell, command}) => {
        this.explainCommand = command;
        this.explainOutput = '';
        this.brokerEvent = EventType.createShellOutputEvent(id, shell);
        Broker.on(this.brokerEvent, this.explainAvailable);
      });
    }
    // Broker.on(EventType.EXPLAIN_EXECUTION_EVENT, ({id, shell, command}) => {
    //   this.explainCommand = command;
    //   this.explainOutput = '';
    //   this.brokerEvent = EventType.createShellOutputEvent(id, shell);
    //   Broker.on(this.brokerEvent, this.explainAvailable.bind(this));
    // });
  }

  /**
   * get explain output message
   *
   * @param output
   */
  @action.bound
  explainAvailable(output) {
    const outputMsg = output.output;
    console.log('get explain output @@@@@ ', output);
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
      console.log('remove broker event ', this.brokerEvent);
      Broker.removeListener(this.brokerEvent, this.explainAvailable);
      this.brokerEvent = undefined;
      console.log('write explain output ', this.explainOutput);
      const currentEditor = this.props.editors.get(currentEditorId);
      this.props.editors.set(currentEditorId, {
        ...currentEditor,
        explains: JSON.parse(this.explainOutput),
        active: true
      });
      this.explainOutput = '';
    } else {
      this.explainOutput += outputMsg.trim();
    }
  }

  render() {
    console.log('render ', this.props.editor.explains);

    return (<Panel editor={this.props.editor}/>);
  }
}
