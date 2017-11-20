/**
 * Created by joey on 6/6/17
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

import React from 'react';
import './style.scss';

const getAllShardStatistics = (explains) => {
  const shards = explains.executionStats.executionStages.shards;
  const allShards = [];
  shards.map((shard) => {
    const oneShard = [];
    let cursor = shard.executionStages;
    let executionTime = 0;
    while (cursor) {
      oneShard.push(cursor);
      let time = cursor.executionTimeMillisEstimate;
      if (time === undefined) {
        time = cursor.executionTimeMillis;
      } else if (cursor.executionTimeMillis !== undefined) {
        time = Math.max(time, cursor.executionTimeMillis);
      }
      if (time > executionTime) {
        executionTime = time;
      }
      if (!cursor.inputStage && cursor.inputStages && cursor.inputStages.constructor === Array) {
        let examined = 0;
        let nReturned = 0;
        cursor.inputStages.map((input) => {
          examined += input.keysExamined;
          nReturned += input.nReturned;
        });
        oneShard.push({ docsExamined: examined, nReturned });
      }
      cursor = cursor.inputStage;
    }
    // get the executionTimeMillisEstimate and nReturned from the first child, docsExamined from the deepest child
    oneShard[0].docsExamined = oneShard[oneShard.length - 1].docsExamined
      ? oneShard[oneShard.length - 1].docsExamined
      : oneShard[oneShard.length - 1].keysExamined;
    oneShard[0].shardName = shard.shardName;
    oneShard[0].executionTime = executionTime;
    allShards.push(oneShard);
  });
  return allShards;
};

export const getWorstShardStatistics = (explains) => {
  const allShards = getAllShardStatistics(explains);
  const worstShards = [];
  allShards.map((shards) => {
    worstShards.push(shards[0]);
  });
  return worstShards;
};

/**
 * shard statistic view panel
 */
export default ({ explains }) => {
  const shardStatistics = getWorstShardStatistics(explains);
  return (
    <div className="explain-shards-statistic-view">
      <div className="header">
        <div className="column">{globalString('explain/statistics/shard')}</div>
        <div className="column">{globalString('explain/statistics/examined')}</div>
        <div className="column">{globalString('explain/statistics/returned')}</div>
        <div className="column">{globalString('explain/statistics/ms')}</div>
      </div>
      {shardStatistics.map((shard) => {
        return (
          <div className="row" key={shard.shardName}>
            <div className="cell">{shard.shardName}</div>
            <div className="cell">{shard.docsExamined}</div>
            <div className="cell">{shard.nReturned}</div>
            <div className="cell">{shard.executionTime}</div>
          </div>
        );
      })}
    </div>
  );
};
