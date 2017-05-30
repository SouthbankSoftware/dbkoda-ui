/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-26T14:14:08+10:00
 */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import {inject, PropTypes} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {action, reaction, runInAction} from 'mobx';
import {ContextMenuTarget, Intent, Menu, MenuItem} from '@blueprintjs/core';

import {DropTarget} from 'react-dnd';
import 'codemirror/theme/material.css';
import {DragItemTypes} from '#/common/Constants.js';
import {NewToaster} from '#/common/Toaster';
import TreeDropActions from '#/TreePanel/model/TreeDropActions.js';
import EventLogging from '#/common/logging/EventLogging';
import './Panel.scss';
import {Broker, EventType} from '../../helpers/broker';


const Prettier = require('prettier');
const React = require('react');
const CodeMirror = require('react-codemirror');
const CM = require('codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/selection/active-line.js');
require('codemirror/addon/selection/mark-selection.js');
require('codemirror/addon/display/autorefresh.js');
require('codemirror/addon/edit/matchbrackets.js');
require('codemirror/addon/edit/closebrackets.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/comment-fold.js');
require('codemirror/addon/fold/xml-fold.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/javascript-hint.js');
// require('codemirror/addon/search/search.js');
// require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/jump-to-line.js');
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/search/matchesonscrollbar.js');
require('codemirror/addon/scroll/annotatescrollbar.js');
require('codemirror/addon/scroll/simplescrollbars.js');

require('codemirror/keymap/sublime.js');
require('codemirror-formatting');
require('#/common/MongoScript.js');

const MAX_LINT_ERROR_CHARACTERS = 150;
const LINT_INTERVAL = 1000;
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
    console.log('DROP monitor.getItem:', monitor.getItem());
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
    isOverCurrent: monitor.isOver({shallow: true})
  };
}

/**
 * Defines the View for the CodeMirror Editor.
 */
