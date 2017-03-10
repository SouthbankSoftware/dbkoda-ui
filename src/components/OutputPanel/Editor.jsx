/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-10T13:42:00+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');

@inject(allStores => ({ output: allStores.store.output }) )
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
      theme: 'ambiance',
      typescript: true
    };

    return (
      <CodeMirror className="outputEditor"
        value={this.props.output.output}
        options={outputOptions}
      />
    );
  }
}
