/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-01-31T16:32:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-01T14:47:21+11:00
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
import { inject, observer } from 'mobx-react';
import type { WidgetState } from '~/api/Widget';
import Widget from './Widget';
import './ArrowWidget.scss';

type Store = {
  widget: WidgetState
};

type Props = {
  store: any | Store,
  api: *,
  widget: WidgetState
};

@inject(({ api }, { widget }) => {
  return {
    store: {
      widget
    },
    api
  };
})
@observer
export default class ArrowWidget extends React.Component<Props> {
  static defaultProps = {
    store: null,
    api: null
  };

  render() {
    const { widget } = this.props;

    return <Widget widget={widget}>test test test</Widget>;
  }
}
