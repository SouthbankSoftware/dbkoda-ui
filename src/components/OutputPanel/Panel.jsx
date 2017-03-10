/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-10T13:19:28+11:00
 */

import React from 'react';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { NewToaster } from '../common/Toaster';
import { Intent } from '@blueprintjs/core';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import { featherClient } from '../../helpers/feathers';

@inject(allStores => ({ output: allStores.store.output }))
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    featherClient().addOutputListener(1, 2, this.outputAvaiable);
    featherClient().addOutputListener(3, 4, this.outputAvaiable);
    featherClient().addOutputListener(5, 6, this.outputAvaiable);
  }

  @action.bound
  outputAvaiable(output) {
    this.props.output.output = this.props.output.output + '\n' + output.output;
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
