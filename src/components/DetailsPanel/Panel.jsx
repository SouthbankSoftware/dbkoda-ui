/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T09:11:48+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T16:29:16+10:00
 */

import React from 'react';

import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { DrawerPanes } from '#/common/Constants';
import View from './View';
import DetailsBuilder from './DetailsBuilder';

@inject('store')
@observer
export default class DetailsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editor: this.props.editor };
  }
  componentWillMount() {
    this.renderDetails(this.props.editor);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.editor != nextProps.editor || this.bDetView == false) {
      this.renderDetails(nextProps.editor);
    }
  }

  detailsPromise;
  detailsViewInfo;
  @observable msg = 'Loading Details...';
  @observable bDetView = false;
  @action showView(value) {
    this.bDetView = value;
  }
  @action updateMsg(value) {
    this.msg = value;
  }
  @action.bound
  close(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.store.detailsPanel.activeEditorId = '';
  }
  renderDetails(editor) {
    const { detailsPanel } = this.props.store;
    const profile = this.props.store.profileList.selectedProfile;
    this.showView(false);
    this.updateMsg('Loading Details...');
    if (profile && profile.status == 'OPEN') {
      const detailsBuilder = new DetailsBuilder();
      this.detailsPromise = detailsBuilder.createDetailsView(
        detailsPanel,
        editor
      );
      this.detailsPromise
        .then((res) => {
          console.log('Details View Info: ', res);
          this.detailsViewInfo = res;
          this.showView(true);
        })
        .catch((reason) => {
          this.updateMsg(reason);
        });
    } else {
      this.updateMsg('Please reconnect profile to view the details.');
    }
  }
  render() {
    console.log(this);
    return (
      <div className="details-view">
        {this.bDetView &&
          <View
            title={this.detailsViewInfo.title}
            viewInfo={this.detailsViewInfo}
          />}
        {!this.bDetView &&
          <div>
            <div className="tree-msg-div">
              <span>{this.msg}</span>
            </div>
          </div>}
      </div>
    );
  }
}
