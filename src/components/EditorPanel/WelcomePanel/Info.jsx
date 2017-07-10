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
* @Author: Michael Harrison <mike>
* @Date:   2017-04-11 13:24:35
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-11 13:24:39
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import {inject, observer} from 'mobx-react';

/**
 * Panel for wrapping the Info List.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Info extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div className="pt-dark infoPanel">
        <h3 className="optInBoldDBKoda">Getting Started...</h3>
        <div className="hotkeyItems">
          {this
            .state
            .tips
            .map((item) => {
              return (
                <div key={item.key} className="hotkeyItem">
                  <h5 className="hotkeyTitle">{item.title}</h5>
                  {item.content}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
