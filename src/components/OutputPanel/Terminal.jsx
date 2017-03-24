/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-23T17:18:19+11:00
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

inject('store')
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
    this.showPreviousCommand = this.showPreviousCommand.bind(this);
    this.showNextCommand = this.showNextCommand.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
  }

  /**
   * Get a less recent command from the history
   */
  showPreviousCommand() {
    if (this.state.historyCursor > 0) {
      this.state.historyCursor--;
      this.updateCommand(this.state.commandHistory[this.state.historyCursor]);
    }
  }

  /**
   * Get a more recent command from the history
   */
  showNextCommand() {
    if (this.state.historyCursor < this.state.commandHistory.length) {
      this.state.historyCursor++;
      this.updateCommand(this.state.commandHistory[this.state.historyCursor]);
    }
    else {
      this.updateCommand('');
    }
  }

  /**
   * Adds a command to the commandHistory and updates the historyCursor
   */
  updateHistory(command) {
    this.state.commandHistory.push(command);
    this.state.historyCursor = this.state.commandHistory.length;
    console.log(this.state.commandHistory);
    console.log(this.state.historyCursor);
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

    cm.addOverlay({
      token: (stream) => {
        if (stream.match('use')) {
          return 'mongo-keyword-use';
        } else if (stream.match('db')) {
          return 'mongo-keyword-db';
        } else if (stream.match('it')) {
          return 'mongo-keyword-it';
        }
        while (stream.next() != null && !stream.match('use', false) && !stream.match('db', false) && !stream.match('it', false)) {} // eslint-disable-line
        return null;
      }
    });
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    const command = this.state.command;
    console.log('Sending data to feathers id ', this.props.id, ': ', this.props.shellId, command, '.');
    this.updateHistory(command);
    const service = featherClient().service('/mongo-shells');
    service.timeout = 30000;
    service.update(parseInt(this.props.id), {
      shellId: parseInt(this.props.shellId), // eslint-disable-line
      commands: command
    });
    this.setState({ command: '' });
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
      mode: {
          name: 'text/javascript',
          json: true
        },
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
