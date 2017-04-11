import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';

import {Broker, EventType} from '../../helpers/broker/index';

@inject('store')
@observer
export default class Explain extends React.Component {

  constructor(props) {
    super(props);
    Broker.on(EventType.EXPLAIN_EXECUTION_EVENT, ({id, shell, command}) => {
      this.explainCommand = command;
      this.explainOutput = '';
      this.brokerEvent = EventType.createShellOutputEvent(id, shell);
      Broker.on(this.brokerEvent, this.explainAvailable);
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
    if (outputMsg.indexOf(this.explainCommand) >= 0 && outputMsg.indexOf('dbenvy>') >= 0) {
      // beginning of the explain command
      this.explainOutput = '';
    } else if (outputMsg.trim() === 'dbenvy>' && this.brokerEvent) {
      // end of the explain
      Broker.removeListener(this.brokerEvent, this.explainAvailable);
      this.brokerEvent = undefined;
      this.setState({explainOutput: JSON.parse(this.explainOutput)});
    } else {
      this.explainOutput += outputMsg + '\n';
    }
  }

  render() {
    console.log('render ', this.state.explainOutput);
    return (<div />);
  }
}