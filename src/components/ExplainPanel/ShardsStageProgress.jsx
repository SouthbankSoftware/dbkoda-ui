/**
 * Created by joey on 6/6/17.
 */

import React from 'react';
import _ from 'lodash';
import './style.scss';
import StageProgress from './StageProgress';

export const mergeShardsStages = (shardStages) => {
  const mergedStages = [];
  let maxLength = 0;
  shardStages.map((stages) => {
    let ss = [];
    stages.stages.map((s) => {
      if (s.constructor === Array) {
        ss = ss.concat(s);
      } else {
        ss.push(s);
      }
    });
    stages.stages = ss;
    if (stages.stages.length > maxLength) {
      maxLength = stages.stages.length;
    }
  });
  if (shardStages.length === 1) {
    return [].concat(shardStages[0].stages);
  }
  const fillShardStages = shardStages.map((stages) => {
    const filtered = [].concat(stages.stages);
    const length = filtered.length;
    if (filtered.length < maxLength) {
      _.times(maxLength - length, () => filtered.unshift(null));
    }
    return {stages: filtered};
  });
  fillShardStages.map((s, i) => {
    s.stages.map((st, j) => {
      if (!mergedStages[j]) {
        mergedStages[j] = [];
        _.times(fillShardStages.length, () => mergedStages[j].push(null));
      }
      mergedStages[j][i] = st;
    });
  });
  return mergedStages;
};

export default ({executionStages, shardStages}) => {
  const mergedStages = mergeShardsStages(shardStages).concat([executionStages]);
  const shardNames = shardStages.map(shard => shard.shardName);
  return (<StageProgress stages={mergedStages} shardNames={shardNames} />);
};
