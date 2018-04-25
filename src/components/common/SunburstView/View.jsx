/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-01T10:50:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-21T10:55:45+11:00
 */

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
/* eslint no-unused-vars:warn */

import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import filesize from 'filesize';
import { observe } from 'mobx';
import { debounce } from 'lodash';
import './View.scss';

// Breadcrumb dimensions: width, height, spacing, width of tip/tail
const b = {
  w: 75,
  h: 30,
  s: 3,
  t: 10
};

const getColour = startColour => {
  if (!getColour._colours) {
    getColour._idx = 0;
    // colour palette
    getColour._colours = [
      '#594746',
      '#794025',
      '#2c4b44',
      '#406e65',
      '#018b93',
      '#3ab262',
      '#65764c',
      '#132c70',
      '#365f87',
      '#37799e',
      '#3d7789',
      '#436fb6',
      '#1fb2e5',
      '#515a6c',
      '#4f6680',
      '#6562a0',
      '#7040a3',
      '#ac8bc0',
      '#58394f',
      '#6d203e',
      '#92294c',
      '#d2499b',
      '#e26847',
      '#e0a767',
      '#a5a11b',
      '#58595b'
    ];
  }

  if (startColour) {
    getColour._idx = getColour._colours.indexOf(startColour) + 1;
  }

  const colour = getColour._colours[getColour._idx % getColour._colours.length];
  getColour._idx += 1;
  return colour;
};

global.d3 = d3;

/**
 * MongoDB storage breakdown in sunburst chart view
 *
 * Part of this implementation is based kerryrodden's work:
 * https://gist.github.com/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8
 */
