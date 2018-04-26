/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-25T15:46:41+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-31T09:35:53+11:00
 *
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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Button } from '@blueprintjs/core';
import autobind from 'autobind-decorator';

import 'react-select/dist/react-select.css';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class TipsField extends React.Component {
  constructor(props) {
    super(props);
    const { tips } = this.props;
    this.state = {
      tips,
      selectedIdx: 0,
      prevEnabled: false,
      nextEnabled: tips.length > 0
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.tips) {
      this.setState({
        tips: nextProps.tips,
        selectedIdx: 0,
        prevEnabled: false,
        nextEnabled: nextProps.tips.length > 0
      });
    }
  }

  @autobind
  onNextTip() {
    const nextIdx = this.state.selectedIdx + 1;
    this.setState({
      selectedIdx: nextIdx,
      prevEnabled: true,
      nextEnabled: nextIdx < this.state.tips.length - 1
    });
  }

  @autobind
  onPrevTip() {
    const prevIdx = this.state.selectedIdx - 1;
    this.setState({
      selectedIdx: prevIdx,
      nextEnabled: true,
      prevEnabled: prevIdx !== 0
    });
  }

  render() {
    return (
      <div className="tips-field">
        <div className="pt-form-content">
          <h5 className="tips-heading">Tips</h5>
          <Card interactive={false} elevation={0}>
            <p>
              {this.state.tips.length > 0
                ? this.state.tips[this.state.selectedIdx]
                : 'No tips Available'}
            </p>
          </Card>
          <div className="profile-button-panel">
            <Button
              className={
                (this.state.prevEnabled ? 'active' : 'inactive') +
                ' pt-button pt-intent-primary pt-icon-chevron-left'
              }
              onClick={this.onPrevTip}
              disabled={!this.state.prevEnabled}
            />
            <Button
              className={
                (this.state.nextEnabled ? 'active' : 'inactive') +
                ' pt-button pt-intent-primary pt-icon-chevron-right'
              }
              onClick={this.onNextTip}
              disabled={!this.state.nextEnabled}
            />
          </div>
        </div>
      </div>
    );
  }
}
