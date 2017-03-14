/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   Mike
* @Last modified time: 2017-03-14 15:55:49
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {NewToaster} from '../common/Toaster';
import {Intent, Button} from '@blueprintjs/core';

@inject(allStores => ({output: allStores.store.output}))
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  @action.bound
  clearOutput() {
    this.props.output.output = '';
  }

  @action.bound
  showMore() {
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output {this.props.blah}</div>
          <Button
            className="pt-button pt-icon-disable pt-intent-warning clearOutputBtn"
            onClick={this.clearOutput}
            title="Clear Output (Shortcut+Keys)" />
          <Button
            className="pt-button showMoreBtn pt-intent-primary"
            onClick={this.showMore}
            disabled={this.props.output.cannotShowMore}
            title="Show More (Shortcut+Keys)">
            Show More
          </Button>
        </div>
        <div className="pt-navbar-group pt-right-align" />
      </nav>
    );
  }
}