export default class View extends React.Component {
  static defaultProps = {
    width: 750,
    height: 600
  };

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.object.isRequired,
    selectedNode: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onBreadCrumbClick: PropTypes.func
  };

  constructor(props) {
    super(props);
    let { width, height } = props;
    let radius = Math.min(width, height) / 2;
    const store = this.props.store;
    const dimentions = this.getDimentions(store);
    if (dimentions) {
      width = dimentions.width;
      height = dimentions.height;
      radius = dimentions.radius;
    }

    this.mouseover = this.mouseover.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.breadcrumbPoints = this.breadcrumbPoints.bind(this);
    this.updateData = this.updateData.bind(this);
    this.handleResize = this.handleResize.bind(this);
    if (props.data) {
      this.state = {
        data: props.data,
        radius,
        width,
        height
      };
      this.updateData();
    }
    observe(store.layout, change => {
      this.handleResize();
    });
  }

  getDimentions(store) {
    const result = {};
    if (store && store.layout) {
      const leftSidebarWidth = isNaN(store.layout.overallSplitPos)
        ? window.innerWidth * 0.35
        : store.layout.overallSplitPos;
      const topBarsHeight = isNaN(store.layout.rightSplitPos)
        ? window.innerHeight * 0.6
        : store.layout.rightSplitPos;
      result.width = window.innerWidth - leftSidebarWidth - 400; // 400 is the size of the right side table
      result.height = window.innerHeight - topBarsHeight - 81; // 81 is the height of tabbar and output panel top bar
      result.width -= 80; // reduction of 80 pixels for spacing on left and right
      result.height -= 80; // reduction of 80 pixels for top hierarchy
      result.radius = Math.min(result.width, result.height) / 2;
      return result;
    }
    return null;
  }

  componentWillReceiveProps(nextProps) {
    if (this.dataRoot && nextProps.data) {
      // This codition checks if new data is available and we have to recompute the hierarchy
      const newDataRoot = d3.hierarchy(nextProps.data);
      if (newDataRoot.descendants().length != this.dataRoot.descendants().length) {
        this.setState({
          data: nextProps.data
        });
        this.lastSelectedRoot = this.root; // keeping the reference of last selected node so that we can redraw the view at similar node level after new hierarchy is computed
        this.root = null;
        this.dataRoot = null;
      }
    }
    if (this.dataRoot && nextProps.selectedNode) {
      // Changing the root to redraw the chart without recalculating the hierarchy when drill down the chart.
      if (this.props.selectedNode != nextProps.selectedNode) {
        if (nextProps.selectedNode.parent == null) {
          this.root = this.dataRoot;
        } else {
          this.root = nextProps.selectedNode;
        }
        this.createView();
      }
    }
  }
  /*
   * Main function to set up the data and hierarchy
   */
  updateData() {
    // Turn the data into a d3 hierarchy and calculate the sums.
    let lastParent = null;
    this.dataRoot = d3
      .hierarchy(this.state.data)
      .sum(d => {
        return d.size;
      })
      .sort((a, b) => {
        // sorting alphabatically to keep the colors same even after additional data ia populated
        return a.data.name.localeCompare(b.data.name);
      })
      .each(node => {
        // skip root node
        if (!node.parent) {
          node.colour = '#494849';
          return;
        }
        if (node.parent !== lastParent) {
          node.colour = getColour(node.parent.colour);
        } else {
          node.colour = getColour();
        }
        lastParent = node.parent;
      })
      .sort((a, b) => {
        return b.value - a.value; // sorting on value to draw the chart
      });

    if (this.lastSelectedRoot) {
      // the logic in this condition is to keep the drill downed node selected in case the data is changed because of the extended data.
      const arrNodes = [];
      let lastRootData = this.lastSelectedRoot.data;
      while (lastRootData.parent != null) {
        arrNodes.push(lastRootData.name);
        lastRootData = lastRootData.parent;
      }
      let newRoot = this.dataRoot;
      while (arrNodes.length > 0) {
        const nodeVal = arrNodes.pop();
        for (const childNode of newRoot.children) {
          if (childNode.data.name == nodeVal) {
            newRoot = childNode;
            break;
          }
        }
      }
      if (newRoot) {
        this.root = newRoot;
      }
      this.lastSelectedRoot = null;
    }

    if (!this.root) {
      this.root = this.dataRoot;
    }
  }

  /*
   * Main function to draw visualization, once we have the data.
   */
  createView() {
    // reset colour
    getColour._idx = 0;

    this.view = d3.select(this.viewEl);
    this.container = d3.select(this.containerEl);
    const divisor = this.root.depth == 0 ? 1 : 1 + this.root.depth * 0.5;
    const partition = d3
      .partition()
      .size([2 * Math.PI, this.state.radius * this.state.radius / divisor]);
    const arc = d3
      .arc()
      .startAngle(d => {
        return d.x0;
      })
      .endAngle(d => {
        return d.x1;
      })
      .innerRadius(d => {
        return Math.sqrt(d.y0);
      })
      .outerRadius(d => {
        return Math.sqrt(d.y1);
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    const nodes = partition(this.root)
      .descendants()
      .filter(d => {
        return d.x1 - d.x0 > 0.005; // 0.005 radians = 0.29 degrees
      });

    this.container.selectAll('path').remove();
    this.container
      .selectAll('path')
      .data(nodes)
      .enter()
      .append('svg:path')
      .attr('d', arc)
      .attr('fill-rule', 'evenodd')
      // TODO this default colour #202020 should be linked to $tabBackgroundSelected in theme
      .style('fill', d => d.colour || '#202020')
      .style('opacity', 1)
      .on('mouseover', this.mouseover)
      .on('click', this.props.onClick)
      .on('dblclick', this.props.onDblClick);

    // Add the mouseleave handler to the bounding circle.
    this.container.on('mouseleave', this.mouseleave);

    const sequenceArray = this.root.ancestors().reverse();
    this.updateBreadcrumbs(sequenceArray, this.getPercentageString());

    this.updateExplanation(this.root, this.getPercentageString());

    this.updateList(this.root);
  }
  getPercentageString(d, bTotal) {
    let percentage;
    if (d && bTotal) {
      // calculate the percentage of selected node w.r.t. Total Storage
      percentage = (100 * d.value / this.dataRoot.value).toPrecision(3);
    } else if (d && d != this.root) {
      // calculate the percentage of selected node w.r.t. selected root
      percentage = (100 * d.value / this.root.value).toPrecision(3);
    } else {
      // calculate the percentage of selected root node w.r.t. Total Storage
      percentage = (100 * this.root.value / this.dataRoot.value).toPrecision(3);
    }
    let percentageString = percentage + '%';
    if (percentage < 0.1) {
      percentageString = '< 0.1%';
    }
    return percentageString;
  }
  /*
   * Update the table with the actual values of data volume.
   */
  updateList(d) {
    // Update list
    const listSel = d3.select(this.listEl);

    // header
    listSel
      .select('thead')
      .selectAll('tr')
      .remove();
    listSel
      .select('thead')
      .selectAll('tr')
      .data([d])
      .enter()
      .append('tr')
      .classed('theadRowColor', d => d.colour !== undefined)
      .style('color', '#FFFFFF')
      .html(
        d =>
          `<th><svg width="20" height="20"></svg></th><th>${d.data.name}</th><th>${filesize(
            d.value
          )}</th>`
      )
      .select('svg')
      .append('g')
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', '6px')
      .style('fill', d => d.colour || '#000');

    // row
    listSel
      .select('tbody')
      .selectAll('tr')
      .remove();
    if (d.children) {
      const tr = listSel
        .select('tbody')
        .selectAll('tr')
        .data(d.children)
        .enter()
        .append('tr')
        .classed('tbodyRow', true);
      const td = tr.append('td');

      td
        .append('svg')
        .attr('width', 20)
        .attr('height', 20)
        .append('g')
        .append('circle')
        .attr('cx', 10)
        .attr('cy', 10)
        .attr('r', '6px')
        .style('fill', d => d.colour || '#000');

      tr
        .append('td')
        .classed('tdDataName', true)
        .text(d => {
          return d.data.name;
        });

      tr
        .append('td')
        .classed('tdDataSize', true)
        .text(d => {
          return filesize(d.value);
        });
    }
  }
  /*
   * Function to update the explanation text which is shown in the middle of the chart.
   */
  updateExplanation(d, percentageString) {
    this.view.select('.name').text(d.data.name);
    this.view.select('.percentage').text(percentageString);
    this.view.select('.filesize').text(filesize(d.value));
    if (d === this.root) {
      this.view.select('.parent').text(this.dataRoot.data.name);
    } else {
      this.view.select('.parent').text(this.root.data.name);
    }
    this.view.select('.explanation').style('color', this.getTextColor(this.root.colour));
    this.view.select('.explanation').style('visibility', '');
  }

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  mouseover(d) {
    this.updateExplanation(d, this.getPercentageString(d));

    const sequenceArray = d.ancestors().reverse();
    // sequenceArray.shift(); // remove root node from the array
    this.updateBreadcrumbs(sequenceArray, this.getPercentageString(d, true));

    // Fade all the segments.
    const paths = this.container.selectAll('path').style('opacity', 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    paths
      .filter(node => {
        return sequenceArray.indexOf(node) >= 0;
      })
      .style('opacity', 1);

    this.updateList(d);
  }

  /**
   * Restore everything to full opacity when moving off the visualization.
   */
  mouseleave() {
    const sequenceArray = this.root.ancestors().reverse();
    // sequenceArray.shift(); // remove root node from the array
    this.updateBreadcrumbs(sequenceArray, this.getPercentageString());

    this.updateExplanation(this.root, this.getPercentageString());

    this.updateList(this.root);

    // Deactivate all segments during transition.
    const paths = this.container.selectAll('path').on('mouseover', null);

    // Transition each segment to full opacity and then reactivate it.
    paths
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .on('end', () => {
        paths.on('mouseover', this.mouseover);
      });
  }

  /**
   * Generate a string that describes the points of a breadcrumb polygon.
   */
  breadcrumbPoints(d, i) {
    const points = [];

    points.push('0,0');
    const bw = this.getBreadcrumbWidth(d);
    points.push(bw + ',0');
    points.push(bw + b.t + ',' + b.h / 2);
    points.push(bw + ',' + b.h);
    points.push('0,' + b.h);

    if (i > 0) {
      // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + ',' + b.h / 2);
    }

    return points.join(' ');
  }

  getTextColor(hex) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (rgb) {
      const o = Math.round(
        (parseInt(rgb[1], 16) * 299 + parseInt(rgb[2], 16) * 587 + parseInt(rgb[3], 16) * 114) /
          1000
      );
      if (o > 125) {
        return '#202020';
      }
    }
    return '#FFFFFF';
  }
  getBreadcrumbWidth(d) {
    return d.data && d.data.name ? d.data.name.length * 8 + 10 : b.w;
  }

  /**
   * Update the breadcrumb trail to show the current sequence and percentage.
   */
  updateBreadcrumbs(nodeArray, percentageString) {
    // Data join; key function combines name and depth (= position in sequence).
    const trail = this.view
      .select('.trail')
      .selectAll('g')
      .data(nodeArray, d => {
        return d.data.name + d.depth;
      });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const entering = trail.enter().append('svg:g');

    entering
      .append('svg:polygon')
      .attr('points', this.breadcrumbPoints)
      .style('fill', d => d.colour)
      .on('click', this.props.onBreadCrumbClick);

    entering
      .append('svg:text')
      .attr('x', d => {
        return (this.getBreadcrumbWidth(d) + b.t) / 2;
      })
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => {
        return d.data.name;
      })
      .style('fill', d => {
        return this.getTextColor(d.colour);
      })
      .style('cursor', 'pointer')
      .on('click', this.props.onBreadCrumbClick);

    // Merge enter and update selections; set position for all nodes.
    let lastPos = 0;
    entering.merge(trail).attr('transform', (d, i) => {
      const strTranslate = 'translate(' + (i * b.s + lastPos) + ', 0)';
      lastPos += this.getBreadcrumbWidth(d);
      return strTranslate;
    });

    // Now move and update the percentage at the end.
    this.view
      .select('.trail .endlabel')
      .attr('x', (nodeArray.length + 0.5) * b.s + (lastPos + 30))
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    this.view.select('.trail').style('visibility', '');
  }
  handleResize() {
    const dimentions = this.getDimentions(this.props.store);
    if (dimentions) {
      this.setState({
        width: dimentions.width,
        height: dimentions.height,
        radius: dimentions.radius
      });
    }
  }
  componentDidMount() {
    window.addEventListener('resize', debounce(this.handleResize, 400));
    this.createView();
  }

  componentDidUpdate() {
    this.updateData();
    this.createView();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { width, height } = this.state;
    const trailWidth = width + 400;
    return (
      <div ref={viewEl => (this.viewEl = viewEl)} className="StorageSunburstView">
        <div className="main">
          <div className="sequence">
            <svg className="trail" width={trailWidth} height={50}>
              <text className="endlabel" />
            </svg>
          </div>
          <div className="chart">
            <div
              className="explanation"
              style={{
                visibility: 'hidden',
                top: height / 2 - 40 + 'px',
                left: width / 2 - 70 + 'px'
              }}
            >
              <span className="name" /> takes
              <br />
              <span className="percentage" />
              <br />
              (<span className="filesize" />) of the <span className="parent" /> storage
            </div>
            <svg width={width} height={height}>
              <g
                ref={containerEl => (this.containerEl = containerEl)}
                transform={`translate(${width / 2}, ${height / 2})`}
              >
                <circle r={this.state.radius} style={{ opacity: 0 }} />
              </g>
            </svg>
          </div>
        </div>
        <div className="chartSeperator" />
        <div className="list">
          <table ref={listEl => (this.listEl = listEl)}>
            <thead />
            <tbody />
          </table>
        </div>
      </div>
    );
  }
}
