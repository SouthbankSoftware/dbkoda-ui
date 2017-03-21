/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-22T08:38:29+11:00
*/

/* eslint-disable react/no-string-refs */
import 'codemirror/lib/codemirror.css';
import {inject, PropTypes} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {action, reaction} from 'mobx';
import {ContextMenuTarget, Menu, MenuItem, Intent} from '@blueprintjs/core';

import { DropTarget } from 'react-dnd';
import { DragItemTypes} from '#/common/Constants.js';
import CodeGeneration from '#/common/CodeGeneration.js';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

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
    store: PropTypes.observableObject.isRequired,
    id: React.PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      options: {
        mode: 'text/javascript',
        matchBrackets: true,
        json: true,
        jsonld: true,
        smartIndent: true,
        theme: 'ambiance',
        typescript: true,
        lineNumbers: true
      },
      code: '//////////////////////////////////\n' +
            '// Welcome to DBEnvy!\n' +
            '//\n' +
            '// Try some of our Hotkeys:\n' +
            '// Note: Currently you cannot have the editor focused while using hotkeys!\n' +
            '// Shift + n : New Editor\n' +
            '// Shift + e : Execute Selected\n' +
            '// Shift + a : Execute All\n' +
            '// Shift + c : Clean Output\n' +
            '// Shift + x : Save Output\n' +
            '// Shift + m : Show More Output (If Available)\n' +
            '//\n' +
            '// You can also right click on the Editor for a context Menu.\n' +
            '// If you have too many tabs, use the filter box to search for a specific alias.\n' +
            '//////////////////////////////////\n'

    };

    /**
     * Reaction function for when a change occurs on the editorPanel.executingEditorAll state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToExecuteAll = reaction( // eslint-disable-line
        () => this.props.store.editorPanel.executingEditorAll, executingEditorAll => { //eslint-disable-line
      console.log('Execute All');
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.editorPanel.executingEditorAll == true) {
        console.log('Sending data to feathers id ', this.props.store.editorPanel.activeDropdownId, ': "', this.state.code, '".');
        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(this.props.store.editorPanel.activeDropdownId, {
          shellId: parseInt(this.props.store.editorPanel.activeDropdownId) + 1, // eslint-disable-line
          commands: this.state.code
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
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.editorPanel.executingEditorLines == true) {
        // Determine code to send.
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
        console.log('Sending data to feathers id ', this.props.store.editorPanel.activeDropdownId, ': "', content, '".');
        // Send request to feathers client
        const service = featherClient().service('/mongo-shells');
        service.timeout = 30000;
        service.update(this.props.store.editorPanel.activeDropdownId, {
          shellId: parseInt(this.props.store.editorPanel.activeDropdownId) + 1, // eslint-disable-line
          commands: content
        });
        this.props.store.editorPanel.executingEditorLines = false;
      }
    });

      /**
     * Reaction function for when a change occurs on the dragItem.drapDrop state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToDragDrop = reaction(  // eslint-disable-line
      () => this.props.store.dragItem.dragDrop, dragDrop => {   // eslint-disable-line
        if (this.props.store.dragItem.dragDrop && this.props.store.dragItem.item !== null) {
          const item = this.props.store.dragItem.item;
          // this.setState({code: item.label});
          this.insertAtCursor(CodeGeneration.getCodeForTreeNode(item));
          this.props.store.dragItem.dragDrop = false;
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
  }

  /**
   * Component Did mount function, causes CodeMirror to refresh to ensure UI is scaled properly.
   */
  componentDidMount() {
    this.refresh();
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
   * Update the local code state.
   * @param {String} - New code to be entered into the editor.
   */
  updateCode(newCode) {
    this.setState({code: newCode});
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
          intent={Intent.NONE} />
        <MenuItem
          onClick={this.executeAll}
          text="Execute All"
          iconName="pt-icon-double-chevron-right"
          intent={Intent.NONE} />
        <MenuItem
          onClick={this.refresh}
          text="Refresh"
          iconName="pt-icon-refresh"
          intent={Intent.NONE} />
      </Menu>
    );
  }

  /**
   * Render method for the component.
   */
  render() {
    const { connectDropTarget, isOver } = this.props; // eslint-disable-line
    return connectDropTarget(
      <div className="editorView">
        <CodeMirror autoSave ref="editor"
          value={this.state.code} onChange={value => this.updateCode(value)} options={this.state.options} />
        {isOver &&
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'yellow',
          }} />
        }
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, editorTarget, collect)(View);
