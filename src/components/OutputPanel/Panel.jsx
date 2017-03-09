/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-07T11:07:18+11:00
 */
import React from 'react';
import {NewToaster} from '../common/Toaster';
import {Intent} from '@blueprintjs/core';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import {featherClient} from '../../helpers/feathers';

export default class Panel extends React.Component {
  constructor() {
    super();
    this.clearOutput = this.clearOutput.bind(this);
    this.updateOutput = this.updateOutput.bind(this);
    this.state = {
      output: "// Output goes here!"
    };
    featherClient().addOutputListener(1, 2, this.outputAvaiable.bind(this));
  }

  outputAvaiable(output) {
    this.setState({output: this.state.output+'\n'+output.output});
  }

  clearOutput() {
    this.updateOutput('');
  }

  updateOutput(newOutput) {
    this.setState({output: newOutput});
  }

  showMore() {
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <div className="pt-dark outputPanel">
        <OutputToolbar clearOutput={this.clearOutput} showMore={this.showMore}/>
        <OutputEditor value={this.state.output}/>
      </div>
    );
  }
}
