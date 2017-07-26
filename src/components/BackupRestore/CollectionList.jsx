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
 * Created by joey on 20/7/17.
 */

import React from 'react';
import _ from 'lodash';

import './CollectionList.scss';

/* eslint-disable jsx-a11y/no-static-element-interactions */

const Header = ({target}) => (
  <div className="header">
    <span className="key">{target === 'server' ? globalString('backup/database/database') : globalString('backup/database/collection')}</span>
  </div>
);

const Row = ({options, selectCollection, unSelectCollection, index, colName, readOnly, target}) => (
  <div className="row">
    <div className="pt-select">
      <select className="select" defaultValue={target === 'server' ? globalString('backup/database/selectDatabase') : globalString('backup/database/selectCollection')}
        onChange={(item) => {
                selectCollection(item.target.value, index);
              }}
        disabled={readOnly}
        value={index >= 0 ? colName : ''}
      >
        <option>{globalString(target === 'server' ? globalString('backup/database/selectDatabase') : 'backup/database/selectCollection')}</option>
        {
          options.map((o, i) => {
            const id = i;
            return (<option key={id}>{o}</option>);
          })
        }
      </select>
    </div>
    {
      index < 0 || readOnly ? null : <div className="field-group pt-icon-delete circleButton" role="button"
        onClick={() => unSelectCollection(colName, index)} />
    }
  </div>
);

export default ({collections, selectedCollections, selectCollection, unSelectCollection, readOnly, target}) => {
  const options = _.filter(collections, a => selectedCollections.indexOf(a) < 0);
  return (
    <div className="collection-list">
      <Header target={target} />
      {
        selectedCollections.map((col, i) => {
          const id = i;
          const array = options.slice();
          array.splice(0, 0, col);
          return (<Row key={id} index={i} colName={col} options={array} selectCollection={selectCollection}
            unSelectCollection={unSelectCollection} readOnly={readOnly} />);
        })
      }
      {
        options.length > 0 && !readOnly ? <Row options={options} selectCollection={selectCollection} index={-1}
          unSelectCollection={unSelectCollection} /> : null
      }
    </div>
  );
};
