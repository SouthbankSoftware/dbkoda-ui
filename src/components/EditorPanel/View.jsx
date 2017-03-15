/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T16:00:47+11:00
*/

/* eslint-disable react/prop-types */
import 'codemirror/lib/codemirror.css';
import {inject} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {reaction} from 'mobx';

import { DropTarget } from 'react-dnd';
import { DragItemTypes} from '#/common/Constants.js';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

const editorTarget = {
  drop(props, monitor) {
    const item = monitor.getItem();
    props.onDrop(item);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

@inject('store')
class View extends React.Component {
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
      code: '// Welcome to DBEnvy'
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
        const cm = this.refs.editor.getCodeMirror(); // eslint-disable-line
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

    const reactionToDragDrop = reaction(  // eslint-disable-line
      () => this.props.store.dragItem.dragDrop, dragDrop => {   // eslint-disable-line
        if (this.props.store.dragItem.dragDrop && this.props.store.dragItem.item !== null) {
          const item = this.props.store.dragItem.item;
          this.setState({code: item.label});
          this.props.store.dragItem.dragDrop = false;
        }
      }
    );
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

  render() {
    const { connectDropTarget, isOver } = this.props;
    return connectDropTarget(
      <div className="editorView">
        <CodeMirror autoSave ref="editor" // eslint-disable-line react/no-string-refs
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
