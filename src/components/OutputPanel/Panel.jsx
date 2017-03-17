/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-17T13:49:39+11:00
 */

import React from 'react';
import {action, reaction} from 'mobx';
import {inject, observer} from 'mobx-react';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import {featherClient} from '../../helpers/feathers';

@inject(allStores => ({outputPanel: allStores.store.outputPanel}))
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    featherClient().addOutputListener(1, 2, this.outputAvaiable);
    featherClient().addOutputListener(3, 4, this.outputAvaiable);
    featherClient().addOutputListener(5, 6, this.outputAvaiable);
    featherClient().addOutputListener(7, 8, this.outputAvaiable);
    featherClient().addOutputListener(9, 10, this.outputAvaiable);
  }

  @action.bound
  outputAvaiable(output) {
    // Parse output for string 'Type "it" for more'
    this.props.outputPanel.output = this.props.outputPanel.output + '\n' + output.output + '\n'; // eslint-disable-line
    if (output.output.replace(/^\s+|\s+$/g, '').endsWith('Type "it" for more')) {
      console.log('can show more');
      this.props.outputPanel.cannotShowMore = false; // eslint-disable-line
    } else {
      console.log('cannot show more');
      this.props.outputPanel.cannotShowMore = true; // eslint-disable-line
    }
  }

  render() {
    return (
      <div className="pt-dark outputPanel">
        <OutputToolbar />
        <OutputEditor />
      </div>
    );
  }
}
