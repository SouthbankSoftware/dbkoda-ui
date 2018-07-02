/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-24T14:46:20+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T00:45:02+10:00
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

import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import { inject, PropTypes } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import { action, reaction, runInAction } from 'mobx';
import _ from 'lodash';
import { ContextMenuTarget, Intent, Menu, MenuItem } from '@blueprintjs/core';
import { now } from 'performance-now';
import SplitPane from 'react-split-pane';
import Prettier from 'prettier-standalone';
import sqlFormatter from 'sql-formatter';
import React from 'react';
import autobind from 'autobind-decorator';
import CodeMirrorEditor from '#/common/CodeMirror';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/addon/edit/matchbrackets.js';
// Patched for codemirror@5.28.0. Need to check this file when upgrade
// codemirror
import '#/common/closebrackets.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/jump-to-line.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/scroll/annotatescrollbar.js';
import 'codemirror/keymap/sublime.js';
import 'codemirror-formatting';
// import 'cm-show-invisibles' // To show invisible Characters;
import '#/common/MongoScript.js';

import { DropTarget } from 'react-dnd';
import 'codemirror/theme/material.css';
import { DragItemTypes, EditorTypes } from '#/common/Constants.js';
import { NewToaster } from '#/common/Toaster';
import TreeDropActions from '#/TreePanel/model/TreeDropActions.js';
import './Panel.scss';
import { Broker, EventType } from '../../helpers/broker';
import { TranslatorPanel } from '../Translator';
import { insertExplainOnCommand } from '../ExplainPanel/Utils';

const esprima = require('esprima');

/**
 * editorTarget object for helping with drag and drop actions?
 */
