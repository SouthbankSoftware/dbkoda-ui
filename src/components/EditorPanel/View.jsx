/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T16:57:06+11:00
 */

import 'codemirror/lib/codemirror.css';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

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
    const options = {
      mode: 'text/javascript',
      matchBrackets: true,
      json: true,
      jsonld: true,
      smartIndent: true,
      theme: 'ambiance',
      typescript: true,
      lineNumbers: true
    };

    return (
      <div className="editorView">
        <CodeMirror autoSave ref="editor" // eslint-disable-line react/no-string-refs
          value={this.state.code} onChange={value => this.setState({code: value})} options={options} />
      </div>
    );
  }
}
