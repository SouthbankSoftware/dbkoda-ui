/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-17T10:25:03+11:00
*/

import React from 'react';
import ReactDOM from 'react-dom';
import {inject, observer} from 'mobx-react';
import {reaction} from 'mobx';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');

@inject(allStores => ({output: allStores.store.output}))
@observer
export default class Editor extends React.Component {
  componentDidUpdate() {
    setTimeout(() => {
      const cm = this
          .refs
          .editor
          .getCodeMirror();
      cm.scrollIntoView({
        line: cm.lineCount() - 1,
        ch: 0
      });
    }, 0);
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
      typescript: true
    };

    return (
      <div className="outputEditor">
        <CodeMirror
          autosave
          ref="editor"
          value={this.props.output.output}
          options={outputOptions} />
      </div>
    );
  }
}
