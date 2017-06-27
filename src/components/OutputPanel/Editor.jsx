/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-09T16:08:25+10:00
*/

import React from 'react';
import {reaction, observable} from 'mobx';
import {inject, observer} from 'mobx-react';
import {action, runInAction} from 'mobx';
import CodeMirror from 'react-codemirror';
import 'codemirror/theme/material.css';
import {Broker, EventType} from '../../helpers/broker';
import OutputTerminal from './Terminal';
import {ProfileStatus} from '../common/Constants';

require('codemirror/mode/javascript/javascript');
require('#/common/MongoScript.js');

/**
 * Renders the window through which all output is shown for a specific editor
 * instance. Handles connection setup and view scrolling.
 */
@inject('store')
@observer
export default class Editor extends React.Component {
  /**
   * Constructor for the OutputEditor class
   * @param {Object} props - The properties passed to the component.
   * Contains:
   *    @param {number} id - The unique id of the allocated editor
   *    @param {number} connId - The id of the allocated connection
   *    @param {number} shellId - The shellId of the allocated connection
   *    @param {Object} store - The mobx global store object (injected)
   */
  constructor(props) {
    super(props);
    if (this.props.store.outputs.get(this.props.id)) {
      this
        .props
        .store
        .outputs
        .get(this.props.id)
        .cannotShowMore = true;
      this
        .props
        .store
        .outputs
        .get(this.props.id)
        .showingMore = false;
      if (this.props.id != 'Default' && this.props.store.outputs.get(this.props.id).output) {
        this
          .props
          .store
          .outputs
          .get(this.props.id)
          .output += globalString('output/editor/restoreSession');
      }
    } else {
      console.log(`create new output for ${this.props.id}`);
      this
        .props
        .store
        .outputs
        .set(this.props.id, observable({
          id: this.props.id,
          connId: this.props.connId,
          shellId: this.props.shellId,
          title: this.props.title,
          output: '',
          cannotShowMore: true,
          showingMore: false,
          commandHistory: []
        }));
    }

    /** Reaction to editor tab closing
     *
     *  @param
     *  @param
     */
    reaction(() => this.props.store.editorPanel.removingTabId, (removingTabId) => {
      if (removingTabId && this.props.id == removingTabId) {
        this
          .props
          .store
          .outputs
          .delete(this.props.id);
        Broker.removeListener(EventType.createShellOutputEvent(props.profileId, props.shellId), this.outputAvailable);
      }
    }, {name: 'reactionOutputEditorRemoveTab'});
  }

  componentDidMount() {
    const {props} = this;
    runInAction(() => {
      if (this.props.initialMsg && this.props.id != 'Default') {
        let tmp = this.props.initialMsg;
        console.log('TEST: ', this.props.initialMsg);
        tmp = tmp.replace(/^\n/gm, '');
        tmp = tmp.replace(/^\r/gm, '');
        tmp = tmp.replace(/^\r\n/gm, '');
        this
          .props
          .store
          .outputs
          .get(this.props.id)
          .output += tmp;
      }
    });
    Broker.on(EventType.createShellOutputEvent(props.profileId, props.shellId), this.outputAvailable);
    Broker.on(EventType.createShellReconnectEvent(props.profileId, props.shellId), this.onReconnect);
  }

