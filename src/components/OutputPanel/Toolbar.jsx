/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-10T15:23:40+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {NewToaster} from '../common/Toaster';
import {Intent} from '@blueprintjs/core';

@inject(allStores => ({ output: allStores.store.output }) )
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.renderShowMoreBtn = this.renderShowMoreBtn.bind(this);
  }

  @action.bound
  clearOutput() {
    this.props.output.output = '';
  }

  @action.bound
  showMore() {
    NewToaster.show({
      message: 'Sorry, not yet implemented!',
      intent: Intent.DANGER,
      iconName: 'pt-icon-thumbs-down'
    });
  }

  renderShowMoreBtn() {
    if (this.props.output.canShowMore) {
      return (<button
        className="pt-button showMoreBtn"
        onClick={this.showMore}
        title="Show More (Shortcut+Keys)">
        Show More
      </button>);
    }
    else {
      return (<button
        className="pt-button pt-disabled showMoreBtn"
        onClick={this.showMore}
        title="Show More (Shortcut+Keys)"
        disabled="disabled">
        Show More
      </button>);
    }
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier outputToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output {this.props.blah}</div>
          <button
            className="pt-button pt-icon-disable clearOutputBtn"
            onClick={this.clearOutput}
            title="Clear Output (Shortcut+Keys)"
          />
        {this.renderShowMoreBtn()}
        </div>
        <div className="pt-navbar-group pt-right-align"></div>
      </nav>
    );
  }
}
