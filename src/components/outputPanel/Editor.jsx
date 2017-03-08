import React from 'react';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');

export default class Editor extends React.Component {
  render(props) {
    let outputOptions = {
      mode: 'text/javascript',
      matchBrackets: true,
      json: true,
      jsonld: true,
      readOnly: true,
      smartIndent: true,
      theme: 'ambiance'
    };

    return (
      <CodeMirror
        value={this.props.value}
        options={outputOptions}
      />
    );
  }
}