@inject('store')
@ContextMenuTarget
class View extends React.Component {
  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      lintingErrors: [],
      lintingAnnotations: new Map(),
      lineWrapping: true,
      isLinting: false,
      lintLoops: 0,
      options: {
        theme: 'material',
        lineNumbers: 'true',
        indentUnit: 2,
        styleActiveLine: 'true',
        scrollbarStyle: 'overlay',
        smartIndent: true,
        styleSelectedText: true,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldOptions: {
          widget: '...'
        },
        foldGutter: true,
        gutters: [
          'CodeMirror-linenumbers', 'CodeMirror-foldgutter' // , 'CodeMirror-lint-markers'
        ],
        keyMap: 'sublime',
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          Tab(cm) {
            cm.replaceSelection('  ');
          },
          'Ctrl-Q': function (cm) {
            cm.foldCode(cm.getCursor());
          }
        },
        mode: 'MongoScript'
      },
      code: ''
    };

    /**
     * Reaction function for when a change occurs on the editorPanel.executingEditorAll state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToExecuteAll = reaction(
    // eslint-disable-line
    () => this.props.store.editorPanel.executingEditorAll, (executingEditorAll) => {
      //eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.editorPanel.executingEditorAll == true) {
        console.log(this.props.store.editors);
        console.log(this.props.store.profiles);
        const editor = this
          .props
          .store
          .editors
          .get(this.props.store.editorPanel.activeEditorId);
        const shell = editor.shellId;
        const profileId = editor.profileId;

        console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', profileId, '/', shell, ': "', editor.code, '".');

        // Listen for completion
        this
          .props
          .store
          .editors
          .get(editor.id)
          .executing = true;
        this.props.store.editorToolbar.isActiveExecuting = true;
        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(profileId, {
          shellId: shell, // eslint-disable-line
          commands: editor
            .code
            .replace(/\t/g, '  ')
        }).catch((err) => {
          console.error('execute error:', err);
          runInAction(() => {
            this.props.store.editorToolbar.isActiveExecuting = false;
            NewToaster.show({
              message: globalString('editor/toolbar/executionScriptFailed'),
              intent: Intent.DANGER,
              iconName: 'pt-icon-thumbs-down'
            });
          });
        });
        this.props.store.editorPanel.executingEditorAll = false;
      }
    });

    /**
     * Reaction function for when a change occurs on the editorPanel.executingEditorLines state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToExecuteLine = reaction(
    // eslint-disable-line
    () => this.props.store.editorPanel.executingEditorLines, (executingEditorLines) => {
      //eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.editorPanel.executingEditorLines == true) {
        // Determine code to send.
        const editor = this
          .props
          .store
          .editors
          .get(this.props.store.editorPanel.activeEditorId);
        const shell = editor.shellId;
        const id = editor.profileId;

        const cm = this
          .refs
          .editor
          .getCodeMirror(); // eslint-disable-line
        let content = cm.getSelection();
        if (cm.getSelection().length > 0) {
          console.log('Executing Highlighted Text.');
        } else {
          console.log('No Highlighted Text, Executing Line: ', cm.getCursor().line + 1);
          content = cm.getLine(cm.getCursor().line);
        }

        console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', id, '/', shell, ': "', content, '".');
        this
          .props
          .store
          .editors
          .get(editor.id)
          .executing = true;
        this.props.store.editorToolbar.isActiveExecuting = true;

        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(id, {
          shellId: shell, // eslint-disable-line
          commands: content.replace(/\t/g, '  ')
        }).catch((err) => {
          console.error('execute error:', err);
          runInAction(() => {
            this.props.store.editorToolbar.isActiveExecuting = false;
            NewToaster.show({
              message: globalString('editor/toolbar/executionScriptFailed'),
              intent: Intent.DANGER,
              iconName: 'pt-icon-thumbs-down'
            });
          });
        });
        this.props.store.editorPanel.executingEditorLines = false;
      }
    });
    /**
     * Reaction function for when a change occurs on the dragItem.drapDrop state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToDragDrop = reaction(
    // eslint-disable-line
    () => this.props.store.dragItem.dragDrop, (dragDrop) => {
      // eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.dragItem.dragDrop) {
        if (this.props.store.dragItem.item) {
          const item = this.props.store.dragItem.item;
          this.insertAtCursor(TreeDropActions.getCodeForTreeNode(item));
        }
        this.props.store.dragItem.dragDrop = false;
      }
    });

    /**
       * Reaction function to receive and append a command from the output terminal
       * @param {function()} - The state that will trigger the reaction.
       * @param {function()} - The reaction to any change on the state.
       */
    const reactionToTerminalPush = reaction(() => this.props.store.outputPanel.sendingCommand, (sendingCommand) => {
      console.log('reactionToTerminalPush');
      if (sendingCommand && this.props.store.editorPanel.activeEditorId == this.props.id) {
        console.log(sendingCommand);
        this.insertAtCursor(sendingCommand);
        this.props.store.outputPanel.sendingCommand = '';
      }
    }, {'name': 'EditorViewReactionToTerminalPush'});

    /**
     * Reaction function for when a change occurs on the
     * editorPanel.stoppingExecution state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToStopExecution = reaction(() => this.props.store.editorPanel.stoppingExecution, (stoppingExecution) => {
      if (this.props.store.editorPanel.stoppingExecution) {
        this.props.store.editorPanel.stoppingExecution = false;
        const editor = this
          .props
          .store
          .editors
          .get(this.props.store.editorPanel.activeEditorId);
        const shell = editor.shellId;
        const id = editor.profileId;
        console.log(`Stopping Execution of ${id} / ${shell}!`);
        const service = featherClient().service('/mongo-stop-execution');
        service.timeout = 1000;
        service
          .get(id, {
          query: {
            shellId: shell
          }
        })
          .then((response) => {
            console.log(`Stopped Execution of ${id} / ${shell}!`);
            if (response) {
              NewToaster.show({message: response.result, intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
            } else {
              NewToaster.show({message: globalString('editor/view/executionStopped'), intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
            }
            this.finishedExecution({id, shellId: shell});
          })
          .catch((reason) => {
            console.error(`Stopping Execution failed for ${id} / ${shell}! ${reason.message}`);
            NewToaster.show({
              message: globalString('editor/view/executionStoppedError', reason.message),
              intent: Intent.DANGER,
              iconName: 'pt-icon-thumbs-down'
            });
            this.finishedExecution({id, shellId: shell});
          });
      }
    });

    const reactToTreeActionChange = reaction(
    //eslint-disable-line
    () => this.props.store.treeActionPanel.isNewFormValues, () => {
      if (this.props.store.treeActionPanel.isNewFormValues && this.props.store.editorPanel.activeEditorId == this.props.id) {
        try {
          const cm = this
            .refs
            .editor
            .getCodeMirror();
          cm.setValue(this.props.store.treeActionPanel.formValues);
          this.updateCode(this.props.store.treeActionPanel.formValues);
        } catch (e) {
          console.log(e);
        }
        this.props.store.treeActionPanel.isNewFormValues = false;
      }
    });

    // reactToEditorContentChange
    // TODO
    reaction(() => {
      const currEditor = this
        .props
        .store
        .editors
        .get(this.props.id);
      if (currEditor) {
        return currEditor.code;
      }
    }, (code) => {
      if (code) {
        try {
          const cm = this
            .refs
            .editor
            .getCodeMirror();
          const oldCursor = cm.getCursor();
          const oldScroll = cm.getScrollInfo();
          cm.setValue(code);
          cm.setCursor(oldCursor);
          cm.scrollTo(oldScroll.left, oldScroll.top);
        } catch (e) {
          console.log(e);
        }
      }
    });

    this.refresh = this
      .refresh
      .bind(this);
    this.executeLine = this
      .executeLine
      .bind(this);
    this.executeAll = this
      .executeAll
      .bind(this);
    this.loopingLint = this
      .loopingLint
      .bind(this);
    this.prettifyAll = this
      .prettifyAll
      .bind(this);
    this.prettifySelection = this
      .prettifySelection
      .bind(this);
  }

  /**
   * Component Did mount function, causes CodeMirror to refresh to ensure UI is scaled properly.
   */
  componentDidMount() {
    this.refresh();
    CM.commands.autocomplete = (cm) => {
      const currentLine = cm.getLine(cm.getCursor().line);
      console.log('current line:', currentLine);
      let start = cm
        .getCursor()
        .ch;
      let end = start;
      while (end < currentLine.length && /[\w|.$]+/.test(currentLine.charAt(end))) {
        end -= 1;
      }
      while (start && /[\w|.$]+/.test(currentLine.charAt(start - 1))) {
        start -= 1;
      }
      const curWord = start != end && currentLine.slice(start, end);
      console.log('current word ', curWord);
      if (!curWord) {
        return;
      }
      const {id, shell} = this.getActiveProfileId();
      if (!id || !shell) {
        return;
      }
      console.log('send auto complete ', id, shell, curWord);
      const service = featherClient().service('/mongo-auto-complete');
      service
        .get(id, {
        query: {
          shellId: shell,
          command: curWord
        }
      })
        .then((res) => {
          console.log('write response ', res, cm.getDoc().getCursor());
          if (res && res.length === 1 && res[0].trim().length === 0) {
            return;
          }
          const cursor = cm
            .getDoc()
            .getCursor();
          const from = new CM.Pos(cursor.line, cursor.ch - curWord.length);
          const options = {
            hint() {
              return {
                from,
                to: cm
                  .getDoc()
                  .getCursor(),
                list: res
              };
            }
          };
          cm.showHint(options);
        });
    };
    Broker.on(EventType.EXECUTION_EXPLAIN_EVENT, this.executingExplain.bind(this));
    if (this.props.editor) {
      const {profileId, shellId} = this.props.editor;
      Broker.on(EventType.createShellExecutionFinishEvent(profileId, shellId), this.finishedExecution);
    }
  }

  componentWillUnmount() {
    Broker.removeListener(EventType.EXECUTION_EXPLAIN_EVENT, this.executingExplain);
    if (this.props.editor) {
      const {profileId, shellId} = this.props.editor;
      Broker.removeListener(EventType.createShellExecutionFinishEvent(profileId, shellId), this.finishedExecution);
    }
  }

  getActiveProfileId() {
    const editor = this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId);
    if (editor) {
      const shell = editor.shellId;
      return {id: editor.profileId, shell};
    }
  }

  getCode() {
    return this
      .props
      .store
      .editors
      .get(this.props.id)
      .code;
  }

  /**
   * executing explain parameters
   * @param explainParam  explain parameter, it could be queryPlanner, executionStats, allPlansExecution
   */
  executingExplain(explainParam) {
    console.log('send explain request ', explainParam);
    if (this.refs.editor && this.props.store.editorPanel.activeEditorId == this.props.id && explainParam) {
      // Determine code to send.
      const editor = this
        .props
        .store
        .editors
        .get(this.props.store.editorPanel.activeEditorId);
      const {id, shell} = this.getActiveProfileId();

      const cm = this
        .refs
        .editor
        .getCodeMirror(); // eslint-disable-line
      let content = cm.getSelection();
      if (cm.getSelection().length > 0) {
        console.log('Executing Highlighted Text.');
      } else {
        console.log('No Highlighted Text, Executing Line: ', cm.getCursor().line + 1);
        content = cm.getLine(cm.getCursor().line);
      }
      content = content.replace(/\n/g, '');
      if (content.indexOf('.explain(') < 0) {
        if (content.indexOf('count()') > 0) {
          content = content.replace(/\.count\(\)/, '.explain("' + explainParam + '").count()');
        } else if (content.indexOf('.update(') > 0) {
          content = content.replace(/\.update\(/, '.explain("' + explainParam + '").update(');
        } else if (content.indexOf('.distinct(') > 0) {
          content = content.replace(/\.distinct\(/, '.explain("' + explainParam + '").distinct(');
        } else if (content.indexOf('.aggregate') > 0) {
          content = content.replace(/\.aggregate\(/, '.explain("' + explainParam + '").aggregate(');
        } else if (content.match(/;$/)) {
          content = content.replace(/;$/, '.explain("' + explainParam + '");');
        } else {
          content += '.explain("' + explainParam + '")';
        }
      }

      console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', id, '/', shell, ': "', content, '".');

      editor.executing = true;
      // Send request to feathers client
      const service = featherClient().service('/mongo-sync-execution');
      const filteredContent = content.replace(/\t/g, '  ');
      service.timeout = 120000;
      this.props.store.editorToolbar.isActiveExecuting = true;
      service
        .update(id, {
        shellId: shell, // eslint-disable-line
        commands: filteredContent
      })
        .then((response) => {
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
        .catch((err) => {
          console.log('error:', err);
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
    const cm = this
      .refs
      .editor
      .getCodeMirror();
    cm.replaceSelection(text);
  }

  /**
   * Refresh the code mirror instance to account for tab or layout changes.
   */
  refresh() {
    const cm = this
      .refs
      .editor
      .getCodeMirror();
    cm.refresh();
  }

  /**
   * Prettify All code.
   */
  prettifyAll() {
    const cm = this
      .refs
      .editor
      .getCodeMirror();
    try {
      let beautified = Prettier.format(this.getCode(), {});
      beautified = beautified.replace(/(\S)(\s+)\.(\S)/g, '$1.$2$3');
      this.updateCode(beautified);
    } catch (err) {
      NewToaster.show({message: globalString('editor/view/formatError'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, 'Format All failed with error: ' + err);
      }
    }
  }

  /**
   * Prettify selected code.
   */
  prettifySelection() {
    const cm = this
      .refs
      .editor
      .getCodeMirror();
    console.log(cm.getSelection());
    try {
      let beautified = Prettier.format(cm.getSelection(), {});
      beautified = beautified.replace(/(\S)(\s+)\.(\S)/g, '$1.$2$3');
      cm.replaceSelection(beautified);
    } catch (err) {
      NewToaster.show({message: globalString('editor/view/formatError'), intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, 'Format Selection failed with error: ' + err);
      }
    }
  }

  /**
   * Update linting annotations on the editor.
   */
  updateLintingAnnotations() {
    const cm = this
      .refs
      .editor
      .getCodeMirror();
    this
      .state
      .lintingAnnotations
      .clear();
    this
      .state
      .lintingErrors
      .forEach((value) => {
        // Check if line already used, if so append.
        if (this.state.lintingAnnotations.get(value.line) != undefined) {
          const msg = document.createElement('div');
          const icon = msg.appendChild(document.createElement('div'));
          icon.innerHTML = '!';
          const tooltip = icon.appendChild(document.createElement('span'));
          tooltip.innerHTML = this
            .state
            .lintingAnnotations
            .get(value.line)
            .lintText + '\n' + value.message;
          tooltip.className = 'tooltiptext';
          icon.className = 'tooltip lint-error-icon';
          msg.className = 'tooltiptext';
          if (tooltip.innerHTML.length > MAX_LINT_ERROR_CHARACTERS) {
            tooltip.innerHTML = globalString('editor/view/tooManyLintErrors');
          }
          msg.lintText = tooltip.innerHTML;
          this
            .state
            .lintingAnnotations
            .set(value.line, msg);
        } else {
          // New Annotation.
          const msg = document.createElement('div');
          const icon = msg.appendChild(document.createElement('div'));
          icon.innerHTML = '!';
          const tooltip = icon.appendChild(document.createElement('span'));
          tooltip.innerHTML = value.message;
          tooltip.className = 'tooltiptext';
          icon.className = 'tooltip lint-error-icon';
          msg.className = 'tooltiptext';
          this
            .state
            .lintingAnnotations
            .set(value.line, msg);
        }
      });

    this
      .state
      .lintingAnnotations
      .forEach((value, key) => {
        cm.setGutterMarker(key - 1, 'CodeMirror-lint-markers', value);
      });
  }

  @action.bound
  finishedExecution(event) {
    const editorIndex = this.props.store.editorPanel.activeEditorId;
    if (!this.props.store.editors.get(editorIndex)) {
      return;
    }
    this
      .props
      .store
      .editors
      .get(editorIndex)
      .executing = false;
    const editorValues = this
      .props
      .store
      .editors
      .values();
    editorValues.map((v) => {
      if (v.profileId === event.id && v.shellId === event.shellId) {
        v.executing = false;
      }
    });
    if (this.props.store.editorPanel.activeEditorId == this.props.id) {
      this.props.store.editorToolbar.isActiveExecuting = false;
      this.props.store.editorPanel.stoppingExecution = false;
    }
  }

  /**
   * Update the local code state.
   * @param {String} - New code to be entered into the editor.
   */
  @action updateCode(newCode) {
    this
      .props
      .store
      .editors
      .get(this.props.id)
      .code = newCode;
    // @TODO -> Re-enable Linting when it is fully functional. if
    // (!this.state.isLinting) {
    if (false) {
      this.state.isLinting = true;
      this.loopingLint();
    }
  }

  loopingLint() {
    this.state.lintLoops = this.state.lintLoops + 1;
    // Lint 2 times before waiting for more input.
    if (this.state.lintLoops > 2) {
      this.state.isLinting = false;
      this.state.lintLoops = 0;
      return;
    }
    // Clear Annotations.
    const cm = this
      .refs
      .editor
      .getCodeMirror();

    this
      .state
      .lintingErrors
      .forEach((value) => {
        cm.removeLineClass(value.line, 'text', 'lint-error');
        cm.clearGutter('CodeMirror-lint-markers');
      });
    // Trigger linting on code.
    const service = featherClient().service('linter');
    service.timeout = 30000;
    service.get('{id}', {
      query: {
        code: this.getCode(), // eslint-disable-line
        options: {}
      }
    }).then((result) => {
      if (result.results[0].messages.length > 0) {
        this.state.lintingErrors = result.results[0].messages;
        this.updateLintingAnnotations();
        if (this.props.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.LINTING_WARNING, EventLogging.getFragmentEnum().EDITORS, result);
        }
      }
    }).catch((error) => {
      if (this.props.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(EventLogging.getTypeEnum().ERROR, EventLogging.getFragmentEnum().EDITORS, error);
      }
    });
    setTimeout(this.loopingLint, LINT_INTERVAL);
  }

  /**
   * Trigger an executeLine event by updating the MobX global store.
   */
  @action executeLine() {
    this.props.store.editorPanel.executingEditorLines = true;
  }

  /**
   * Trigger an executeAll event by updating the MobX global store.
   */
  @action executeAll() {
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
            iconName="pt-icon-chevron-right"
            intent={Intent.NONE} />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.executeAll}
            text={globalString('editor/view/menu/executeAll')}
            iconName="pt-icon-double-chevron-right"
            intent={Intent.NONE} />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.refresh}
            text={globalString('editor/view/menu/refresh')}
            iconName="pt-icon-refresh"
            intent={Intent.NONE} />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.prettifyAll}
            text={globalString('editor/view/menu/formatAll')}
            iconName="pt-icon-align-left"
            intent={Intent.NONE} />
        </div>
        <div className="menuItemWrapper">
          <MenuItem
            onClick={this.prettifySelection}
            text={globalString('editor/view/menu/formatSelection')}
            iconName="pt-icon-align-left"
            intent={Intent.NONE} />
        </div>
      </Menu>
    );
  }

  /**
   * Render method for the component.
   */
  render() {
    const {connectDropTarget, isOver} = this.props; // eslint-disable-line
    return connectDropTarget(
      <div className="editorView">
        <CodeMirror
          autoSave
          ref="editor"
          codeMirrorInstance={CM}
          value={this.getCode()}
          onChange={value => this.updateCode(value)}
          options={this.state.options} /> {' '}
        {isOver && <div
          style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
          opacity: 0.5,
          backgroundColor: 'yellow'
        }} />}
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, editorTarget, collect)(View);
