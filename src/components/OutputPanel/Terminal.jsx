/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-27T15:21:42+11:00
 */

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {AnchorButton} from '@blueprintjs/core';
import CodeMirror from 'react-codemirror';

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

    this.updateCommand = this.updateCommand.bind(this);
    this.interceptCommand = this.interceptCommand.bind(this);
    this.showPreviousCommand = this.showPreviousCommand.bind(this);
    this.showNextCommand = this.showNextCommand.bind(this);
    this.updateHistory = this.updateHistory.bind(this);

    /**
     * Reaction to fire off execution of Terminal Commands
     */
    const reactionToExecutingCmd = reaction(
      () => this.props.store.outputPanel.executingTerminalCmd,
      executingTerminalCmd => {
        if (this.props.store.outputPanel.executingTerminalCmd) {
          this.updateHistory(this.state.command);
          const command = this.interceptCommand(this.state.command);
          if (command) {
            console.log('Sending data to feathers id ', this.props.id, ': ', this.props.shellId, command, '.');
            const service = featherClient().service('/mongo-shells');
            service.timeout = 30000;
            service.update(this.props.id, {
              shellId: this.props.shellId, // eslint-disable-line
              commands: command
            });
          }
          this.setState({ command: '' });
          this.props.store.outputPanel.executingTerminalCmd = false;
        }
      },
      { "name": "reactionOutputTerminalExecuteCmd" }
    );
  }

  /**
   * Get a less recent command from the history
   */
  showPreviousCommand() {
    if (this.state.historyCursor > 0) {
      this.state.historyCursor--;
      this.updateCommand(this.props.store.outputs.get(this.props.title).commandHistory[this.state.historyCursor]);
    }
  }

  /**
   * Get a more recent command from the history
   */
  showNextCommand() {
    if (this.state.historyCursor < this.props.store.outputs.get(this.props.title).commandHistory.length) {
      this.state.historyCursor++;
      this.updateCommand(this.props.store.outputs.get(this.props.title).commandHistory[this.state.historyCursor]);
    }
    else {
      this.setState({ command: '' });
    }
  }

  /**
   * Adds a command to the commandHistory and updates the historyCursor
   */
  updateHistory(command) {
    this.props.store.outputs.get(this.props.title).commandHistory.push(command);
    this.state.historyCursor = this.props.store.outputs.get(this.props.title).commandHistory.length;
  }

  /**
   * Keeps the command code up-to-date with the state of CodeMirror
   * @param {string} newCmd - The updated code to be stored in state
   */
  updateCommand(newCmd) {
    this.setState({ command: newCmd });

     const cm = this
      .refs
      .terminal
      .getCodeMirror();
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    if (this.state.command) {
      this.props.store.outputPanel.executingTerminalCmd = true;
    }
  }

  /**
   * Checks for commands that can be run locally before passing on
   */
  interceptCommand(command) {
    if (["clear","cls"].indexOf(command) >= 0) {
      this.props.store.outputPanel.clearingOutput = true;
      return false;
    }
    if (["it"].indexOf(command) >= 0) {
      this.props.store.outputPanel.executingShowMore = true;
      return false;
    }
    return command;
  }

  /**
   * Lifecycle function. Adds event handling for terminal single-line editor
   * post-render, tapping into CodeMirror's js API
   */
  componentDidMount() {
    var cm = this.refs.terminal.getCodeMirror();
    cm.on("keydown", (cm, keyEvent) => {
      if (keyEvent.keyCode == 38) {
        // Up
        this.showPreviousCommand();
      }
      else if (keyEvent.keyCode == 40) {
        // Down
        this.showNextCommand();
      }
    });
    cm.on("beforeChange", (cm, changeObj) => {
      // If typed new line, attempt submit
      var typedNewLine = (changeObj.origin == '+input' &&
                          typeof changeObj.text == "object" &&
                          changeObj.text.join("") == "");
      if (typedNewLine) {
        // TODO call execute command
        this.executeCommand();
        return changeObj.cancel();
      }
      // Remove pasted new lines
      var pastedNewLine = (changeObj.origin == 'paste' &&
                          typeof changeObj.text == "object" &&
                          changeObj.text.length > 1);
      if (pastedNewLine) {
        var newText = changeObj.text.join(" ");
        return changeObj.update(null, null, [newText]);
      }
      // Otherwise allow input untouched
      return null;
    });
  }

  render() {
    const terminalOptions = {
      mode: 'mongoscript',
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
      typescript: true,
    };

    return (
      <div className="outputTerminal">
        <CodeMirror
          className="outputCmdLine"
          ref="terminal"
          options={terminalOptions}
          value={this.state.command}
          onChange={value => this.updateCommand(value)}
          />
        <AnchorButton
          className="executeCmdBtn pt-button pt-icon-key-enter"
          onClick={this.executeCommand}
          />
      </div>
    );
  }
}
