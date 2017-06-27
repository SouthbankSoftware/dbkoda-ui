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
 * @Last modified time: 2017-06-13T13:52:31+10:00
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
    this.renderDetails(this.props.editor);
  }
  componentWillReceiveProps(nextProps) {
    console.log('nextProps.isVisible:', nextProps.isVisible);
    if (!nextProps.isVisible) {
      this.showView(nextProps.isVisible);
    }
    if ((this.props.editor != nextProps.editor || this.bDetView == false) && nextProps.isVisible) {
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
    console.log('Details Panel Render:', this);
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