  componentWillReceiveProps(nextProps) {
    const profileId = nextProps.profileId ? nextProps.profileId : this.props.profileId;
    const shellId = nextProps.shellId ? nextProps.shellId : this.props.shellId;
    if (this.props.shellId !== shellId || this.props.profileId !== profileId) {
      // need to register the output listener
      Broker.removeListener(EventType.createShellOutputEvent(this.props.profileId, this.props.shellId), this.outputAvailable);
      Broker.removeListener(EventType.createShellReconnectEvent(this.props.profileId, this.props.shellId), this.onReconnect);
      Broker.on(EventType.createShellOutputEvent(profileId, shellId), this.outputAvailable);
      Broker.on(EventType.createShellReconnectEvent(profileId, shellId), this.onReconnect);
    }
  }

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action handleDrop(item) { //eslint-disable-line
    this.props.store.dragItem.item = item;
    console.log(this.props.store.dragItem.dragDropTerminal);
    if (!this.props.store.dragItem.dragDropTerminal) {
      this.props.store.dragItem.dragDropTerminal = true;
    } else {
      this.props.store.dragItem.dragDropTerminal = false;
      const setDragDropTrueLater = () => { // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDropTerminal = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  /**
   * Lifecycle method. Updates the scrolling view after render is completed
   */
  componentDidUpdate() {
    setTimeout(() => {
      if (this.editor) {
        const cm = this
          .editor
          .getCodeMirror();
        cm.scrollIntoView({
          line: cm.lineCount() - 1,
          ch: 0
        });
      }
    }, 0);
  }

  componentWillUnmount() {
    Broker.removeListener(EventType.createShellOutputEvent(this.props.profileId, this.props.shellId), this.outputAvailable);
    Broker.removeListener(EventType.createShellReconnectEvent(this.props.profileId, this.props.shellId), this.onReconnect);
  }

  @action.bound
  onReconnect(output) {
    console.log('got reconnect output ', output);
    const combineOutput = output
      .output
      .join('\r');
    const totalOutput = this
      .props
      .store
      .outputs
      .get(this.props.id)
      .output + combineOutput;
    this
      .props
      .store
      .outputs
      .get(this.props.id)
      .output = totalOutput;
  }

  /**
   * Receives output from the server and parses show more text
   * @param {Object} output - An object containing the output from shell commands
   */
  @action.bound
  outputAvailable(output) {
    // Parse output for string 'Type "it" for more'
    const totalOutput = this
      .props
      .store
      .outputs
      .get(this.props.id)
      .output + output.output; // eslint-disable-line
    const profile = this
      .props
      .store
      .profiles
      .get(output.id);
    if (profile && profile.status !== ProfileStatus.OPEN) {
      // the connection has been closed.
      return;
    }
    this
      .props
      .store
      .outputs
      .get(this.props.id)
      .output = totalOutput;
    if (output && output.output && output.output.replace(/^\s+|\s+$/g, '').includes('Type "it" for more')) {
      console.log('can show more');
      if (this
        .props
        .store
        .outputs
        .get(this.props.id)) {
          this
            .props
            .store
            .outputs
            .get(this.props.id)
            .cannotShowMore = false;
        }
    } else if (this.props.store.outputs.get(this.props.id) && this.props.store.outputs.get(this.props.id).cannotShowMore && output && output.output && output.output.replace(/^\s+|\s+$/g, '').endsWith('dbkoda>')) {
      console.log('cannot show more');
      this
        .props
        .store
        .outputs
        .get(this.props.id)
        .cannotShowMore = true;
    }
  }

  render() {
    const outputOptions = {
      smartIndent: true,
      theme: 'material',
      readOnly: true,
      lineWrapping: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      foldOptions: {
        widget: '...'
      },
      foldGutter: true,
      gutters: [
        'CodeMirror-linenumbers', 'CodeMirror-foldgutter'
      ],
      keyMap: 'sublime',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Q': function (cm) {
          cm.foldCode(cm.getCursor());
        }
      },
      mode: {
        name: 'javascript',
        json: 'true'
      }
    };
    if (this.props.store.editorPanel.removingTabId == this.props.id || !this.props.store.outputs.get(this.props.id)) {
      return <div className="outputEditor" />;
    }
    return (
      <div className="outputEditor">
        <CodeMirror
          autosave
          ref={(c) => {
          this.editor = c;
        }}
          value={this
          .props
          .store
          .outputs
          .get(this.props.id)
          .output}
          options={outputOptions} />
        <OutputTerminal
          id={this.props.id}
          profileId={this.props.profileId}
          shellId={this.props.shellId}
          title={this.props.title}
          onDrop={item => this.handleDrop(item)} />
      </div>
    );
  }
}
