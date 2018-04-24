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
 * Created by joey on 22/5/17.
 */

import _ from 'lodash';

const SINGLE_SHARD = 'SINGLE_SHARD';
const SORT_KEY_GENERATOR = 'SORT_KEY_GENERATOR';
const IXSCAN = 'IXSCAN';
const COLLSCAN = 'COLLSCAN';
const FETCH = 'FETCH';
const SORT = 'SORT';
const SORT_MERGE = 'SORT_MERGE';
const PROJECTION = 'PROJECTION';
const SHARDING_FILTER = 'SHARDING_FILTER';
const SHARD_MERGE_SORT = 'SHARD_MERGE_SORT';
const SHARD_MERGE = 'SHARD_MERGE';
const KEEP_MUTATIONS = 'KEEP_MUTATIONS';
const SUBPLAN = 'SUBPLAN';
const EOF = 'EOF';
const AND_SORTED = 'AND_SORTED';
const LIMIT = 'LIMIT';
const SKIP = 'SKIP';
const OR = 'OR';

const generateFetchComments = stage => {
  if (stage.filter) {
    const filterStr = {};
    Object.keys(stage.filter).map(filter => {
      filterStr[filter] = stage.filter[filter];
    });
    return globalString('explain/step/fetchFilter', JSON.stringify(filterStr));
  }
  return globalString('explain/step/fetchIndex');
};

const generateCollScanComments = stage => {
  let fullScan = false;
  const filterStr = {};
  if (stage.filter) {
    Object.keys(stage.filter).map(filter => {
      filterStr[filter] = stage.filter[filter];
    });
  } else {
    fullScan = true;
  }
  if (fullScan) {
    return globalString('explain/step/collScanAll');
  }
  return globalString('explain/step/collScanFilter', JSON.stringify(filterStr));
};

const generateIxscanComments = stage => {
  const idxName = stage.indexName || 'Unknown';
  let columnList;
  if ('keyPattern' in stage) {
    columnList = Object.keys(stage.keyPattern).join(',');
  }
  return globalString('explain/step/ixscan', idxName, columnList);
};

const generateSortComments = stage => {
  const sortPattern = stage.sortPattern;
  return globalString('explain/step/sort', Object.keys(sortPattern));
};

const generateLimitComments = stage => {
  if ('limitAmount' in stage) {
    return globalString('explain/step/limit', stage.limitAmount);
  }
  return globalString('explain/step/limit', '?');
};

const generateSkipComments = stage => {
  if ('skipAmount' in stage) {
    return globalString('explain/step/skip', stage.skipAmount);
  }
  return globalString('explain/step/skip', '?');
};

const generateProjectionComments = stage => {
  let comments = stage.stage;
  if ('transformBy' in stage) {
    comments = 'Project for ';
    const keys = [];
    _.forOwn(stage.transformBy, (_, key) => {
      keys.push(key);
    });
    comments += keys.join(', ');
  }
  return comments;
};

/**
 * generate comments for the given stage.
 *
 */
export const generateComments = stage => {
  const stageName = stage.stage;
  let shard;
  switch (stageName) {
    case SINGLE_SHARD:
      shard = stage.shards && stage.shards.length > 0 && stage.shards[0];
      return globalString('explain/step/singleShard', shard.shardName);
    case IXSCAN:
      return generateIxscanComments(stage);
    case SORT_KEY_GENERATOR:
      return globalString('explain/step/generateKeys');
    case COLLSCAN:
      return generateCollScanComments(stage);
    case FETCH:
      return generateFetchComments(stage);
    case SORT:
      return generateSortComments(stage);
    case SHARDING_FILTER:
      return globalString('explain/step/shardingFilter');
    case SHARD_MERGE_SORT:
      return globalString('explain/step/shardMergeSort');
    case SHARD_MERGE:
      return globalString('explain/step/shardMerge');
    case KEEP_MUTATIONS:
      return globalString('explain/step/keepMutations');
    case SUBPLAN:
      return globalString('explain/step/subplan');
    case EOF:
      return globalString('explain/step/eof');
    case AND_SORTED:
      return globalString('explain/step/andSorted');
    case LIMIT:
      return generateLimitComments(stage);
    case SKIP:
      return generateSkipComments(stage);
    case SORT_MERGE:
      return globalString('explain/step/sortMerge');
    case PROJECTION:
      return generateProjectionComments(stage);
    case OR:
      return globalString('explain/step/or', stage.inputStages ? stage.inputStages.length : 1);
    default:
      return stageName;
  }
};

export const getCommonExecutionStages = executionStages => {
  const stages = [];
  if (executionStages) {
    let currentStage = executionStages;
    while (currentStage) {
      stages.push(currentStage);
      if (currentStage && currentStage.inputStages && currentStage.inputStages.length > 0) {
        currentStage = currentStage.inputStages;
      } else {
        currentStage = currentStage.inputStage;
      }
    }
  }
  return stages.reverse();
};

export const getShardsExecutionStages = executionStages => {
  if (executionStages && executionStages.shards) {
    return executionStages.shards.map(shard => {
      const stages = shard.winningPlan ? shard.winningPlan : shard.executionStages;
      return {
        shardName: shard.shardName,
        stages: getCommonExecutionStages(stages)
      };
    });
  }
  return [];
};

/**
 * get execution stages array
 */
export const getExecutionStages = executionStages => {
  if (executionStages && executionStages.shards) {
    return getShardsExecutionStages(executionStages);
  }
  return getCommonExecutionStages(executionStages);
};
