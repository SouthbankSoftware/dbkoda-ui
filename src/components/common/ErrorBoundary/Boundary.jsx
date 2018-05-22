/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-08T10:39:54+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-10T15:22:30+10:00
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

import * as React from 'react';
// import { Broker, EventType } from '~/helpers/broker';
import './Boundary.scss';

type Props = {
  emitCrashEvent: boolean,
  children: *
};

type State = {
  error: *,
  errorInfo: *
};

export default class ErrorBoundary extends React.Component<Props, State> {
  static props = {
    emitCrashEvent: false
  };

  constructor(props: Props) {
    super(props);

    this.state = { error: null, errorInfo: null };
  }

  // componentDidCatch(error: *, errorInfo: *) {
  //   this.setState({ error, errorInfo });
  //
  //   // react will use `l.error` to print out this error so we don't have to double log it
  //
  //   this.props.emitCrashEvent && Broker.emit(EventType.APP_CRASHED);
  // }

  render() {
    if (this.state.error) {
      // Error path
      return (
        <div className="ErrorBoundary">
          <h2>Oh Snap! App crashed</h2>
          <p>
            {this.state.error && this.state.error.toString()}
            <br />
            {
              // $FlowFixMe
              this.state.errorInfo.componentStack
            }
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
