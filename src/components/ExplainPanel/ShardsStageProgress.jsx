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
  shardStages.map((s, i) => {
    if (maxLength < i) {
      maxLength = i;
    }
    s.stages.map((st, j) => {
      if (!mergedStages[j] && i === 0) {
        mergedStages[j] = st;
      } else if (i === 0 && !mergedStages[j].length) {
        mergedStages.push(st);
      } else if (!mergedStages[j] && i > 0) {
        mergedStages[j] = [];
        _.times(i, () => mergedStages[j].push(''));
        mergedStages[j].push(st);
      } else {
        mergedStages[j] = [].concat(mergedStages[j]);
        mergedStages[j] = mergedStages[j].concat(st);
      }
    });
  });
  maxLength += 1;
  if (maxLength > 0) {
    mergedStages.map((stage) => {
      const left = maxLength - stage.length;
      _.times(left, () => stage.push(''));
    });
  }
  return mergedStages;
};

export default ({executionStages, shardStages}) => {
  const mergedStages = mergeShardsStages(shardStages).concat([executionStages]);
  return (<StageProgress stages={mergedStages} />);
};
