/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:15:28+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T11:17:30+11:00
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
// $FlowFixMe
import { Responsive } from 'react-grid-layout';
// $FlowFixMe
import { Button } from '@blueprintjs/core';
import { inject, observer } from 'mobx-react';
import type { PerformancePanelState } from '~/api/PerformancePanel';
import Widget from '#/PerformancePanel/Widgets/Widget';
import SizeProvider from './SizeProvider';
import './Panel.scss';

const ResponsiveReactGridLayout = SizeProvider(Responsive);

type Store = {
  performancePanel: PerformancePanelState,
};

type Props = {
  store: any | Store,
  api: *,
  profileId: UUID,
};

@inject(({ store: { performancePanels }, api }, { profileId }) => {
  const performancePanel = performancePanels.get(profileId);

  return {
    store: {
      performancePanel,
    },
    api,
  };
})
@observer
export default class PerformancePanel extends React.Component<Props> {
  // TODO: refactor these into mobx states
  layouts: *;
  rows = 8;
  cols = 10;
  widgetHeight = 2;
  widgetWidth = 2;
  widgets = [];

  static defaultProps = {
    store: null,
    api: null,
  };

  constructor(props: Props) {
    super(props);

    const { api, profileId } = this.props;

    this.widgets.push(api.addWidget(profileId, ['dummy-0']));
    this.widgets.push(api.addWidget(profileId, ['dummy-1']));
    this.widgets.push(api.addWidget(profileId, ['dummy-2']));
    this.widgets.push(api.addWidget(profileId, ['dummy-3']));
    this.widgets.push(api.addWidget(profileId, ['dummy-4']));
    this.widgets.push(api.addWidget(profileId, ['dummy-5']));

    this.layouts = {
      desktop: this.widgets.map((v, i) => ({
        w: this.widgetWidth,
        h: this.widgetHeight,
        x: (i * this.widgetWidth) % this.cols,
        y: Math.floor(i / this.cols),
        i: v,
      })),
    };
  }

  render() {
    const { api, profileId } = this.props;

    return (
      <div className="PerformancePanel">
        <ResponsiveReactGridLayout
          className="GridLayout"
          layouts={this.layouts}
          autoSize={false}
          breakpoints={{
            desktop: 0,
          }}
          cols={{
            desktop: this.cols,
          }}
          verticalGridSize={this.rows}
          margin={[12, 12]}
        >
          {this.widgets.map(v => (
            <div id={`widget-${v}`} key={v} className="pt-elevation-3">
              <Widget id={v} />
            </div>
          ))}
        </ResponsiveReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={() => api.closePerformancePanel(profileId)}
        />
      </div>
    );
  }
}
