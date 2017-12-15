/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-14T12:22:05+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T11:07:37+11:00
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
import ErrorView from '#/common/ErrorView';
import LoadingView from '#/common/LoadingView';
import _ from 'lodash';
import './Widget.scss';

type Store = {
  widget: WidgetState,
};

type Props = {
  store: any | Store,
  api: *,
  id: UUID,
};

@inject(({ store: { widgets }, api }, { id }) => {
  const widget = widgets.get(id);

  return {
    store: {
      widget,
    },
    api,
  };
})
@observer
export default class PerformancePanel extends React.Component<Props> {
  static defaultProps = {
    store: null,
    api: null,
  };

  render() {
    const { store: { widget: { items, values, state, errorLevel, error } } } = this.props;
    const latestValue = values.length > 0 ? values[values.length - 1] : {};

    return (
      <div className="Widget">
        {state !== 'loaded' ? (
          state === 'loading' ? (
            <LoadingView />
          ) : (
            <ErrorView title={null} error={error} errorLevel={errorLevel} />
          )
        ) : (
          items.map(v => [
            <div key={`${v}-title`} className="title">
              {v}
            </div>,
            <div key={`${v}-value`} className="value">
              {_.get(latestValue, v, '?')}
            </div>,
          ])
        )}
      </div>
    );
  }
}
