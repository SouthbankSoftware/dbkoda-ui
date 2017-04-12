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
}))
@observer
export default class Explain extends React.Component {

  constructor(props) {
    super(props);
    Broker.on(EventType.EXPLAIN_EXECUTION_EVENT, ({id, shell, command}) => {
      this.explainCommand = command;
      this.explainOutput = '';
      this.brokerEvent = EventType.createShellOutputEvent(id, shell);
      Broker.on(this.brokerEvent, this.explainAvailable.bind(this));
    });
    this.state = {};
  }

  componentDidMount() {

  }

  /**
   * get explain output message
   *
   * @param output
   */
  @action.bound
  explainAvailable(output) {
    const outputMsg = output.output;
    console.log('get editors:', this.props.editors);
    let currentEditorId;
    this.props.editors.forEach((value, key, map) => {
      console.log('iterate editors ', key, value, map);
      if (value.id === output.id && value.shellId === output.shellId) {
        currentEditorId = key;
      }
    });

    if (!currentEditorId) {
      return;
    }
    console.log('find editor');
    if (outputMsg.indexOf(this.explainCommand) >= 0 && outputMsg.indexOf('dbenvy>') >= 0) {
      // beginning of the explain command
      this.explainOutput = '';
    } else if (outputMsg.trim() === 'dbenvy>' && this.brokerEvent) {
      // end of the explain
      Broker.removeListener(this.brokerEvent, this.explainAvailable);
      this.brokerEvent = undefined;
      // this.props.explainPanel.activeId = 'Expalin';
      console.log('write explain output ', this.explainOutput);
      const currentEditor = this.props.editors.get(currentEditorId);
      this.props.editors.set(currentEditorId, {...currentEditor, explains: this.explainOutput});
      this.setState({explainOutput: JSON.parse(this.explainOutput)});
    } else {
      this.explainOutput += outputMsg.trim();
    }
  }

  render() {
    console.log('render ', this.state.explainOutput);
    return (<Panel />);
  }
}
