/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T09:11:48+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-10T14:02:28+10:00
 */

import React from 'react';

import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
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
    if (this.props.isVisible) {
      this.renderDetails(this.props.editor);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.isVisible) {
      this.showView(nextProps.isVisible);
    }
    if (
      (this.props.editor != nextProps.editor || this.bDetView == false) &&
      nextProps.isVisible
    ) {
      this.renderDetails(nextProps.editor);
    }
  }

  detailsPromise;
  detailsViewInfo;
  @observable msg = 'Loading Details...';
  @observable bLoading = false;
  @observable bDetView = false;
  @action showView(value) {
    this.bDetView = value;
  }
  @action updateMsg(value) {
    this.msg = value;
    if (value === 'Loading Details...') {
      this.bLoading = true;
    } else {
      this.bLoading = false;
    }
  }
  @action.bound close(e) {
    if (e) {
      e.preventDefault();
    }
  }
  renderDetails(editor) {
    const { detailsPanel } = this.props.store;
    const profile = this.props.store.profileList.selectedProfile;
    this.showView(false);
    this.updateMsg('Loading Details...');
    if (profile && profile.status == 'OPEN' && editor && editor.detailsView) {
      if (
        detailsPanel.lastTreeAction &&
        detailsPanel.lastTreeAction == editor.detailsView.treeAction &&
        detailsPanel.lastTreeNode &&
        detailsPanel.lastTreeNode == editor.detailsView.treeNode
      ) {
        this.detailsViewInfo = detailsPanel.detailsViewInfo;
        this.showView(true);
      } else {
        const detailsBuilder = new DetailsBuilder();
        this.detailsPromise = detailsBuilder.createDetailsView(
          detailsPanel,
          editor
        );
        this.detailsPromise
          .then((res) => {
            this.detailsViewInfo = res;
            this.showView(true);
          })
          .catch((reason) => {
            this.updateMsg(reason);
          });
      }
    } else {
      this.updateMsg('Please reconnect profile to view details.');
    }
  }
  render() {
    return (
      <div className="details-view">
        {this.bDetView &&
          <View
            title={this.detailsViewInfo.title}
            viewInfo={this.detailsViewInfo}
          />}
        {!this.bDetView &&
          <div>
            <div className="details-msg-div">
              <div className="messageWrapper">
                {this.bLoading &&
                  <div className="iconWrapper">
                    <div className="loader" />
                  </div>}
                {!this.bLoading &&
                  <span className="failureText">
                    {this.msg}
                  </span>}
              </div>
            </div>
          </div>}
      </div>
    );
  }
}
