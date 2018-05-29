/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-20T20:33:45+10:00
 *
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

/* eslint no-unused-vars: warn */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { DropTarget } from 'react-dnd';
import _ from 'lodash';
import { action, reaction } from 'mobx';
import { DragItemTypes, EditorTypes } from '#/common/Constants.js';
import TreeDropActions from '#/TreePanel/model/TreeDropActions.js';
import { featherClient } from '~/helpers/feathers';
import {
  AnchorButton,
  ContextMenuTarget,
  Intent,
  Menu,
  MenuItem,
  Position,
  Tooltip
} from '@blueprintjs/core';
import CodeMirror from '#/common/LegacyCodeMirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets.js';
// Patched for codemirror@5.28.0. Need to check this file when upgrade codemirror
import '#/common/closebrackets.js';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/keymap/sublime.js';
import '#/common/MongoScript.js';
import { Broker, EventType } from '../../helpers/broker';
import SubmitIcon from '../../styles/icons/execute-command-icon.svg';

/**
 * terminalTarger object for helping with drag and drop actions?
 */
const terminalTarget = {
  /**
   * drop method for dropping items into editor.
   * @param {} props - Properties of the DropTarget.
   * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
   */
  drop(props, monitor) {
    const item = monitor.getItem();
    props.onDrop(item);
  }
};

