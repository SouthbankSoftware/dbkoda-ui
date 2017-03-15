/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 11:19:08
*/

/* eslint-disable react/prop-types */
import 'codemirror/lib/codemirror.css';
import {inject} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {action, reaction} from 'mobx';
import {ContextMenuTarget, Menu, MenuItem, Intent} from '@blueprintjs/core';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

@inject('store')
@ContextMenuTarget
export default class View extends React.Component {
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
            '//\n' +
            '// You can also right click on the Editor for a context Menu.\n' +
            '// If you have too many tabs, use the filter box to search for a specific alias.\n' +
            '//////////////////////////////////\n'

    };

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

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    const cm = this // eslint-disable-line react/no-string-refs
      .refs
      .editor
      .getCodeMirror();
    cm.refresh();
  }

  updateCode(newCode) {
    this.setState({code: newCode});
  }

  @action executeLine() {
    this.props.store.editorPanel.executingEditorLines = true;
  }

  @action executeAll() {
    this.props.store.editorPanel.executingEditorAll = true;
  }

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

  render() {
    return (
      <div className="editorView">
        <CodeMirror autoSave ref="editor" // eslint-disable-line react/no-string-refs
          value={this.state.code} onChange={value => this.updateCode(value)} options={this.state.options} />
      </div>
    );
  }
}
