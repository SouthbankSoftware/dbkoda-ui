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

/**
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-07-19 11:17:49
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import './style.scss';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock);
    return (
      <div className="aggregateDetailsWrapper">
        <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
          <h2 className="currentBlockChoice">
            Block Details
          </h2>
        </nav>
        { this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock &&
          <div className="aggregateDetailsContent">
            <p>
              Some fields will go here based on type {this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock.type}
            </p>
          </div>}
        {!this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock &&
          <div className="aggregateDetailsContent">
            <p>
              No block selected.
            </p>
          </div>}
      </div>
    );
  }
}
