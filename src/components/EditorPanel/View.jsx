/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T16:57:06+11:00
 */
/* eslint-disable react/prop-types */
import 'codemirror/lib/codemirror.css';
import {inject} from 'mobx-react';
import {featherClient} from '~/helpers/feathers';
import {autorun, mobx, reaction, action} from 'mobx';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

@inject('store')
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
      code: '// Welcome to DBEnvy'
    };

    const reaction1 = reaction( // eslint-disable-line
        () => this.props.store.executingEditorAll, executingEditorAll => { //eslint-disable-line
      if (this.props.store.activeEditorId == this.props.id && this.props.store.executingEditorAll == true) {
          console.log('Sending data to feathers id ', this.props.store.activeDropdownId), ': "', this.state.code, '".';
          // Send request to feathers client
          const service = featherClient()
          .service('/mongo-shells');
          service.timeout = 30000;
          service.update(this.props.store.activeDropdownId, {
            shellId: parseInt(this.props.store.activeDropdownId) + 1,
            commands: this.state.code
          });
          this.props.store.executingEditorAll = false;
      }
    });
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
    this.state.code = newCode;
  }

  render() {
    return (
      <div className="editorView">
        <CodeMirror autoSave ref="editor" // eslint-disable-line react/no-string-refs
          value={this.state.code} onChange={value => this.setState({code: value})} options={this.state.options} />
      </div>
    );
  }
}
