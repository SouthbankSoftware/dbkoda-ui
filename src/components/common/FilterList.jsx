/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-07-11T17:33:29+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-31T14:14:13+11:00
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

/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import fuzzysearch from 'fuzzysearch';

export default class FilterList extends React.Component {
  static defaultProps = {
    items: [],
    getItemTitle: null, // null to use self as title
    getItemId: null, // null to use getItemTitle, then title
    onClick: null,
  };

  static propTypes = {
    items: React.PropTypes.array,
    getItemTitle: React.PropTypes.func,
    getItemId: React.PropTypes.func,
    onClick: React.PropTypes.func,
  };

  state = {
    items: this.props.items,
  };

  getItemTitle(item) {
    const { getItemTitle } = this.props;

    return getItemTitle ? getItemTitle(item) : item;
  }

  getItemId(item) {
    const { getItemTitle, getItemId } = this.props;

    if (getItemId) {
      return getItemId(item);
    } else if (getItemTitle) {
      return getItemTitle(item);
    }
    return item;
  }

  filterList = (event) => {
    const target = event.target.value.toLowerCase();
    let updatedList = this.props.items;
    updatedList = updatedList.filter(item =>
      fuzzysearch(target, this.getItemTitle(item).toLowerCase()),
    );
    this.setState({ items: updatedList });
  };

  render() {
    const { onClick } = this.props;

    return (
      <div className="FilterList">
        <input
          className="pt-input"
          type="text"
          placeholder="Search tabs..."
          onChange={this.filterList}
        />
        <ul>
          {this.state.items.map((item) => {
            const itemTitle = this.getItemTitle(item);
            const itemId = this.getItemId(item);
            const onItemClick = onClick && onClick.bind(this, item); // eslint-disable-line react/jsx-no-bind

            return (
              <li key={itemId} onClick={onItemClick}>
                {itemTitle}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
