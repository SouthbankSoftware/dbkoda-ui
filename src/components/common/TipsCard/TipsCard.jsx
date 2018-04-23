/**
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
import {Card, Button} from '@blueprintjs/core';

import './style.scss';

export default class TipsCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIdx: 0,
      tips: [],
    };
  }

  componentDidMount() {
    this.setState({tips: this.props.tips});
  }

  onNextTip = () => {
    const nextIdx = this.state.selectedIdx + 1;
    this.setState({
      selectedIdx: nextIdx,
    });
  }

  onPrevTip = () => {
    const prevIdx = this.state.selectedIdx - 1;
    this.setState({
      selectedIdx: prevIdx,
    });
  }

  render() {
    return (
      <div className="tips-field-container">
        <div className="pt-form-content">
          <h5 className="tips-heading tips-title">Tips</h5>
          <Card className="tips-card-content" interactive={false} elevation={0}>
            <p>
              {this.state.tips.length > 0
                ? this.state.tips[this.state.selectedIdx].content
                : 'No tips Available'}
            </p>
          </Card>
          <div className="tip-cards-button-panel">
            <Button
              className={
                (this.state.selectedIdx > 0 ? 'active' : 'inactive') +
                ' pt-button pt-intent-primary pt-icon-chevron-left tips-card-btn'
              }
              onClick={this.onPrevTip}
              disabled={this.state.selectedIdx <= 0}
            />
            <Button
              className={
                (this.state.selectedIdx < this.state.tips.length - 1
                  ? 'active'
                  : 'inactive') +
                ' pt-button pt-intent-primary pt-icon-chevron-right tips-card-btn'
              }
              onClick={this.onNextTip}
              disabled={this.state.selectedIdx >= this.state.tips.length - 1}
            />
          </div>
        </div>
      </div>
    );
  }
}
