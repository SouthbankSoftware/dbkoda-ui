/**
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
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import Checkbox from './Checkbox';

import './DatabaseList.scss';

export default class DatabaseList extends React.Component {
  render() {
    const { selectDatabase } = this.props;
    return (
      <div className="profile-config-database-list">
        <div className="profile-db-list-title">
          {globalString('performance/profiling/configuration/database-list-title')}
        </div>
        <div className="profile-db-list">
          {this.props.databases.map(db => {
            const dotClsName = db.value && db.value.was > 0 ? 'full-circle' : 'full-circle hide';
            return (
              <div className="profile-database">
                <Icon className={dotClsName} icon={IconNames.FULL_CIRCLE} />
                <Checkbox
                  key={db.name}
                  className="db-item"
                  label={db.name}
                  value={db.selected}
                  onClick={() => selectDatabase(db)}
                />
              </div>
            );
          })}
        </div>
        <div className="db-profile-indicator">
          <Icon className="full-circle" icon={IconNames.FULL_CIRCLE} />{' '}
          <span>
            {globalString('performance/profiling/configuration/profile-enabled-indicator')}
          </span>
        </div>
      </div>
    );
  }
}
