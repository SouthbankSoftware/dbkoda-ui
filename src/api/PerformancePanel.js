/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:48:11+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-02T11:27:41+11:00
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

import { action, observable } from 'mobx';
import type { ObservableMap } from 'mobx';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
import type { WidgetState } from './Widget';

export type LayoutState = {
  x: number,
  y: number,
  w: number,
  h: number,
  i: UUID,
  static: boolean,
  background: string,
  gridElementStyle: Object,
  widgetStyle: Object
}

export type PerformancePanelState = {
  profileId: UUID,
  widgets: ObservableMap<WidgetState>,
  layouts: ObservableMap<LayoutState>,
};

export default class PerformancePanelApi {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
  }

  @action.bound
  addPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;

    const performancePanel: PerformancePanelState = {
      profileId,
      widgets: observable.shallowMap(),
      layouts: observable.shallowMap()
    };

    performancePanels.set(profileId, performancePanel);
  }

  @action.bound
  removePerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;

    performancePanels.delete(profileId);
  }

  @action.bound
  openPerformancePanel(profileId: UUID) {
    const { performancePanels } = this.store;
    let performancePanel = performancePanels.get(profileId);

    if (!performancePanel) {
      this.addPerformancePanel(profileId);
      performancePanel = performancePanels.get(profileId);
    }

    this.store.performancePanel = performancePanel;
  }

  @action.bound
  closePerformancePanel(profileId: UUID, destroy: boolean = false) {
    if (destroy) {
      const { performancePanels } = this.store;

      if (performancePanels.has(profileId)) {
        featherClient()
          .statsService.remove(profileId)
          .catch(console.error);
        this.removePerformancePanel(profileId);
      }
    }

    this.store.performancePanel = null;
  }
}
