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
import { Popover2 } from '@blueprintjs/labs';
import { PopoverInteractionKind } from '@blueprintjs/core';
import { bytesToSize } from '../Utils';
import CircleIcon from '../../../../styles/icons/circle.svg';
import './DonutWidget.scss';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '60%',
    color: '#b3b3b3'
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '20px',
    lineHeight: '20px'
  }
};

export default props => {
  const { items } = props;
  if (!items) {
    return null;
  }
  return (
    <div className="storageList" style={styles.root}>
      {items.map(item => {
        return (
          <div style={styles.item}>
            <div className="leftWrapper" style={{ marginRight: '10px' }}>
              {' '}
              <CircleIcon
                style={{ fill: item.color, width: '5%', marginRight: '2px' }}
              />
              {item.dbName.length > 10 && (
                <Popover2
                  minimal
                  interactionKind={PopoverInteractionKind.HOVER}
                  popoverClassName="StorageLabelPopover"
                  content={
                    <div
                      className="StorageLabelPopoverContent"
                      style={{
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {item.dbName}
                    </div>
                  }
                  target={
                    <span style={{ top: '-100%', left: '10x' }}>
                      {item.dbName.substr(0, 8) + '...'}
                    </span>
                  }
                />
              )}
              {item.dbName.length < 10 && <span>{item.dbName}</span>}
            </div>
            <div style={{ textAlign: 'end', float: 'right', width: '60px' }}>
              {bytesToSize(item.dataSize)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
