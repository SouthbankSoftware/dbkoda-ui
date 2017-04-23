/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-21T16:19:55+10:00
 */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
/* eslint-disable */
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import {inject, PropTypes} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {action, observe, reaction, runInAction} from 'mobx';
import {ContextMenuTarget, Intent, Menu, MenuItem} from '@blueprintjs/core';

import {DropTarget} from 'react-dnd';
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
require('codemirror/addon/search/search.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/jump-to-line.js');
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/search/matchesonscrollbar.js');
require('codemirror/addon/scroll/annotatescrollbar.js');

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
    isOver: monitor.isOver()
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
      isLinting: false,
      lintLoops: 0,
      options: {
        theme: 'ambiance',
        lineNumbers: 'true',
        indentUnit: 2,
        styleActiveLine: 'true',
        smartIndent: true,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldOptions: {
          widget: '...'
        },
        foldGutter: true,
        gutters: [
          'CodeMirror-linenumbers','CodeMirror-foldgutter', 'CodeMirror-lint-markers'
        ],
        keyMap: 'sublime',
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Tab': function (cm) {
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
    const reactionToExecuteAll = reaction( // eslint-disable-line
        () => this.props.store.editorPanel.executingEditorAll, executingEditorAll => { //eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.title && this.props.store.editorPanel.executingEditorAll == true) {
        let shell = null;
        let id = null;
        this
          .props
          .store
          .editors
          .forEach((value) => {
            if (value.alias == this.props.store.editorPanel.activeDropdownId) {
              shell = value.shellId;
              id = value.id;
            }
          });
        console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', id, '/', shell, ': "', this.state.code, '".');
        Broker.on(EventType.createShellExecutionFinishEvent(id, shell), this.finishedExecution);
        // Listen for completion
        const editorIndex = this.props.store.editorPanel.activeEditorId;
        this
          .props
          .store
          .editors
          .get(editorIndex)
          .executing = true;
        this.props.store.editorToolbar.isActiveExecuting = true;
        console.log('Editor: Execution started! ' + editorIndex);
        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(id, {
          shellId: shell, // eslint-disable-line
          commands: this
            .state
            .code
            .replace('\t', '  ')
        });
        this.props.store.editorPanel.executingEditorAll = false;
      }
    });

    /**
     * Reaction function for when a change occurs on the editorPanel.executingEditorLines state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToExecuteLine = reaction( // eslint-disable-line
        () => this.props.store.editorPanel.executingEditorLines, executingEditorLines => { //eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.title && this.props.store.editorPanel.executingEditorLines == true) {
        // Determine code to send.
        let shell = null;
        let id = null;
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
        this
          .props
          .store
          .profiles
          .forEach((value) => {
            if (value.alias == this.props.store.editorPanel.activeDropdownId) {
              shell = value.shellId;
              id = value.id;
            }
          });
        console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', id, '/', shell, ': "', content, '".');
        // Listen for completion
        Broker.on(EventType.createShellExecutionFinishEvent(id, shell), this.finishedExecution);
        const editorIndex = this.props.store.editorPanel.activeEditorId;
        this
          .props
          .store
          .editors
          .get(editorIndex)
          .executing = true;
        this.props.store.editorToolbar.isActiveExecuting = true;

        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(id, {
          shellId: shell, // eslint-disable-line
          commands: content.replace('\t', '  ')
        });
        this.props.store.editorPanel.executingEditorLines = false;
      }
    });
    /**
     * Reaction function for when a change occurs on the dragItem.drapDrop state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToDragDrop = reaction( // eslint-disable-line
        () => this.props.store.dragItem.dragDrop, dragDrop => { // eslint-disable-line
      if (this.props.store.dragItem.dragDrop && this.props.store.dragItem.item !== null) {
        const item = this.props.store.dragItem.item;
        // this.setState({code: item.label});
        this.insertAtCursor(TreeDropActions.getCodeForTreeNode(item));
        this.props.store.dragItem.dragDrop = false;
      }
    });

    /**
     * Reaction function for when a change occurs on the editorPanel.executingEditorLines state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToExplain = reaction( // eslint-disable-line
      () => this.props.store.editorPanel.executingExplain, executingEditorLines => { //eslint-disable-line
        const explainParam = this.props.store.editorPanel.executingExplain;
        if (this.props.store.editorPanel.activeEditorId == this.props.title && explainParam) {
          // Determine code to send.
          let shell = null;
          let id = null;
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
          content = content.replace(/\n/, '');
          if (content.indexOf('count()') > 0) {
            content = content.replace(/\.count\(\)/, '.explain("' + explainParam + '").count()')
          } else if (content.indexOf('.update(') > 0) {
            content = content.replace(/\.update\(/, '.explain("' + explainParam + '").update(')
          } else if (content.indexOf('.distinct(') > 0) {
            content = content.replace(/\.distinct\(/, '.explain("' + explainParam + '").distinct(')
          } else if (content.indexOf('.explain') < 0) {
            if (content.match(/;$/)) {
              content = content.replace(/;$/, '.explain("' + explainParam + '");');
            } else {
              content += '.explain("' + explainParam + '")';
            }
          }
          this
            .props
            .store
            .profiles
            .forEach((value) => {
              if (value.alias == this.props.store.editorPanel.activeDropdownId) {
                shell = value.shellId;
                id = value.id;
              }
            });
          console.log('[', this.props.store.editorPanel.activeDropdownId, ']Sending data to feathers id ', id, '/', shell, ': "', content, '".');

          const editorIndex = this.props.store.editorPanel.activeEditorId;
          const editor = this
            .props
            .store
            .editors
            .get(editorIndex);

          editor.executing = true;
          // Send request to feathers client
          const service = featherClient().service('/mongo-sync-execution');
          const filteredContent = content.replace('\t', '  ');
          service.timeout = 30000;
          this.props.store.editorToolbar.isExplainExecuting = true;
          service.update(id, {
            shellId: shell, // eslint-disable-line
            commands: filteredContent
          }).then((response) => {
            runInAction(()=>{
              this.props.store.editorToolbar.isExplainExecuting = false;
            });
            Broker.emit(EventType.createExplainExeuctionEvent(id, shell), {
              id,
              shell,
              command: filteredContent,
              type: explainParam,
              output: response,
            });
          }).catch((err)=>{
            console.log('error:', err);
            runInAction(()=>{
              this.props.store.editorToolbar.isExplainExecuting = false;
            });

          });
          this.props.store.editorPanel.executingExplain = false;
        }
      });

    /**
     * Reaction function for when a change occurs on the
     * editorPanel.stoppingExecution state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToStopExecution = reaction(
      () => this.props.store.editorPanel.stoppingExecution,
      stoppingExecution => {
        if (this.props.store.editorPanel.stoppingExecution) {
          const id = this.props.store.editorToolbar.id;
          const shellId = this.props.store.editorToolbar.shellId;
          console.log(`Stopping Execution of ${id} / ${shellId}!`);
          //Broker.on(EventType.createShellExecutionFinishEvent(id, shellId), this.finishedExecution);
          const service = featherClient().service('/mongo-stop-execution');
          service.timeout = 30000;
          service
            .get(id, {
              query: {
                shellId: shellId, // eslint-disable-line
              }
            })
            .then((response) => {
              console.log(`Stopped Execution of ${id} / ${shellId}!`);
              if(response) {
                NewToaster.show({message: response.result, intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
              }
              else {
                NewToaster.show({message: "Execution Stopped Successfully", intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
              }
              this.finishedExecution();
            })
            .catch((reason) => {
              console.log(`Stopping Execution failed for ${id} / ${shellId}!`);
              NewToaster.show({message: "Stop Execution Failed! " + reason, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
            });
        }
      }
    );

    const reactToTreeActionChange = reaction( //eslint-disable-line
        () => this.props.store.treeActionPanel.isNewFormValues,
        () => {
          if (this.props.store.treeActionPanel.isNewFormValues && this.props.store.editorPanel.activeEditorId == this.props.title) {
            const cm = this
              .refs
              .editor
              .getCodeMirror();
            cm.setValue(this.props.store.treeActionPanel.formValues);
            this.props.store.treeActionPanel.isNewFormValues = false;
          }
        }
      );
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
    //
    // let orig = CM.hint.javascript; CM.hint.javascript = function (cm) {   let
    // inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
    // inner.list.push("bozo");   return inner; };

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
  }

  getActiveProfileId() {
    let shell = null;
    let id = null;
    this
      .props
      .store
      .profiles
      .forEach((value) => {
        if (value.alias == this.props.store.editorPanel.activeDropdownId) {
          shell = value.shellId;
          id = value.id;
        }
      });
    return {id, shell};
  }

  @action.bound
  finishedExecution() {
    const id = this.props.store.editorToolbar.id;
    const shell = this.props.store.editorToolbar.shellId;
    const editorIndex = this.props.store.editorPanel.activeEditorId;
    this
      .props
      .store
      .editors
      .get(editorIndex)
      .executing = false;
    if (this.props.store.editorPanel.activeEditorId == this.props.title) {
      this.props.store.editorToolbar.isActiveExecuting = false;
      this.props.store.editorPanel.stoppingExecution = false;
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
      const beautified = Prettier.format(this.state.code, {});
      cm.setValue(beautified);
    } catch (err) {
      NewToaster.show({message: 'Unable to format text, sorry!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
      const beautified = Prettier.format(cm.getSelection(), {});
      cm.replaceSelection(beautified);
    } catch (err) {
      NewToaster.show({message: 'Unable to format text, sorry!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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
            tooltip.innerHTML = 'Too many Linting Errors on this line...';
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

  /**
   * Update the local code state.
   * @param {String} - New code to be entered into the editor.
   */
  updateCode(newCode) {
    this.setState({code: newCode});
    if (!this.state.isLinting) {
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
    service
      .get('{id}', {
      query: {
        code: this.state.code, // eslint-disable-line
        options: {}
      }
    })
      .then((result) => {
        if (result.results[0].messages.length > 0) {
          this.state.lintingErrors = result.results[0].messages;
          this.updateLintingAnnotations();
          if (this.props.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.LINTING_WARNING, EventLogging.getFragmentEnum().EDITORS, result);
          }
        }
      })
      .catch((error) => {
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
        <MenuItem
          onClick={this.executeLine}
          text="Execute Selected"
          iconName="pt-icon-chevron-right"
          intent={Intent.NONE}/>
        <MenuItem
          onClick={this.executeAll}
          text="Execute All"
          iconName="pt-icon-double-chevron-right"
          intent={Intent.NONE}/>
        <MenuItem
          onClick={this.refresh}
          text="Refresh"
          iconName="pt-icon-refresh"
          intent={Intent.NONE}/>
        <MenuItem
          onClick={this.prettifyAll}
          text="Format All"
          iconName="pt-icon-align-left"
          intent={Intent.NONE}/>
        <MenuItem
          onClick={this.prettifySelection}
          text="Format Selection"
          iconName="pt-icon-align-left"
          intent={Intent.NONE}/>
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
          value={this.state.code}
          onChange={value => this.updateCode(value)}
          options={this.state.options}/> {isOver && <div
          style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
          opacity: 0.5,
          backgroundColor: 'yellow'
        }}/>
}
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, editorTarget, collect)(View);
