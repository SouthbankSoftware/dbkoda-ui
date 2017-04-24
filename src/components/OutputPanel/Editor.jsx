/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-21T09:19:49+10:00
*/

import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import CodeMirror from 'react-codemirror';
import {Broker, EventType} from '../../helpers/broker';
import OutputTerminal from './Terminal';

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
   *    @param {number} id - The id of the allocated connection
   *    @param {number} shellId - The shellId of the allocated connection
   *    @param {Object} store - The mobx global store object (injected)
   */
  constructor(props) {
    super(props);
    this.props.store.outputs.set(this.props.title, {
      id: this.props.id,
      shellId: this.props.shellId,
      title: this.props.title,
      output: '',
      cannotShowMore: true,
      showingMore: false,
      commandHistory: []
    });
  }

  componentDidMount() {
    const {props} = this;
    runInAction(() => {
      this.props.store.outputs.get(this.props.title).output = this.props.initialMsg;
    });
    Broker.on(EventType.createShellOutputEvent(props.id, props.shellId), this.outputAvailable);
  }

  /**
   * Lifecycle method. Updates the scrolling view after render is completed
   */
  componentDidUpdate() {
    setTimeout(
      () => {
        const cm = this.editor.getCodeMirror();
        cm.scrollIntoView({
          line: cm.lineCount() - 1,
          ch: 0,
        });
      },
      0,
    );
  }

  /**
   * Receives output from the server and parses show more text
   * @param {Object} output - An object containing the output from shell commands
   */
  @action.bound
  outputAvailable(output) {
    // Parse output for string 'Type "it" for more'
    let totalOutput =
      this.props.store.outputs.get(this.props.title).output +
      output.output; // eslint-disable-line
    let outputLines = totalOutput.split('\r');

    if (outputLines && outputLines.length >= 500) {
      outputLines = outputLines.slice(Math.max(outputLines.length - 500, 1));
      totalOutput = outputLines.join('\r');
    }
    this.props.store.outputs.get(this.props.title).output = totalOutput;
    if (output.output.replace(/^\s+|\s+$/g, '').includes('Type "it" for more')) {
      console.log('can show more');
      this.props.store.outputs.get(this.props.title).cannotShowMore = false; // eslint-disable-line
    } else if (this.props.store.outputs.get(this.props.title).cannotShowMore &&
              output.output.replace(/^\s+|\s+$/g, '').endsWith('dbenvy>')) {
      console.log('cannot show more');
      this.props.store.outputs.get(this.props.title).cannotShowMore = true; // eslint-disable-line
    }
  }

  render() {
    const outputOptions = {
       smartIndent: true,
        theme: 'ambiance',
        readOnly: true,
        lineWrapping: false,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
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
        mode: 'MongoScript'
    };
    return (
      <div className="outputEditor">
        <CodeMirror
          autosave
          ref={(c) => { this.editor = c; }}
          value={this.props.store.outputs.get(this.props.title).output}
          options={outputOptions}
          />
        <OutputTerminal id={this.props.id} shellId={this.props.shellId} title={this.props.title} />
      </div>
    );
  }
}
