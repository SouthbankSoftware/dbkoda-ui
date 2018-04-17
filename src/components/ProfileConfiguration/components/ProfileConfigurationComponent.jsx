import React from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';

import './styles.scss';
import Button from './Button';

const ResponsiveGridLayout = WidthProvider(Responsive);
export default class ProfileConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layouts: [
        {
          i: 'top-padding',
          className: 'profile-config-top-padding',
          x: 0,
          y: 0,
          w: 12,
          h: 1,
          static: true,
        },
        {
          i: 'title',
          className: 'profile-config-title',
          x: 0,
          y: 1,
          w: 2,
          h: 2,
          static: true,
        },
        {
          i: 'buttons',
          className: 'profile-config-buttons',
          x: 8,
          y: 1,
          w: 4,
          h: 2,
          static: true,
        },
        {
          i: 'db-list',
          className: 'profile-config-db-list',
          x: 0,
          y: 3,
          w: 1,
          h: 6,
          static: true,
        },
      ],
    };
  }

  createButtonPanels(layout) {
    const {showPerformancePanel} = this.props;
    return (
      <div key="buttons" className={layout.className} data-grid={layout}>
        <Button
          className={`${layout.className}-button`}
          text={globalString('performance/profiling/configuration/analyse')}
        />
        <Button
          className={`${layout.className}-button`}
          onClick={showPerformancePanel}
          text={globalString('performance/profiling/configuration/performance')}
        />
      </div>
    );
  }

  createDomElement(layouts) {
    return layouts.map(layout => {
      if (layout.i === 'buttons') {
        return this.createButtonPanels(layout);
      }
      if (layout.i === 'title') {
        return (
          <div key="title" className={layout.className} data-grid={layout}>
            {globalString('performance/profiling/configuration/setup')}
          </div>
        );
      }
      return (
        <div key={layout.i} className={layout.className} data-grid={layout} />
      );
    });
  }

  render() {
    console.log(this.props);
    const {layouts} = this.state;
    return (
      <ResponsiveGridLayout
        layouts={layouts}
        cols={{lg: 12, md: 12, sm: 12, xs: 12, xxs: 12}}
      >
        {this.createDomElement(layouts)}
      </ResponsiveGridLayout>
    );
  }
}
