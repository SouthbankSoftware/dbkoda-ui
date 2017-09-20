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
 *
 *
 * @Author: mike
 * @Date:   2017-09-20 10:35:04
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-09-20 10:35:00
 */

/* eslint no-prototype-builtins:warn */

import React from 'react';
import { AnchorButton, Intent } from '@blueprintjs/core';
import './style.scss';

export default class Panel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      debug: false,
    };
  }

  onClickFeedback() {}

  onClickSupportBundle() {}

  render() {
    return (
      <div className="statusPanel">
        <div className="float_left" />
        <div className="float_right">
          <AnchorButton
            className="feedbackButton"
            intent={Intent.NONE}
            text={globalString('status_bar/feedback/button_title')}
            onClick={this.onClickFeedback}
          />
          <AnchorButton
            className="lodgeBugButton"
            intent={Intent.NONE}
            text={globalString('status_bar/support_bundle/button_title')}
            onClick={this.onClickSupportBundle}
          />
        </div>
      </div>
    );
  }
}
