/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-07T10:53:19+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-07T11:07:18+11:00
*/

import React from 'react';
import MobX from 'mobx';
import {NewToaster} from '../Toaster';
import {Intent} from '@blueprintjs/core';

import OutputToolbar from './OutputToolbar';
import OutputEditor from './OutputEditor';

export default class OutputPanel extends React.Component {
  constructor() {
    super();
    this.clearOutput = this.clearOutput.bind(this);
    this.updateOutput = this.updateOutput.bind(this);
    this.state = {
      output: "// Output goes here!"
    };
  }

  clearOutput() {
    this.updateOutput('');
  }

  updateOutput(newOutput) {
    this.setState({ output: newOutput });
  }

  showMore() {
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <div className="pt-dark outputPanel">
        <OutputToolbar clearOutput={this.clearOutput} showMore={this.showMore} />
        <OutputEditor value={this.state.output} />
      </div>
    );
  }
}
