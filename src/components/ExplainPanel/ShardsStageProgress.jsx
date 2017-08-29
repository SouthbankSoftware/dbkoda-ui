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
 * Created by joey on 6/6/17.
 */

import React from 'react';
import _ from 'lodash';
import './style.scss';
import StageProgress from './StageProgress';

export const mergeShardsStages = (shardStages) => {
  console.log('merging shard stages ', shardStages);
  const mergedStages = [];
  let maxLength = 0;
  let maxHeight = 1; // the max height of each shard, it should be 1 unless there is or stage
  const shardHeight = {}; // store each shard height in case there is an array of stages; otherwise it should be 1
  shardStages.map((stages) => {
    const ss = [];
    stages.stages.map((s) => {
      if (s.constructor === Array) {
        if (maxHeight < s.length) {
          maxHeight = s.length;
        }
        shardHeight[stages.shardName] = s.length;
        s.map((innerStage) => {
          innerStage.shardName = stages.shardName;
        });
      } else {
        s.shardName = stages.shardName;
        if (!shardHeight[stages.shardName]) {
          shardHeight[stages.shardName] = 1;
        }
      }
      ss.push(s);
    });
    stages.stages = ss;
    if (stages.stages.length > maxLength) {
      maxLength = stages.stages.length;
    }
  });
  if (shardStages.length === 1) {
    return {mergedStages: [].concat(shardStages[0].stages)};
  }
  const fillShardStages = shardStages.map((stages) => {
    const filtered = [].concat(stages.stages);
    const length = filtered.length;
    if (filtered.length < maxLength) {
      _.times(maxLength - length, () => filtered.unshift(null));
    }
    return {stages: filtered};
  });
  console.log('file shards', fillShardStages);
  fillShardStages.map((s) => {
    s.stages.map((st, j) => {
      if (!mergedStages[j]) {
        mergedStages[j] = [];
      }
      mergedStages[j].push(st);
    });
  });
  const finalStages = mergedStages.map((stages) => {
    let length = 1;
    stages.map((subStages) => {
      if (subStages && subStages.constructor === Array && subStages.length > length) {
        length = subStages.length;
      }
    });
    return stages.map((subStages) => {
      if (subStages === null && length > 1) {
        const newStages = [];
        _.times(length, () => newStages.push(null));
        return newStages;
      }
      if (subStages && subStages.constructor === Array) {
        _.times(length - subStages.length, () => subStages.push(null));
      }
      return subStages;
    });
  });
  console.log('final stages ', finalStages);
  return {mergedStages: finalStages, shardHeight};
};

export default ({executionStages, shardStages}) => {
  const ms = mergeShardsStages(shardStages);
  const mergedStages = ms.mergedStages.concat([executionStages]);
  const shardNames = shardStages.map(shard => shard.shardName);
  console.log('merged stages:', mergedStages);
  return (<StageProgress stages={mergedStages} shardHeight={ms.shardHeight} shardNames={shardNames} shardNumber={shardStages.length} />);
};
