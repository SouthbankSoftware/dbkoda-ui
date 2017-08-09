/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-01T10:50:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-09T16:46:02+10:00
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

import React from 'react';
import * as d3 from 'd3';
import filesize from 'filesize';
import './View.scss';

// Breadcrumb dimensions: width, height, spacing, width of tip/tail
const b = {
  w: 75,
  h: 30,
  s: 3,
  t: 10,
};

const getColour = (startColour) => {
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
      '#58595b',
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
    height: 600,
  };

  static PropTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    data: React.PropTypes.object.isRequired,
    selectedNode: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func,
    onDblClick: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

    const { width, height } = props;

    this.radius = Math.min(width, height) / 2;

    // this.toggleLegend = this.toggleLegend.bind(this);
    this.mouseover = this.mouseover.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.breadcrumbPoints = this.breadcrumbPoints.bind(this);
    this.updateData = this.updateData.bind(this);
    if (props.data) {
      this.state = {
        data: props.data,
      };
      this.updateData();
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps:', nextProps);

    if (this.dataRoot && nextProps.data) {
      const newDataRoot = d3.hierarchy(nextProps.data);
      if (
        newDataRoot.descendants().length != this.dataRoot.descendants().length
      ) {
        console.log('newDataRoot: ', newDataRoot);
        this.setState({
          data: nextProps.data,
        });
        this.lastSelectedRoot = this.root;
        this.root = null;
        this.dataRoot = null;
      }
    }
    if (this.dataRoot && nextProps.selectedNode) {
      console.log('path:', this.dataRoot.path(nextProps.selectedNode));
      if (this.props.selectedNode != nextProps.selectedNode) {
        this.root = nextProps.selectedNode;
        this.createView();
      }
    }
  }

  updateData() {
    // Turn the data into a d3 hierarchy and calculate the sums.
    let lastParent = null;
    this.dataRoot = d3
      .hierarchy(this.state.data)
      .sum((d) => {
        return d.size;
      })
      .sort((a, b) => {
        // sorting alphabatically to keep the colors same even after additional data ia populated
        return a.data.name.localeCompare(b.data.name);
      })
      .each((node) => {
        // skip root node
        if (!node.parent) return;
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
      console.log('test path:', this.dataRoot.path(this.lastSelectedRoot));
      const arrNodes = [];
      let lastRootData = this.lastSelectedRoot.data;
      while (lastRootData.parent != null) {
        arrNodes.push(lastRootData.name);
        lastRootData = lastRootData.parent;
      }
      console.log('test hierarchy of data', arrNodes);
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
   * Main function to draw and set up the visualization, once we have the data.
   */
  createView() {
    // reset colour
    getColour._idx = 0;

    this.view = d3.select(this.viewEl);
    this.container = d3.select(this.containerEl);
    const divisor = this.root.depth == 0 ? 1 : 1 + this.root.depth * 0.5;
    const partition = d3
      .partition()
      .size([2 * Math.PI, this.radius * this.radius / divisor]);
    const arc = d3
      .arc()
      .startAngle((d) => {
        return d.x0;
      })
      .endAngle((d) => {
        return d.x1;
      })
      .innerRadius((d) => {
        return Math.sqrt(d.y0);
      })
      .outerRadius((d) => {
        return Math.sqrt(d.y1);
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    const nodes = partition(this.root).descendants().filter((d) => {
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

    this.updateList(this.root);
  }

  updateList(d) {
    // Update list
    const listSel = d3.select(this.listEl);

    // header
    listSel.select('thead').selectAll('tr').remove();
    listSel
      .select('thead')
      .selectAll('tr')
      .data([d])
      .enter()
      .append('tr')
      .classed('theadRowColor', d => d.colour !== undefined)
      .style('background-color', d => d.colour || 'none')
      .html(d => `<th>${d.data.name}</th><th>${filesize(d.value)}</th>`);

    // row
    listSel.select('tbody').selectAll('tr').remove();
    if (d.children) {
      listSel
        .select('tbody')
        .selectAll('tr')
        .data(d.children)
        .enter()
        .append('tr')
        .classed('tbodyRowColor', d => d.colour !== undefined)
        .style('background-color', d => d.colour || 'none')
        .html(d => `<td>${d.data.name}</td><td>${filesize(d.value)}</td>`);
    }
  }

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  mouseover(d) {
    const percentage = (100 * d.value / this.root.value).toPrecision(3);
    let percentageString = percentage + '%';
    if (percentage < 0.1) {
      percentageString = '< 0.1%';
    }

    this.view.select('.name').text(d.data.name);
    this.view.select('.percentage').text(percentageString);
    this.view.select('.filesize').text(filesize(d.value));

    this.view.select('.explanation').style('visibility', '');

    const sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    this.updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    const paths = this.container.selectAll('path').style('opacity', 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    paths
      .filter((node) => {
        return sequenceArray.indexOf(node) >= 0;
      })
      .style('opacity', 1);

    this.updateList(d);
  }

  /**
   * Restore everything to full opacity when moving off the visualization.
   */
  mouseleave() {
    // Hide the breadcrumb trail
    this.view.select('.trail').style('visibility', 'hidden');

    // Deactivate all segments during transition.
    const paths = this.container.selectAll('path').on('mouseover', null);

    // Transition each segment to full opacity and then reactivate it.
    paths.transition().duration(1000).style('opacity', 1).on('end', () => {
      paths.on('mouseover', this.mouseover);
    });

    this.view.select('.explanation').style('visibility', 'hidden');

    this.updateList(this.root);
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
      .data(nodeArray, (d) => {
        return d.data.name + d.depth;
      });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const entering = trail.enter().append('svg:g');

    entering
      .append('svg:polygon')
      .attr('points', this.breadcrumbPoints)
      .style('fill', d => d.colour);

    entering
      .append('svg:text')
      .attr('x', (d) => {
        return (this.getBreadcrumbWidth(d) + b.t) / 2;
      })
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => {
        return d.data.name;
      });

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

  componentDidMount() {
    this.createView();
  }

  componentDidUpdate() {
    this.updateData();
    this.createView();

    console.log('View Updated!!!!');
  }

  render() {
    const { width, height } = this.props;

    return (
      <div
        ref={viewEl => (this.viewEl = viewEl)}
        className="StorageSunburstView"
      >
        <div className="main">
          <div className="sequence">
            <svg className="trail" width={width} height={50}>
              <text className="endlabel" />
            </svg>
          </div>
          <div className="chart">
            <div className="explanation" style={{ visibility: 'hidden' }}>
              <span className="name" /> takes
              <br />
              <span className="percentage" />
              <br />
              (<span className="filesize" />) of the total storage
            </div>
            <svg width={width} height={height}>
              <g
                ref={containerEl => (this.containerEl = containerEl)}
                transform={`translate(${width / 2}, ${height / 2})`}
              >
                <circle r={this.radius} style={{ opacity: 0 }} />
              </g>
            </svg>
          </div>
        </div>
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
