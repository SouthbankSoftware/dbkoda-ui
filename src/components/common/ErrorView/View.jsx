/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-10-09T15:41:06+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-09T17:35:48+11:00
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
import ErrorIcon from '~/styles/icons/error-icon.svg';
import './View.scss';

type Props = {
  title?: string,
  error: string,
};

export default class ErrorView extends React.PureComponent<Props> {
  static defaultProps = {
    title: 'Oh Snap!',
  };

  render() {
    const { title, error } = this.props;

    return (
      <div className="ErrorView">
        <ErrorIcon className="icon" />
        <p className="title">{title}</p>
        <p className="message">{error}</p>
      </div>
    );
  }
}
