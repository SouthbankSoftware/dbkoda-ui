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

const Header = () => (
  <div className="header">
    <span className="key">{globalString('backup/database/collection')}</span>
    <div className="pt-icon-add circleButton" role="button" />
  </div>
);

const Row = ({options, selectCollection, unSelectCollection, index}) => (
  <div className="row">
    <div className="pt-select">
      <select className="select" defaultValue={globalString('backup/database/selectCollection')}
        onChange={(item) => {
                selectCollection(item.target.value);
              }}
        value={index >= 0 && options.length > index ? options[index] : ''}
      >
        <option>{globalString('backup/database/selectCollection')}</option>
        {
          options.map((o, i) => {
            const id = i;
            return (<option key={id}>{o}</option>);
          })
        }
      </select>
    </div>
    <div className="field-group pt-icon-delete circleButton" role="button" onChange={() => unSelectCollection()} />
  </div>
);


export default ({collections, selectedCollections, selectCollection, unSelectCollection}) => {
  const options = _.filter(collections, a => selectedCollections.indexOf(a) < 0);
  console.log('get rest collection ', options);
  return (
    <div className="collection-list">
      <Header />
      <Row options={options} selectCollection={selectCollection} index={0} unSelectCollection={unSelectCollection} />
    </div>
  );
};
