import '../../node_modules/codemirror/lib/codemirror.css';

const React = require('react');
const CodeMirror = require('react-codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/autorefresh.js');

export default class EditorView extends React.Component {
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
    const cm = this
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
      <div>
        <CodeMirror
          autoSave
          ref="editor"
          value={this.state.code}
          onChange={value => this.setState({code: value})}
          options={options} />
      </div>
    );
  }
}
