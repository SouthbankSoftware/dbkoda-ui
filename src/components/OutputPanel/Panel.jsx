/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-07T11:07:18+11:00
 */
import React from 'react';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {NewToaster} from '../common/Toaster';
import {Intent} from '@blueprintjs/core';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import {featherClient} from '../../helpers/feathers';

@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    featherClient().addOutputListener(1, 2, this.outputAvaiable.bind(this));
  }

  @action
  outputAvaiable(output) {
    this.props.store.output = this.props.store.output + '\n' + output.output;
  }

  showMore() {
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <div className="pt-dark outputPanel">
        <OutputToolbar showMore={this.showMore}/>
        <OutputEditor />
      </div>
    );
  }
}
