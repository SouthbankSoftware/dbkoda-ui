import React from 'react';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
        value={this.props.store.output}
        options={outputOptions}
      />
    );
  }
}
