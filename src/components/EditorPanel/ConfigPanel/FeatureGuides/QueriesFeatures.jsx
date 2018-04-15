/*
@flow
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
 *  * @Author: mike
 *    @Date:   2018-04-13T13:30:00+11:00
 *    @Email:  mike@southbanksoftware.com
 *    @Last modified by:   Mike
 *    @Last modified time: 2018-04-13T13:30:00+11:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

type Props = {};
type State = {};

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class QueriesFeatures extends React.Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div className="queriesFeaturesWrapper"> Queries Guide</div>;
  }
}