/**
 * Collect the information required by the connector and inject it into the react component as props
 * @param {} connect - connectors let you assign one of the predefined roles (a drag source, a drag preview, or a drop target) to the DOM nodes
 * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
 */
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true })
  };
}

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config
}))
@observer
@ContextMenuTarget
class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      command: '',
      historyCursor: this.props.store.outputs.get(this.props.id).commandHistory.length,
      lastAutocomplete: '',
      terminalOptions: {
        mode: 'MongoScript',
        matchBrackets: true,
        autoCloseBrackets: true,
        json: true,
        jsonld: true,
        scrollbarStyle: null,
        keyMap: 'sublime',
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-X': () => {
            this.sendCommandToEditor();
          }
        },
        smartIndent: true,
        theme: 'ambiance',
        typescript: true
      }
    };

    this.updateCommand = this.updateCommand.bind(this);
    this.interceptCommand = this.interceptCommand.bind(this);
    this.showPreviousCommand = this.showPreviousCommand.bind(this);
    this.showNextCommand = this.showNextCommand.bind(this);
    this.updateHistory = this.updateHistory.bind(this);

    /**
     * Reaction function for when a change occurs on the dragItem.drapDrop state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToDragDrop = reaction(
      () => this.props.store.dragItem.dragDropTerminal,
      dragDropTerminal => {
        if (
          this.props.store.editorPanel.activeEditorId == this.props.id &&
          this.props.store.dragItem.dragDropTerminal
        ) {
          this.setState({
            command: TreeDropActions.getCodeForTreeNode(this.props.store.dragItem.item)
          });
        }
        this.props.store.dragItem.dragDropTerminal = false;
      }
    );

    /**
     * Reaction to fire off execution of Terminal Commands
     */
    reaction(
      () => this.props.store.outputPanel.executingTerminalCmd,
      executingTerminalCmd => {
        if (executingTerminalCmd && this.props.id == this.props.store.editorPanel.activeEditorId) {
          this.updateHistory(this.state.command);
          const command = this.interceptCommand(this.state.command);
          if (command) {
            this.props.store.editorToolbar.isActiveExecuting = true;
            this.props.store.editors.get(this.props.id).executing = true;
            const service = featherClient().service('/mongo-shells');
            service.timeout = 30000;
            Broker.on(
              EventType.createShellExecutionFinishEvent(this.props.profileId, this.props.shellId),
              this.finishedExecution
            );
            service.update(this.props.profileId, {
              shellId: this.props.shellId,
              commands: command
            });
          }
          this.setState({ command: '' });
          this.props.store.outputPanel.executingTerminalCmd = false;
        }
      },
      { name: 'reactionOutputTerminalExecuteCmd' }
    );
  }

  /**
   * Lifecycle function. Adds event handling for terminal single-line editor
   * post-render, tapping into CodeMirror's js API
   */
  componentDidMount() {
    const cm = this.terminal.getCodeMirror();
    const editorType = this.props.store.editors.get(this.props.id).type;
    if (this.props.config.settings.automaticAutoComplete && editorType !== EditorTypes.DRILL) {
      cm.on(
        'change',
        _.debounce(() => {
          if (
            this.state.historyCursor >
              this.props.store.outputs.get(this.props.id).commandHistory.length - 1 &&
            this.state.command &&
            this.state.command !== this.state.lastAutocomplete
          ) {
            this.setState({ lastAutocomplete: this.state.command });
            cm.execCommand('autocomplete');
          }
        }, 400)
      );
    }
    cm.on('keydown', (cm, keyEvent) => {
      if (cm.state.completionActive == null) {
        if (keyEvent.keyCode == 38) {
          // Up
          this.showPreviousCommand();
        } else if (keyEvent.keyCode == 40) {
          // Down
          this.showNextCommand();
        }
      }
    });
    cm.on('beforeChange', (cm, changeObj) => {
      // If typed new line, attempt submit
      const typedNewLine =
        changeObj.origin == '+input' &&
        typeof changeObj.text == 'object' &&
        changeObj.text.join('') == '';
      if (typedNewLine) {
        if (this.props.store.editorToolbar.noActiveProfile) {
          return changeObj.cancel();
        }
        this.executeCommand();
        return changeObj.cancel();
      }
      // Remove pasted new lines
      const pastedNewLine =
        changeObj.origin == 'paste' &&
        typeof changeObj.text == 'object' &&
        changeObj.text.length > 1;
      if (pastedNewLine) {
        const newText = changeObj.text.join(' ');
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
      this.updateCommand(
        this.props.store.outputs.get(this.props.id).commandHistory[this.state.historyCursor]
      );
    }
  }

  /**
   * Get a more recent command from the history
   */
  showNextCommand() {
    if (
      this.state.historyCursor <
      this.props.store.outputs.get(this.props.id).commandHistory.length - 1
    ) {
      this.state.historyCursor += 1;
      this.updateCommand(
        this.props.store.outputs.get(this.props.id).commandHistory[this.state.historyCursor]
      );
    } else {
      this.state.historyCursor = this.props.store.outputs.get(this.props.id).commandHistory.length;
      this.setState({ command: '' });
    }
  }

  /**
   * Adds a command to the commandHistory and updates the historyCursor
   */
  updateHistory(command) {
    this.props.store.outputs.get(this.props.id).commandHistory.push(command);
    this.state.historyCursor = this.props.store.outputs.get(this.props.id).commandHistory.length;
  }

  /**
   * Keeps the command code up-to-date with the state of CodeMirror
   * @param {string} newCmd - The updated code to be stored in state
   */
  updateCommand(newCmd) {
    this.setState({ command: newCmd });
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    Broker.emit(EventType.FEATURE_USE, 'Terminal');
    if (this.state.command) {
      this.props.store.outputPanel.executingTerminalCmd = true;
      this.setExecStartLine();
    }
  }

  @action.bound
  setExecStartLine() {
    const { activeEditorId } = this.props.store.editorPanel;
    const outputCm = this.props.store.outputPanel.editorRefs[activeEditorId].getCodeMirror();
    this.props.store.editors.get(activeEditorId).lastExecutionStart = Date.now();
    this.props.store.outputs.get(activeEditorId).currentExecStartLine = outputCm.lineCount();
    l.info(
      `Output Exec Start Line: ${this.props.store.outputs.get(activeEditorId).currentExecStartLine}`
    );
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

  /**
   *
   */
  @action.bound
  sendCommandToEditor() {
    if (this.state.command) {
      this.props.store.outputPanel.sendingCommand = this.state.command;
      this.setState({
        command: '',
        historyCursor: this.props.store.outputs.get(this.props.id).commandHistory.length
      });
    }
  }

  @action.bound
  finishedExecution() {
    const { activeEditorId } = this.props.store.editorPanel;
    this.props.store.editors.get(this.props.id).executing = false;
    if (activeEditorId == this.props.id) {
      this.props.store.editorToolbar.isActiveExecuting = false;
      this.props.store.editorPanel.stoppingExecution = false;
      // Open Table view if default table setting is on
      if (this.props.config.settings.tableOutputDefault) {
        const lineNumber = this.props.store.outputs.get(activeEditorId).currentExecStartLine;
        const editor = this.props.store.outputPanel.editorRefs[activeEditorId];
        const cm = editor.getCodeMirror();
        const lines = { start: 0, end: 0, status: '' };
        const currentJson = this.props.getDocumentAtLine(
          this.props.store.editorPanel.activeEditorId,
          lineNumber,
          1,
          lines
        );
        this.props.api.initJsonView(
          currentJson,
          activeEditorId,
          'tableJson',
          lines,
          editor,
          false,
          true
        );
      }
    }
  }

  renderContextMenu() {
    return (
      <Menu>
        <MenuItem
          onClick={this.sendCommandToEditor}
          text="Send Command to Editor"
          icon="pt-icon-chevron-up"
          intent={Intent.NONE}
        />
      </Menu>
    );
  }

  render() {
    const { connectDropTarget, isOver } = this.props; // eslint-disable-line
    return connectDropTarget(
      <div className="outputTerminal">
        <CodeMirror
          className="outputCmdLine"
          ref={c => {
            this.terminal = c;
          }}
          options={this.state.terminalOptions}
          value={this.state.command}
          onChange={value => this.updateCommand(value)}
        />
        <Tooltip
          className="executeCmdBtn"
          intent={Intent.PRIMARY}
          hoverOpenDelay={1000}
          inline
          content={globalString('output/terminal/execute')}
          tooltipClassName="pt-dark"
          position={Position.TOP_RIGHT}
        >
          <AnchorButton
            className="pt-button"
            disabled={this.props.store.editorToolbar.noActiveProfile}
            onClick={this.executeCommand}
          >
            <SubmitIcon className="dbKodaSVG" width={30} height={30} />
          </AnchorButton>
        </Tooltip>
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, terminalTarget, collect)(Terminal);
