/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-24T10:36:44+10:00
 */

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {AnchorButton} from '@blueprintjs/core';
import CodeMirror from 'react-codemirror';
import {Broker, EventType} from '../../helpers/broker';

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets.js');
require('codemirror/addon/edit/closebrackets.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/javascript-hint.js');
require('codemirror/keymap/sublime.js');
require('#/common/MongoScript.js');

@inject('store')
@observer
export default class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      command: '',
      commandHistory: [],
      historyCursor: 0
    };

    this.updateCommand = this
      .updateCommand
      .bind(this);
    this.interceptCommand = this
      .interceptCommand
      .bind(this);
    this.showPreviousCommand = this
      .showPreviousCommand
      .bind(this);
    this.showNextCommand = this
      .showNextCommand
      .bind(this);
    this.updateHistory = this
      .updateHistory
      .bind(this);

    /**
     * Reaction to fire off execution of Terminal Commands
     */
    reaction(
      () => this.props.store.outputPanel.executingTerminalCmd,
      (executingTerminalCmd) => {
        if (executingTerminalCmd && this.props.title == this.props.store.editorPanel.activeEditorId) {
          this.updateHistory(this.state.command);
          const command = this.interceptCommand(this.state.command);
          console.log(command);
          if (command) {
            console.log('Sending data to feathers id ', this.props.id, ': ', this.props.shellId, command, '.');
            this.props.store.editorToolbar.isActiveExecuting = true;
            this.props.store.editors.get(this.props.title).executing = true;
            const service = featherClient().service('/mongo-shells');
            service.timeout = 30000;
            Broker.on(EventType.createShellExecutionFinishEvent(this.props.id, this.props.shellId), this.finishedExecution);
            service.update(this.props.id, {
              shellId: this.props.shellId, // eslint-disable-line
              commands: command
            });
          }
          this.setState({command: ''});
          this.props.store.outputPanel.executingTerminalCmd = false;
        }
      },
      { 'name': 'reactionOutputTerminalExecuteCmd' }
    );
  }

  /**
   * Lifecycle function. Adds event handling for terminal single-line editor
   * post-render, tapping into CodeMirror's js API
   */
  componentDidMount() {
    const cm = this
      .terminal
      .getCodeMirror();
    cm.on('keydown', (cm, keyEvent) => {
      if (keyEvent.keyCode == 38) {
        // Up
        this.showPreviousCommand();
      } else if (keyEvent.keyCode == 40) {
        // Down
        this.showNextCommand();
      }
    });
    cm.on('beforeChange', (cm, changeObj) => {
      // If typed new line, attempt submit
      const typedNewLine = (changeObj.origin == '+input' && typeof changeObj.text == 'object' && changeObj.text.join('') == '');
      if (typedNewLine) {
        if (this.props.store.editorToolbar.noActiveProfile) {
          return changeObj.cancel();
        }
        this.executeCommand();
        return changeObj.cancel();
      }
      // Remove pasted new lines
      const pastedNewLine = (changeObj.origin == 'paste' && typeof changeObj.text == 'object' && changeObj.text.length > 1);
      if (pastedNewLine) {
        const newText = changeObj
          .text
          .join(' ');
        return changeObj.update(null, null, [newText]);
      }
      // Otherwise allow input untouched
      return null;
    });
  }

  /**
   * Get a less recent command from the history
   */
  showPreviousCommand() {
    if (this.state.historyCursor > 0) {
      this.state.historyCursor -= 1;
      this.updateCommand(this.props.store.outputs.get(this.props.title).commandHistory[this.state.historyCursor]);
    }
  }

  /**
   * Get a more recent command from the history
   */
  showNextCommand() {
    if (this.state.historyCursor < this.props.store.outputs.get(this.props.title).commandHistory.length) {
      this.state.historyCursor += 1;
      this.updateCommand(this.props.store.outputs.get(this.props.title).commandHistory[this.state.historyCursor]);
    } else {
      this.setState({command: ''});
    }
  }

  /**
   * Adds a command to the commandHistory and updates the historyCursor
   */
  updateHistory(command) {
    this
      .props
      .store
      .outputs
      .get(this.props.title)
      .commandHistory
      .push(command);
    this.state.historyCursor = this
      .props
      .store
      .outputs
      .get(this.props.title)
      .commandHistory
      .length;
  }

  /**
   * Keeps the command code up-to-date with the state of CodeMirror
   * @param {string} newCmd - The updated code to be stored in state
   */
  updateCommand(newCmd) {
    this.setState({command: newCmd});
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    console.log('Set executingTerminalCmd = true');
    if (this.state.command) {
      this.props.store.outputPanel.executingTerminalCmd = true;
    }
  }

  /**
   * Checks for commands that can be run locally before passing on
   */
  interceptCommand(command) {
    if (['clear', 'cls'].indexOf(command) >= 0) {
      this.props.store.outputPanel.clearingOutput = true;
      return false;
    }
    if (['it', 'show more'].indexOf(command) >= 0) {
      this.props.store.outputPanel.executingShowMore = true;
      return false;
    }
    return command;
  }

  @action.bound
  finishedExecution() {
    this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId)
      .executing = false;
    if (this.props.store.editorPanel.activeEditorId == this.props.title) {
      this.props.store.editorToolbar.isActiveExecuting = false;
      this.props.store.editorPanel.stoppingExecution = false;
    }
  }

  render() {
    const terminalOptions = {
      mode: 'MongoScript',
      matchBrackets: true,
      autoCloseBrackets: true,
      json: true,
      jsonld: true,
      scrollbarStyle: null,
      keyMap: 'sublime',
      extraKeys: {
        'Ctrl-Space': 'autocomplete'
      },
      smartIndent: true,
      theme: 'ambiance',
      typescript: true
    };

    return (
      <div className="outputTerminal">
        <CodeMirror
          className="outputCmdLine"
          ref={(c) => { this.terminal = c; }}
          options={terminalOptions}
          value={this.state.command}
          onChange={value => this.updateCommand(value)} />
        <AnchorButton
          className="executeCmdBtn pt-button pt-icon-key-enter"
          disabled={this.props.store.editorToolbar.noActiveProfile}
          onClick={this.executeCommand} />
      </div>
    );
  }
}
