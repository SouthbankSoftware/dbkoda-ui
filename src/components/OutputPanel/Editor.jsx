/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-22T09:56:00+11:00
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { inject, observer } from 'mobx-react';
import {action,reaction} from 'mobx';
import CodeMirror from 'react-codemirror';
import {featherClient} from '../../helpers/feathers';
require('codemirror/mode/javascript/javascript');

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
    this.props.store.outputs.set(this.props.id, {
      output: '',
      cannotShowMore: true,
      showingMore: false
    });
    featherClient().addOutputListener(parseInt(props.id), parseInt(props.shellId), this.outputAvailable);
  }

  /**
   * Receives output from the server and parses show more text
   * @listens {featherClient} output- Listens for output from the feathers server
   * @param {Object} output - An object containing the output from shell commands
   */
  @action.bound
  outputAvailable(output) {
    // Parse output for string 'Type "it" for more'
    this.props.store.outputs.get(this.props.id).output = this.props.store.outputs.get(this.props.id).output + '\n' + output.output + '\n'; // eslint-disable-line
    if (output.output.replace(/^\s+|\s+$/g, '').includes('Type "it" for more')) {
      console.log('can show more');
      this.props.store.outputs.get(this.props.id).cannotShowMore = false; // eslint-disable-line
    } else {
      if(this.props.store.outputs.get(this.props.id).cannotShowMore && output.output.replace(/^\s+|\s+$/g, '').endsWith('dbenvy>')) {
        console.log('cannot show more');
        this.props.store.outputs.get(this.props.id).cannotShowMore = true; // eslint-disable-line
      }
    }
  }

  /**
   * Lifecycle method. Updates the scrolling view after render is completed
   */
  componentDidUpdate() {
    setTimeout(
      () => {
        const cm = this.refs.editor.getCodeMirror();
        cm.scrollIntoView({
          line: cm.lineCount() - 1,
          ch: 0,
        });
      },
      0,
    );
  }


  render() {
    const outputOptions = {
      mode: 'text/javascript',
      matchBrackets: true,
      json: true,
      jsonld: true,
      readOnly: true,
      smartIndent: true,
      theme: 'ambiance',
      typescript: true,
    };

    return (
      <div className="outputEditor">
        <CodeMirror
          autosave
          ref="editor"
          value={this.props.store.outputs.get(this.props.id).output}
          options={outputOptions}
        />
      </div>
    );
  }
}
