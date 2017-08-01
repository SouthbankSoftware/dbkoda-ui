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
import StorageSunburstView from '#/common/SunburstView';

import './Panel.scss';

// Raw tree data
const data = require('./data-guy.json');

// Here we make the tree backward navigatable. You can use your own navigation strategy, for example, dynamic loading
function addParent(data) {
  if (data.children) {
    for (const child of data.children) {
      child.parent = data;
      addParent(child);
    }
  }
}

addParent(data);

console.log(data);

export default class StoragePanel extends React.Component {
  state = {
    data,
  };

  render() {
    return (
      <div className="StoragePanel">
        <StorageSunburstView
          data={this.state.data}
          onClick={(node) => {
            // node is a tree Node in d3-hierachy (https://github.com/d3/d3-hierarchy) that just clicked by user
            const nodeData = node.data;

            if (!node.parent) {
              // root is clicked, we should move upward in the data tree
              if (nodeData.parent) {
                this.setState({
                  data: nodeData.parent,
                });
              }
            } else {
              // a child is clicked, we should move downward in the data tree
              this.setState({
                data: nodeData,
              });
            }
          }}
        />
      </div>
    );
  }
}
