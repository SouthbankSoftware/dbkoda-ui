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
import './View.scss';

// Breadcrumb dimensions: width, height, spacing, width of tip/tail
const b = {
  w: 75,
  h: 30,
  s: 3,
  t: 10,
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
    // Mapping of step names to colors
    colors: {
      home: '#5687d1',
      product: '#7b615c',
      search: '#de783b',
      account: '#6ab975',
      other: '#a173d1',
      end: '#666666',
    },
  };

  static PropTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    colors: React.PropTypes.object,
  };

  constructor(props) {
    super(props);

    const { width, height } = props;

    this.radius = Math.min(width, height) / 2;

    this.toggleLegend = this.toggleLegend.bind(this);
    this.mouseover = this.mouseover.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.breadcrumbPoints = this.breadcrumbPoints.bind(this);
  }

  /**
   * Total size of all segments; we set this later, after loading the data.
   */
  totalSize = 0;

  /*
   * Main function to draw and set up the visualization, once we have the data.
   */
  createView() {
    const { colors } = this.props;

    this.container = d3.select(this.containerEl);

    const partition = d3.partition().size([2 * Math.PI, this.radius * this.radius]);
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

    const csv = d3.csvParseRows(require('./csvData').default);
    const json = this.buildHierarchy(csv);

    // Basic setup of page elements.
    this.drawLegend();
    d3.select(this.toggleLegendEl).on('click', this.toggleLegend);

    // Turn the data into a d3 hierarchy and calculate the sums.
    const root = d3
      .hierarchy(json)
      .sum((d) => {
        return d.size;
      })
      .sort((a, b) => {
        return b.value - a.value;
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    const nodes = partition(root).descendants().filter((d) => {
      return d.x1 - d.x0 > 0.005; // 0.005 radians = 0.29 degrees
    });

    const updatedSel = this.container.selectAll('path').data(nodes);

    // Add/modify paths
    updatedSel
      .enter()
      .append('svg:path')
      .attr('display', (d) => {
        return d.depth ? null : 'none';
      })
      .attr('d', arc)
      .attr('fill-rule', 'evenodd')
      .style('fill', (d) => {
        return colors[d.data.name];
      })
      .style('opacity', 1)
      .on('mouseover', this.mouseover);

    // Prune extraneous paths
    updatedSel.exit().remove();

    // Add the mouseleave handler to the bounding circle.
    this.container.on('mouseleave', this.mouseleave);

    // Get total size of the tree = value of root node from partition.
    this.totalSize = this.container.selectAll('path').datum().value;
  }

  // Fade all but the current sequence, and show it in the breadcrumb trail.
  mouseover(d) {
    const percentage = (100 * d.value / this.totalSize).toPrecision(3);
    let percentageString = percentage + '%';
    if (percentage < 0.1) {
      percentageString = '< 0.1%';
    }

    d3.select('.percentage').text(percentageString);

    d3.select('.explanation').style('visibility', '');

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
  }

  /**
   * Restore everything to full opacity when moving off the visualization.
   */
  mouseleave() {
    // Hide the breadcrumb trail
    d3.select('.trail').style('visibility', 'hidden');

    // Deactivate all segments during transition.
    const paths = this.container.selectAll('path').on('mouseover', null);

    // Transition each segment to full opacity and then reactivate it.
    paths.transition().duration(1000).style('opacity', 1).on('end', () => {
      paths.on('mouseover', this.mouseover);
    });

    d3.select('.explanation').style('visibility', 'hidden');
  }

  /**
   * Generate a string that describes the points of a breadcrumb polygon.
   */
  breadcrumbPoints(d, i) {
    const points = [];

    points.push('0,0');
    points.push(b.w + ',0');
    points.push(b.w + b.t + ',' + b.h / 2);
    points.push(b.w + ',' + b.h);
    points.push('0,' + b.h);

    if (i > 0) {
      // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + ',' + b.h / 2);
    }

    return points.join(' ');
  }

  /**
   * Update the breadcrumb trail to show the current sequence and percentage.
   */
  updateBreadcrumbs(nodeArray, percentageString) {
    const { colors } = this.props;

    // Data join; key function combines name and depth (= position in sequence).
    const trail = d3.select('.trail').selectAll('g').data(nodeArray, (d) => {
      return d.data.name + d.depth;
    });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    const entering = trail.enter().append('svg:g');

    entering.append('svg:polygon').attr('points', this.breadcrumbPoints).style('fill', (d) => {
      return colors[d.data.name];
    });

    entering
      .append('svg:text')
      .attr('x', (b.w + b.t) / 2)
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => {
        return d.data.name;
      });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr('transform', (d, i) => {
      return 'translate(' + i * (b.w + b.s) + ', 0)';
    });

    // Now move and update the percentage at the end.
    d3
      .select('.trail')
      .select('.endlabel')
      .attr('x', (nodeArray.length + 0.5) * (b.w + b.s))
      .attr('y', b.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select('.trail').style('visibility', '');
  }

  drawLegend() {
    const { colors } = this.props;
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    const li = {
      w: 75,
      h: 30,
      s: 3,
      r: 3,
    };

    const legend = d3
      .select(this.legendEl)
      .attr('width', li.w)
      .attr('height', d3.keys(colors).length * (li.h + li.s));

    const g = legend
      .selectAll('g')
      .data(d3.entries(colors))
      .enter()
      .append('svg:g')
      .attr('transform', (d, i) => {
        return 'translate(0,' + i * (li.h + li.s) + ')';
      });

    g
      .append('svg:rect')
      .attr('rx', li.r)
      .attr('ry', li.r)
      .attr('width', li.w)
      .attr('height', li.h)
      .style('fill', (d) => {
        return d.value;
      });

    g
      .append('svg:text')
      .attr('x', li.w / 2)
      .attr('y', li.h / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => {
        return d.key;
      });
  }

  toggleLegend() {
    const legend = d3.select('.legend');
    if (legend.style('visibility') == 'hidden') {
      legend.style('visibility', '');
    } else {
      legend.style('visibility', 'hidden');
    }
  }

  // Take a 2-column CSV and transform it into a hierarchical structure suitable
  // for a partition layout. The first column is a sequence of step names, from
  // root to leaf, separated by hyphens. The second column is a count of how
  // often that sequence occurred.
  buildHierarchy(csv) {
    const root = { name: 'root', children: [] };
    for (let i = 0; i < csv.length; i += 1) {
      const sequence = csv[i][0];
      const size = +csv[i][1];
      if (isNaN(size)) {
        // e.g. if this is a header row
        continue; // eslint-disable-line no-continue
      }
      const parts = sequence.split('-');
      let currentNode = root;
      for (let j = 0; j < parts.length; j += 1) {
        const children = currentNode.children;
        const nodeName = parts[j];
        let childNode;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          let foundChild = false;
          for (let k = 0; k < children.length; k += 1) {
            if (children[k].name == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = { name: nodeName, children: [] };
            children.push(childNode);
          }
          currentNode = childNode;
        } else {
          // Reached the end of the sequence; create a leaf node.
          childNode = { name: nodeName, size };
          children.push(childNode);
        }
      }
    }
    return root;
  }

  componentDidMount() {
    this.createView();
  }

  componentDidUpdate() {
    this.createView();
  }

  render() {
    const { width, height } = this.props;

    return (
      <div className="StorageSunburstView">
        <div className="main">
          <div className="sequence">
            <svg className="trail" width={width} height={50}>
              <text className="endlabel" />
            </svg>
          </div>
          <div className="chart">
            <div className="explanation" style={{ visibility: 'hidden' }}>
              <span className="percentage" />
              <br />
              of visits begin with this sequence of pages
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
        <div className="sidebar">
          <input
            ref={toggleLegendEl => (this.toggleLegendEl = toggleLegendEl)}
            type="checkbox"
          />{' '}
          Legend<br />
          <div className="legend" style={{ visibility: 'hidden' }}>
            <svg ref={legendEl => (this.legendEl = legendEl)} />
          </div>
        </div>
      </div>
    );
  }
}