const editorTarget = {
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

/**
 * Defines the View for the CodeMirror Editor.
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  profiles: allStores.profileStore.profiles,
  config: allStores.config
}))
@ContextMenuTarget
class View extends React.Component {
  _debouncedAutocomplete: *;

  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };

  constructor(props) {
    super(props);

    this.id = this.props.id;
    this.editorObject = this.props.store.editors.get(this.id);
    this.doc = this.editorObject.doc;
    this.cmOptions = {
      value: this.doc,
      showInvisibles: true,
      theme: 'material',
      lineNumbers: 'true',
      lineSeparator: this.doc.lineSep,
      indentUnit: 2,
      styleActiveLine: 'true',
      scrollbarStyle: null,
      smartIndent: true,
      styleSelectedText: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      foldOptions: {
        widget: '...'
      },
      foldGutter: true,
      gutters: [
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter' // , 'CodeMirror-lint-markers'
      ],
      keyMap: 'sublime',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        Tab(cm) {
          cm.replaceSelection('  ');
        },
        'Ctrl-Q': function(cm) {
          cm.foldCode(cm.getCursor());
        }
      },
      mode: this.editorObject.type == EditorTypes.DRILL ? 'text/x-mariadb' : 'MongoScript'
    };

    this.reactions = [];

    // React when a change occurs on the editorPanel.executingEditorAll state.
    this.reactions.push(
      reaction(
        () => this.props.store.editorPanel.executingEditorAll,
        executingEditorAll => {
          if (
            this.props.store.editorPanel.activeEditorId === this.props.id &&
            executingEditorAll === true
          ) {
            this.setExecStartLine();
            const editor = this.props.store.editors.get(
              this.props.store.editorPanel.activeEditorId
            );
            const shell = editor.shellId;
            const { profileId } = editor;
            const currEditorValue = this.getEditorValue();
            Broker.emit(EventType.FEATURE_USE, 'ExecuteAll');
            // Listen for completion
            this.props.store.editors.get(editor.id).executing = true;
            this.props.store.editors.get(editor.id).lastExecutionStart = Date.now();
            this.props.store.editors.get(editor.id).lastExecutionFailed = false;
            this.props.store.editorToolbar.isActiveExecuting = true;
            // Send request to feathers client
            const { type } = editor;
            if (type == EditorTypes.DRILL) {
              const service = featherClient().service('/drill');
              service.timeout = 90000;
              let queries = currEditorValue
                .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
                .replace(/\t/g, '  ')
                .replace(/ *(\r\n|\r|\n)/gm, ' ')
                .split(';');
              queries = queries.filter(query => {
                return query.trim().length > 0;
              });
              queries = queries.map(query => {
                return query.trim();
              });
              queries = queries.map(query => {
                return query.replace(/ *(\r\n|\r|\n)/gm, ' ');
              });
              l.info(queries);
              service
                .update(shell, { queries, schema: editor.db })
                .then(res => {
                  const output = {};
                  output.id = editor.id;
                  output.profileId = profileId;
                  if (res.output.length > 10000) {
                    output.output = {
                      output: _.slice(res.output, 0, 10000)
                    }; // JSON.stringify(res);
                    const message = globalString('drill/drill_large_dataset');
                    NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                  } else {
                    output.output = res; // JSON.stringify(res);
                  }
                  this.props.api.drillOutputAvailable(output);
                  runInAction(() => {
                    this.props.store.editors.get(editor.id).executing = false;
                    this.props.store.editors.get(editor.id).lastExecutionTime =
                      Date.now() - this.props.store.editors.get(editor.id).lastExecutionStart;
                    this.props.store.editors.get(editor.id).lastExecutionFailed = false;
                    this.props.store.editorToolbar.isActiveExecuting = false;
                  });
                })
                .catch(err => {
                  l.error(err);
                  runInAction(() => {
                    // Append this error to raw output:
                    err = {
                      Name: err.name,
                      StatusCode: err.statusCode,
                      Message: err.error || err.message
                    };

                    if (err.Message.match(/Timeout of 90000ms/)) {
                      const message = globalString('drill/drill_timed_out');
                      NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                    }

                    const strOutput = JSON.stringify(err, null, 2);
                    const editorObject = this.props.store.editors.get(editor.id);
                    const totalOutput =
                      this.props.store.outputs.get(editor.id).output +
                      editorObject.doc.lineSep +
                      'ERROR:' +
                      editorObject.doc.lineSep +
                      strOutput;
                    this.props.store.outputs.get(editor.id).output = totalOutput;
                    this.props.store.outputPanel.currentTab = editor.id;
                  });

                  runInAction(() => {
                    this.props.store.editors.get(editor.id).executing = false;
                    this.props.store.editors.get(editor.id).lastExecutionTime =
                      Date.now() - this.props.store.editors.get(editor.id).lastExecutionStart;
                    this.props.store.editors.get(editor.id).lastExecutionFailed = true;
                    this.props.store.editorToolbar.isActiveExecuting = false;
                    NewToaster.show({
                      message: globalString('drill/execution_failed'),
                      className: 'danger',
                      icon: 'thumbs-down'
                    });
                  });
                });
            } else {
              const service =
                type && type === 'os'
                  ? featherClient().service('/os-execution')
                  : featherClient().service('/mongo-shells');
              service.timeout = 30000;
              service
                .update(profileId, {
                  shellId: shell, // eslint-disable-line
                  commands: currEditorValue.replace(/\t/g, '  ')
                })
                .catch(err => {
                  l.error(err);
                  runInAction(() => {
                    // Append this error to raw output:
                    err = {
                      Name: err.name,
                      StatusCode: err.statusCode,
                      Message: err.error
                    };

                    const strOutput = JSON.stringify(err, null, 2);
                    const editorObject = this.props.store.editors.get(editor.id);
                    const totalOutput =
                      this.props.store.outputs.get(editor.id).output +
                      editorObject.doc.lineSep +
                      'ERROR:' +
                      editorObject.doc.lineSep +
                      strOutput;
                    this.props.store.outputs.get(editor.id).output = totalOutput;
                    this.props.store.outputPanel.currentTab = editor.id;
                  });
                  runInAction(() => {
                    this.props.store.editors.get(editor.id).lastExecutionTime =
                      now() - this.props.store.editors.get(editor.id).lastExecutionStart;
                    this.props.store.editors.get(editor.id).lastExecutionFailed = true;
                    this.props.store.editorToolbar.isActiveExecuting = false;
                    let message = globalString('drill/execution_failed');
                    if (err && err.statusCode === 602) {
                      message = globalString('drill/query_error');
                    } else if (err && err.statusCode === 600) {
                      message = globalString('drill/connection_not_exist');
                    }
                    NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                  });
                });
            }
            if (this.props.store.treeActionPanel.refreshOnExecution) {
              this.props.store.treeActionPanel.refreshTree = true;
            }
            this.props.store.editorPanel.executingEditorAll = false;
          }
        }
      )
    );

    // React when a change occurs on the editorPanel.executingEditorLines state.
    this.reactions.push(
      reaction(
        () => this.props.store.editorPanel.executingEditorLines,
        executingEditorLines => {
          if (
            this.props.store.editorPanel.activeEditorId === this.props.id &&
            executingEditorLines === true
          ) {
            this.setExecStartLine();
            // Determine code to send.
            const editor = this.props.store.editors.get(
              this.props.store.editorPanel.activeEditorId
            );
            const shell = editor.shellId;
            const { profileId } = editor;
            const cm = this.editor.getCodeMirror(); // eslint-disable-line
            const { line } = cm.getCursor();
            let content = cm.getSelection();
            if (cm.getSelection().length > 0) {
              Broker.emit(EventType.FEATURE_USE, 'ExecuteSelected');
            } else {
              Broker.emit(EventType.FEATURE_USE, 'ExecuteSelected');
              content = cm.getLine(cm.getCursor().line);
            }
            this.props.store.editors.get(editor.id).executing = true;
            this.props.store.editors.get(editor.id).lastExecutionStart = Date.now();
            this.props.store.editors.get(editor.id).lastExecutionFailed = false;
            this.props.store.editorToolbar.isActiveExecuting = true;

            const { type } = editor;
            if (type == EditorTypes.DRILL) {
              const service = featherClient().service('/drill');
              service.timeout = 90000;
              l.info(
                content
                  .replace(/\t/g, '  ')
                  .replace(/ *(\r\n|\r|\n)/gm, ' ')
                  .split(';')
              );
              service
                .update(shell, {
                  queries: content
                    .replace(/\t/g, '  ')
                    .replace(/ *(\r\n|\r|\n)/gm, ' ')
                    .split(';'),
                  schema: editor.db
                })
                .then(res => {
                  const output = {};
                  output.id = editor.id;
                  output.profileId = profileId;
                  if (res.output.length > 10000) {
                    output.output = {
                      output: _.slice(res.output, 0, 10000)
                    }; // JSON.stringify(res);
                    const message = globalString('drill/drill_large_dataset');
                    NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                  } else {
                    output.output = res; // JSON.stringify(res);
                  }
                  this.props.api.drillOutputAvailable(output);
                  runInAction(() => {
                    this.props.store.editors.get(editor.id).executing = false;
                    this.props.store.editors.get(editor.id).lastExecutionTime =
                      Date.now() - this.props.store.editors.get(editor.id).lastExecutionStart;
                    this.props.store.editors.get(editor.id).lastExecutionFailed = false;
                    this.props.store.editorToolbar.isActiveExecuting = false;
                  });
                })
                .catch(err => {
                  l.error('execute error:', err);
                  // Append this error to raw output:
                  runInAction(() => {
                    err = {
                      Name: err.name,
                      StatusCode: err.statusCode,
                      Message: err.error || err.message
                    };

                    if (err.Message.match(/Timeout of 90000ms/)) {
                      const message = globalString('drill/drill_timed_out');
                      NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                    }

                    // Analyse Error for line number and highlight -> Only works for simple errors.
                    // @TODO -> if drill proves popular, we should improve error handling here.
                    try {
                      if (err.Message.match(/From line [0-9]+/)) {
                        const errorStringArray = err.Message.substring(
                          err.Message.search(/From line [0-9]+/),
                          120
                        ).split(' ');
                        const errStartLine = parseInt(errorStringArray[2], 10);
                        const errStartCol = parseInt(errorStringArray[4], 10);
                        const errEndLine = parseInt(errorStringArray[7], 10);
                        const errEndCol = parseInt(errorStringArray[9], 10);
                        // Set cm cursor:
                        cm.setSelection(
                          {
                            line: errStartLine + line - 1,
                            ch: errStartCol - 1
                          },
                          {
                            line: errEndLine + line - 1,
                            ch: errEndCol
                          },
                          { scroll: true }
                        );
                      } else {
                        cm.setSelection({ line, ch: 0 });
                      }
                    } catch (err) {
                      l.error(err);
                    }

                    const strOutput = JSON.stringify(err, null, 2);
                    const editorObject = this.props.store.editors.get(editor.id);
                    const totalOutput =
                      this.props.store.outputs.get(editor.id).output +
                      editorObject.doc.lineSep +
                      'ERROR:' +
                      editorObject.doc.lineSep +
                      strOutput;
                    this.props.store.outputs.get(editor.id).output = totalOutput;
                    this.props.store.outputPanel.currentTab = editor.id;
                  });

                  runInAction(() => {
                    this.props.store.editors.get(editor.id).executing = false;
                    this.props.store.editors.get(editor.id).lastExecutionTime =
                      Date.now() - this.props.store.editors.get(editor.id).lastExecutionStart;
                    this.props.store.editors.get(editor.id).lastExecutionFailed = true;
                    this.props.store.editorToolbar.isActiveExecuting = false;
                    let message = globalString('drill/execution_failed');
                    if (err && err.statusCode === 602) {
                      message = globalString('drill/query_error');
                      // message = err.error;
                    } else if (err && err.statusCode === 600) {
                      message = globalString('drill/connection_not_exist');
                    }
                    NewToaster.show({ message, className: 'danger', icon: 'thumbs-down' });
                  });
                });
            } else {
              // Quick check if line is a full command:
              if (type !== 'os') {
                const ignore = /^[^\S\x0a\x0d]*(?:use|show|help|it|exit[\s]).*/g;
                const splitted = content.split(global.EOL);
                let hasError = false;
                let filteredCode = '';
                splitted.forEach(str => {
                  const ignoredStr = str.replace(ignore, '');
                  filteredCode += ignoredStr + global.EOL;
                });
                try {
                  esprima.parseScript(filteredCode);
                } catch (err) {
                  hasError = true;
                }
                if (hasError) {
                  NewToaster.show({
                    message: globalString('editor/toolbar/possibleMultiLineCommand'),
                    className: 'warning',
                    icon: 'pEmilt-icon-thumbs-down'
                  });
                }
              }
              // Send request to feathers client
              const service =
                type && type === 'os'
                  ? featherClient().service('/os-execution')
                  : featherClient().service('/mongo-shells');
              service.timeout = 30000;
              service
                .update(profileId, {
                  shellId: shell, // eslint-disable-line
                  commands: content.replace(/\t/g, '  ')
                })
                .catch(err => {
                  l.error('execute error:', err);
                  runInAction(() => {
                    this.finishedExecution({ id: profileId, shellId: shell });
                    NewToaster.show({
                      message: globalString('editor/toolbar/executionScriptFailed'),
                      className: 'danger',
                      icon: 'thumbs-down'
                    });
                  });
                });
            }
            this.props.store.editorPanel.executingEditorLines = false;
          }
        }
      )
    );

    // React when a change occurs on the dragItem.drapDrop state.
    this.reactions.push(
      reaction(
        () => this.props.store.dragItem.dragDrop,
        dragDrop => {
          if (this.props.store.editorPanel.activeEditorId === this.props.id && dragDrop) {
            if (this.props.store.dragItem.item) {
              const { item } = this.props.store.dragItem;
              if (this.props.store.editors.get(this.props.id).type === 'drill') {
                l.info('SQL DnD');
                this.insertAtCursor(TreeDropActions.getSQLForTreeNode(item));
              } else {
                l.info('JS DnD');
                this.insertAtCursor(TreeDropActions.getCodeForTreeNode(item));
              }
            }
            this.props.store.dragItem.dragDrop = false;
          }
        }
      )
    );

    // React when receive and append a command from the output terminal
    this.reactions.push(
      reaction(
        () => this.props.store.outputPanel.sendingCommand,
        sendingCommand => {
          if (sendingCommand && this.props.store.editorPanel.activeEditorId === this.props.id) {
            this.insertAtCursor(sendingCommand);
            this.props.store.outputPanel.sendingCommand = '';
          }
        },
        { name: 'EditorViewReactionToTerminalPush' }
      )
    );

    // React when a change occurs on the editorPanel.stoppingExecution state
    this.reactions.push(
      reaction(
        () => this.props.store.editorPanel.stoppingExecution,
        stoppingExecution => {
          if (stoppingExecution) {
            this.props.store.editorPanel.stoppingExecution = false;
            const editor = this.props.store.editors.get(
              this.props.store.editorPanel.activeEditorId
            );
            const shell = editor.shellId;
            const id = editor.profileId;
            const { type } = editor;
            const service =
              type && type === 'os'
                ? featherClient().service('/os-execution')
                : featherClient().service('/mongo-stop-execution');
            service.timeout = 10000;
            service
              .remove(id, {
                query: {
                  shellId: shell
                }
              })
              .then(response => {
                if (response) {
                  NewToaster.show({
                    message: response.result,
                    className: 'success',
                    icon: 'thumbs-up'
                  });
                } else {
                  NewToaster.show({
                    message: globalString('editor/view/executionStopped'),
                    className: 'success',
                    icon: 'thumbs-up'
                  });
                }
                this.finishedExecution({ id, shellId: shell });
              })
              .catch(reason => {
                l.error(`Stopping Execution failed for ${id} / ${shell}! ${reason.message}`);
                NewToaster.show({
                  message: globalString('editor/view/executionStoppedError', reason.message),
                  className: 'danger',
                  icon: 'thumbs-down'
                });
                this.finishedExecution({ id, shellId: shell });
              });
          }
        }
      )
    );

    // react to tree action change
    this.reactions.push(
      reaction(
        () => this.props.store.treeActionPanel.isNewFormValues,
        isNewFormValues => {
          if (isNewFormValues && this.props.store.editorPanel.activeEditorId === this.props.id) {
            try {
              const cm = this.editor.getCodeMirror();
              cm.setValue(this.props.store.treeActionPanel.formValues);
              this.setEditorValue(this.props.store.treeActionPanel.formValues);
            } catch (e) {
              l.error(e);
            }
            this.props.store.treeActionPanel.isNewFormValues = false;
          }
        }
      )
    );

    // react to syntax error change
    this.reactions.push(
      reaction(
        () => this.props.store.editorPanel.activeEditorId,
        activeEditorId => {
          if (activeEditorId === this.id) {
            requestAnimationFrame(() => {
              this.refresh();
            });
          }
        }
      )
    );

    this.refresh = this.refresh.bind(this);
    this.executeLine = this.executeLine.bind(this);
    this.executeAll = this.executeAll.bind(this);
    this.prettifyAll = this.prettifyAll.bind(this);
    this.prettifySelection = this.prettifySelection.bind(this);
    this.translateToNativeCode = this.translateToNativeCode.bind(this);
    this.getStyles = this.getStyles.bind(this);
  }

  /**
   * Component Did mount function, causes CodeMirror to refresh to ensure UI is scaled properly.
   */
  componentDidMount() {
    this.refresh();
    if (
      this.props.config.settings.automaticAutoComplete &&
      this.editorObject.type === EditorTypes.DEFAULT &&
      !this._debouncedAutocomplete
    ) {
      this._debouncedAutocomplete = _.debounce(CodeMirror.commands.autocomplete, 400);
      this.editor.getCodeMirror().on('change', this._debouncedAutocomplete);
    }

    const _updateUnsavedFileIndicator = _.debounce(() => {
      const elem = document.querySelector(`#unsavedFileIndicator_${this.id}`);
      if (elem) {
        elem.style.opacity = this.doc.isClean() ? 0 : 1;
      }
    }, 300);
    this._updateUnsavedFileIndicator = _updateUnsavedFileIndicator;
    this.editor.getCodeMirror().on('change', _updateUnsavedFileIndicator);

    _updateUnsavedFileIndicator();

    const _markClean = this.doc.markClean.bind(this.doc);
    this.doc.markClean = function() {
      _markClean();
      _updateUnsavedFileIndicator();
    };

    if (this.editorObject.path) {
      const { store } = this.props;
      store.openFile(this.editorObject.path, ({ content }) => {
        this.doc.setValue(content);
        this.doc.markClean();
        store.watchFileBackgroundChange(this.id);
      });
    }

    Broker.on(EventType.EXECUTION_EXPLAIN_EVENT, this.executingExplain);
    Broker.on(EventType.SWAP_SHELL_CONNECTION, this.swapShellConnection);
    if (this.props.editor) {
      const { profileId, shellId } = this.props.editor;
      Broker.on(
        EventType.createShellExecutionFinishEvent(profileId, shellId),
        this.finishedExecution
      );
    }

    this._cleanup = () => {
      const cm = this.editor.getCodeMirror();

      cm.off('change', this._updateUnsavedFileIndicator);
      !this._debouncedAutocomplete && cm.off('change', this._debouncedAutocomplete);
      this._updateUnsavedFileIndicator = null;

      Broker.removeListener(EventType.EXECUTION_EXPLAIN_EVENT, this.executingExplain);
      Broker.removeListener(EventType.SWAP_SHELL_CONNECTION, this.swapShellConnection);
      if (this.props.editor) {
        const { profileId, shellId } = this.props.editor;
        Broker.removeListener(
          EventType.createShellExecutionFinishEvent(profileId, shellId),
          this.finishedExecution
        );
      }
    };
  }

  componentWillUnmount() {
    _.forEach(this.reactions, r => r());
    this._updateUnsavedFileIndicator.cancel();
    this._cleanup();
  }

  clearAutoCompletion(cm) {
    const options = {
      hint() {
        return { from: 0, to: 0, list: [] };
      }
    };
    cm.showHint(options);
  }

  setupAutoCompletion() {
    CodeMirror.commands.autocomplete = cm => {
      if (
        this.doc.isClean() ||
        this.props.store.editorToolbar.isActiveExecuting ||
        this.props.store.editorPanel.activeEditorId !== this.id
      ) {
        return;
      }
      this.clearAutoCompletion(cm);
      const currentLine = cm.getLine(cm.getCursor().line);
      let start = cm.getCursor().ch;
      let end = start;
      while (end < currentLine.length && /[\w|.$]+/.test(currentLine.charAt(end))) {
        end -= 1;
      }
      while (start && /[\w|.$]+/.test(currentLine.charAt(start - 1))) {
        start -= 1;
      }
      const curWord = start != end && currentLine.slice(start, end);
      if (!curWord) {
        return;
      }
      const { id, shell } = this.getActiveProfileId();
      if (!id || !shell) {
        return;
      }
      const service = featherClient().service('/mongo-auto-complete');
      service
        .get(id, {
          query: {
            shellId: shell,
            command: curWord
          }
        })
        .then(res => {
          if (res && res.length === 1 && res[0].trim().length === 0) {
            return;
          }
          const cursor = cm.getDoc().getCursor();
          const from = new CodeMirror.Pos(cursor.line, cursor.ch - curWord.length);
          const options = {
            hint() {
              return {
                from,
                to: cm.getDoc().getCursor(),
                list: res
              };
            },
            completeSingle: false
          };
          cm.showHint(options);
        });
    };
  }

  /*
   * Set the execution start line number from the output panel so it can be referenced when working with result sets
   */
  @action.bound
  setExecStartLine() {
    const { activeEditorId } = this.props.store.editorPanel;
    const outputCm = this.props.store.outputPanel.editorRefs[activeEditorId].getCodeMirror();
    this.props.store.outputs.get(activeEditorId).currentExecStartLine = outputCm.lineCount();
    l.info(
      `Output Exec Start Line: ${this.props.store.outputs.get(activeEditorId).currentExecStartLine}`
    );
  }

  getActiveProfileId() {
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (editor) {
      const shell = editor.shellId;
      return { id: editor.profileId, shell };
    }
  }

  getEditorValue() {
    return this.doc.getValue();
  }

  setEditorValue(newValue) {
    const { cm } = this.doc;
    const scrollInfo = cm.getScrollInfo();
    this.doc.setValue(newValue);
    cm.scrollTo(scrollInfo.left, scrollInfo.top);
  }

  @autobind
  swapShellConnection(event) {
    const { oldId, oldShellId, id, shellId } = event;
    if (
      this.props.editor &&
      oldId === this.props.editor.profileId &&
      oldShellId === this.props.editor.shellId
    ) {
      Broker.removeListener(
        EventType.createShellExecutionFinishEvent(
          this.props.editor.profileId,
          this.props.editor.shellId
        ),
        this.finishedExecution
      );
      Broker.on(EventType.createShellExecutionFinishEvent(id, shellId), this.finishedExecution);
      this.props.api.swapOutputShellConnection(event);
    }
  }

  /**
   * executing explain parameters
   * @param explainParam  explain parameter, it could be queryPlanner, executionStats, allPlansExecution
   */
  @autobind
  executingExplain(explainParam) {
    if (
      this.editor &&
      this.props.store.editorPanel.activeEditorId == this.props.id &&
      explainParam
    ) {
      // Get current Editor and Profile.
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      const { id, shell } = this.getActiveProfileId();

      // Extract the query to explain.
      const cm = this.editor.getCodeMirror(); // eslint-disable-line
      let content = cm.getSelection();
      // If no text is selected, try to find query based on cursor position.
      if (cm.getSelection().length > 0 === false) {
        // Get line text at current cursor position.
        let currentLine = cm.getCursor().line;
        content = cm.getLine(currentLine);
        // If a full command isn't detected, parse up and down until white space.
        let linesAbove = '';
        while (
          cm.getLine(currentLine - 1) &&
          !cm.getLine(currentLine - 1).match(/^\/\//gim) &&
          !cm.getLine(currentLine - 1).match(/^[ \s\t]*[\n\r]+$/gim) &&
          !cm.getLine(currentLine - 1).match(/;[ \t\s]*$/gim)
        ) {
          linesAbove = cm.getLine(currentLine - 1) + linesAbove;
          currentLine -= 1;
        }
        currentLine = cm.getCursor().line;
        let linesBelow = '';

        while (
          cm.getLine(currentLine + 1) &&
          !cm.getLine(currentLine + 1).match(/^\/\//gim) &&
          !cm.getLine(currentLine + 1).match(/^[ \s\t]*[\n\r]+$/gim) &&
          !cm.getLine(currentLine + 1).match(/;[ \t\s]*$/gim)
        ) {
          linesBelow += cm.getLine(currentLine + 1);
          currentLine += 1;
        }
        if (cm.getLine(currentLine + 1) && cm.getLine(currentLine + 1).match(/;[ \t\s]*$/gim)) {
          linesBelow += cm.getLine(currentLine + 1);
        }

        content = linesAbove + content + linesBelow;
      }
      content = insertExplainOnCommand(content, explainParam);
      editor.executing = true;

      // Send request to feathers client
      const service = featherClient().service('/mongo-sync-execution');
      const filteredContent = content.replace(/\t/g, '  ');
      const tmpVar = 'explain_' + editor.id.replace(/\-/g, '_');
      const saveExplainCommand = 'var ' + tmpVar + ' = ' + filteredContent + ';' + tmpVar;
      service.timeout = 300000;
      this.props.store.editorToolbar.isActiveExecuting = true;
      service
        .update(id, {
          shellId: shell, // eslint-disable-line
          commands: saveExplainCommand
        })
        .then(response => {
          runInAction(() => {
            this.props.store.editorToolbar.isActiveExecuting = false;
            editor.executing = false;
          });
          Broker.emit(EventType.EXPLAIN_OUTPUT_AVAILABLE, {
            id,
            shell,
            command: filteredContent,
            type: explainParam,
            output: response
          });
        })
        .catch(err => {
          l.error('Failed to execute explain:', err);
          NewToaster.show({
            message: globalString('explain/executionError'),
            className: 'danger',
            icon: 'thumbs-down'
          });
          runInAction(() => {
            editor.executing = false;
            this.props.store.editorToolbar.isActiveExecuting = false;
          });
        });
    }
  }

  /**
   * Inserts the text at the current cursor position
   * @param {String} text - The text to add to the editor.
   */
  insertAtCursor(text) {
    const cm = this.editor.getCodeMirror();
    cm.replaceSelection(text);
  }

  /**
   * Refresh the code mirror instance to account for tab or layout changes.
   */
  refresh() {
    if (this.editor) {
      const cm = this.editor.getCodeMirror();
      cm.refresh();
      cm.focus();
      this.setupAutoCompletion();
      cm.scrollIntoView(cm.getCursor());
    }
  }

  /**
   * Beautify SQL Code.
   * @param {string code} - input code.
   * @return {string} - beautified code.
   */
  _prettifySQL(code) {
    return sqlFormatter.format(code);
  }

  /**
   * Prettify provided code
   *
   * @param {string} code - input code
   * @return {string} prettified code
   */
  _prettify(code) {
    // preprocess code
    if (!this._prettify.preprocess) {
      // lazy init [^\S\x0a\x0d] matches whitespaces without line feed with
      // cross-platform support
      const commentMongoCommandLinesRegex = /^[^\S\x0a\x0d]*(?:show|help|use|it|exit)(?:[^\S\x0a\x0d]+\S+|)$/gm;
      const commentMongoCommandLinesReplacement = '//DBKODA//$&';
      this._prettify.preprocess = code => {
        code = code.replace(commentMongoCommandLinesRegex, commentMongoCommandLinesReplacement);

        return code;
      };
    }
    code = this._prettify.preprocess(code);

    // feed into prettier
    code = Prettier.format(code, { singleQuote: true });

    // postprocess result
    if (!this._prettify.postprocess) {
      // lazy init
      const uncommentMongoCommandLinesRegex = /^[^\S\x0a\x0d]*\/\/DBKODA\/\//gm;
      const uncommentMongoCommandLinesReplacement = '';

      const fixFunctionChainingRegex = /(\S)(\s+)\.(\S)/g;
      const fixFunctionChainingReplacement = '$1.$2$3';

      this._prettify.postprocess = code => {
        code = code.replace(uncommentMongoCommandLinesRegex, uncommentMongoCommandLinesReplacement);

        code = code.replace(fixFunctionChainingRegex, fixFunctionChainingReplacement);

        return code;
      };
    }
    code = this._prettify.postprocess(code);

    return code;
  }

  /**
   * Prettify All code.
   */
  prettifyAll() {
    try {
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      if (editor.type === 'drill') {
        this.setEditorValue(this._prettifySQL(this.getEditorValue()));
      } else {
        this.setEditorValue(this._prettify(this.getEditorValue()));
      }
    } catch (err) {
      NewToaster.show({
        message: 'Error: ' + err.message,
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
  }

  /**
   * Prettify selected code.
   */
  prettifySelection() {
    const cm = this.editor.getCodeMirror();
    try {
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      if (editor.type === 'drill') {
        cm.replaceSelection(this._prettifySQL(cm.getSelection()).trim());
      } else {
        cm.replaceSelection(this._prettify(cm.getSelection()).trim());
      }
    } catch (err) {
      NewToaster.show({
        message: 'Error: ' + err.message,
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
  }

  @action.bound
  translateToNativeCode() {
    const cm = this.editor.getCodeMirror();
    let shellCode = cm.getSelection();
    if (!shellCode) {
      // if there is no selection, translate all code on the editor
      shellCode = this.getEditorValue();
    }
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (editor) {
      editor.openTranslator = true;
      try {
        editor.shellCode = shellCode;
        this.setState({ openTranslator: true });
      } catch (err) {
        l.error('Failed to translate to native code:', err);
      }
    }
  }

  @action.bound
  finishedExecution(event) {
    l.debug('Finished Executing');
    const editorIndex = this.props.store.editorPanel.activeEditorId;
    if (!this.props.store.editors.get(editorIndex)) {
      return;
    }
    this.props.store.editors.get(editorIndex).executing = false;
    const editorValues = [...this.props.store.editors.values()];
    editorValues.map(v => {
      if (v.profileId === event.id && v.shellId === event.shellId) {
        v.executing = false;
        v.lastExecutionTime = Date.now() - v.lastExecutionStart;
        v.lastExecutionFailed = true;
      }
    });
    if (
      this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).shellId ===
      event.shellId
    ) {
      runInAction('Execution has copleted on current editor.', () => {
        this.props.store.editorToolbar.isActiveExecuting = false;
        this.props.store.editorPanel.stoppingExecution = false;
      });
      const cm = this.editor.getCodeMirror();
      cm.focus();
    }
  }

  /**
   * Trigger an executeLine event by updating the MobX global store.
   */
  @action
  executeLine() {
    this.props.store.editorPanel.executingEditorLines = true;
  }

  /**
   * Trigger an executeAll event by updating the MobX global store.
   */
  @action
  executeAll() {
    this.props.store.editorPanel.executingEditorAll = true;
  }

  /**
   * Render method for the editor Context Menu.
   */
  renderContextMenu() {
    return (
      <Menu>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.executeLine}
            text={globalString('editor/view/menu/executeSelected')}
            icon="chevron-right"
            intent={Intent.NONE}
          />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.executeAll}
            text={globalString('editor/view/menu/executeAll')}
            icon="double-chevron-right"
            intent={Intent.NONE}
          />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.refresh}
            text={globalString('editor/view/menu/refresh')}
            icon="refresh"
            intent={Intent.NONE}
          />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.prettifyAll}
            text={globalString('editor/view/menu/formatAll')}
            icon="align-left"
            intent={Intent.NONE}
          />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.prettifySelection}
            text={globalString('editor/view/menu/formatSelection')}
            icon="align-left"
            intent={Intent.NONE}
          />
        </div>
        {this.props.store.editors.get(this.props.id).type != EditorTypes.DRILL && (
          <div className="menuItemWrapper translator">
            <MenuItem
              onClick={this.translateToNativeCode}
              text={globalString('editor/view/menu/translateSelection')}
              icon="align-left"
              intent={Intent.NONE}
            />
          </div>
        )}
      </Menu>
    );
  }

  @action.bound
  closeTranslatorPanel() {
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    editor.openTranslator = false;
    this.setState({ openTranslator: false });
  }

  getStyles() {
    l.debug('getStyles()');
    const { editor } = this.props.config.settings;
    const styles = _.pick(editor, ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']);
    styles.color = editor.fontColor;
    return styles;
  }

  /**
   * Render method for the component.
   */
  render() {
    const { connectDropTarget, isOver } = this.props; // eslint-disable-line
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    const styles = this.getStyles();
    if (editor && editor.openTranslator && this.editor) {
      let cm = null;
      if (this.editor) {
        cm = this.editor.getCodeMirror();
      }
      return connectDropTarget(
        <div className="editorView translator-open" style={styles}>
          <SplitPane split="vertical" primary="second" defaultSize={512} minSize={200}>
            <CodeMirrorEditor
              ref={ref => (this.editor = ref)}
              codeMirrorInstance={CodeMirror}
              options={this.cmOptions}
            />
            <TranslatorPanel
              value={editor.shellCode}
              syntax="cb"
              profileId={editor.profileId}
              shellId={editor.shellId}
              editorCodeMirror={cm}
              editor={editor}
              closePanel={this.closeTranslatorPanel}
            />
          </SplitPane>
        </div>
      );
    }

    return connectDropTarget(
      <div className="editorView" style={styles}>
        <CodeMirrorEditor
          ref={ref => (this.editor = ref)}
          codeMirrorInstance={CodeMirror}
          options={this.cmOptions}
        />{' '}
        {isOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              zIndex: 1,
              opacity: 0.5,
              backgroundColor: 'yellow'
            }}
          />
        )}
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, editorTarget, collect)(View);
