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
 * Created by joey on 21/2/18.
 */

import React from 'react';
import {bytesToSize} from '../Utils';
import ErrorIcon from '../../../../styles/icons/error-icon.svg';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    height: '20px',
    lineHeight: '20px',
  }
};

export default (props) => {
  const {items} = props;
  if (!items) {
    return null;
  }
  return (
    <div style={styles.root}>
      {
        items.map((item) => {
          return (
            <div style={styles.item}>
              <ErrorIcon style={{fill: item.color, width: '16px', marginRight: '2px'}} />
              <div style={{color: 'white', marginRight: '10px', width: '50%'}}>{item.dbName}</div>
              <div style={{color: 'white'}}>{bytesToSize(item.dataSize)}</div>
            </div>
          );
        })
      }
    </div>
  );
};
