/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T13:17:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T20:32:57+11:00
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

import { action, observable, type IObservableArray } from 'mobx';
import uuid from 'uuid/v1';
import autobind from 'autobind-decorator';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
import _ from 'lodash';
import type { Alarm } from '#/PerformancePanel/Widgets/Widget/AlarmView';

export const widgetErrorLevels = {
  warn: 'warn',
  error: 'error'
};

export type WidgetValue = {
  timestamp: number,
  value: { [string]: any }
};
export type WidgetErrorLevel = $Keys<typeof widgetErrorLevels>;
export type WidgetStateBuffer = {
  values: Array<WidgetValue>,
  alarms?: Array<Alarm>
};
export type WidgetState = {
  id: UUID,
  profileId: UUID,
  type: string,
  items: string[],
  values: IObservableArray<WidgetValue>,
  state: ComponentState,
  errorLevel: ?WidgetErrorLevel,
  error: ?string,
  buffer: ?WidgetStateBuffer,
  name?: string,
  description?: string,
  unit?: any,
  showVertical?: boolean,
  chartTitle?: string,
  panelTitle?: string,
  title?: string,
  rowText?: string,
  showVerticalRule?: boolean,
  showVerticalRuleLeft?: boolean,
  showHorizontalRule?: boolean,
  showLegend?: *,
  displayName?: *,
  widgetItemKeys?: *,
  widgetDisplayNames?: *,
  showRunQueue?: *,
  useHighWaterMark?: *,
  showAlarms?: *,
  alarms?: IObservableArray<Alarm>,
  infoWidget?: boolean,
  colorList?: *,
  detailAction?: Object,
  chartAlign?: string
};

export default class WidgetApi {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
  }

  _createErrorHandler = (profileId: UUID, id: UUID) => {
    // eslint-disable-next-line arrow-parens
    return action(err => {
      const performancePanel = this.store.performancePanels.get(profileId);
      const { widgets } = performancePanel;
      const widget = widgets.get(id);

      if (widget) {
        _.assign(widget, {
          state: 'error',
          errorLevel: widgetErrorLevels.error,
          error: err.message
        });
      }
    });
  };

  @action.bound
  addWidget(
    profileId: UUID,
    items: string[],
    type: string,
    extraState: ?{ id?: string } = null
  ): UUID {
    const performancePanel = this.store.performancePanels.get(profileId);
    const { widgets } = performancePanel;

    const id = (extraState && extraState.id) || uuid();

    const widget: WidgetState = {
      id,
      profileId,
      type,
      items,
      // $FlowFixMe
      values: observable.array(null, { deep: false }),
      state: 'loading',
      errorLevel: null,
      error: null,
      buffer: null,
      ...extraState
    };

    // $FlowFixMe
    widget.showAlarms && (widget.alarms = observable.array(null, { deep: false }));

    // $FlowFixMe
    widgets.set(id, observable.object(widget, null, { deep: false }));

    return id;
  }

  @autobind
  removeWidget(profileId: UUID, id: UUID) {
    const performancePanel = this.store.performancePanels.get(profileId);
    const { widgets } = performancePanel;

    const widget = widgets.get(id);

    if (widget) {
      const { profileId, items } = widget;

      featherClient()
        .service('stats')
        .remove(profileId, {
          query: {
            items
          }
        })
        .then(
          action(() => {
            widgets.delete(id);
          })
        )
        .catch(this._createErrorHandler(profileId, id));
    }
  }
}
