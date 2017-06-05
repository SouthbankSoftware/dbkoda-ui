/**
 * Created by joey on 22/5/17.
 */

const SINGLE_SHARD = 'SINGLE_SHARD';
const SORT_KEY_GENERATOR = 'SORT_KEY_GENERATOR';
const IXSCAN = 'IXSCAN';
const COLLSCAN = 'COLLSCAN';
const FETCH = 'FETCH';
const SORT = 'SORT';
const SORT_MERGE = 'SORT_MERGE';
const SHARDING_FILTER = 'SHARDING_FILTER';
const SHARD_MERGE_SORT = 'SHARD_MERGE_SORT';
const SHARD_MERGE = 'SHARD_MERGE';
const KEEP_MUTATIONS = 'KEEP_MUTATIONS';
const SUBPLAN = 'SUBPLAN';
const EOF = 'EOF';
const AND_SORTED = 'AND_SORTED';
const LIMIT = 'LIMIT';
const SKIP = 'SKIP';

const generateFetchComments = (stage) => {
  if (stage.filter) {
    const filterStr = {};
    Object.keys(stage.filter).map((filter) => {
      filterStr[filter] = stage.filter[filter];
    });
    return globalString('explain/step/fetchFilter', JSON.stringify(filterStr));
  }
  return globalString('explain/step/fetchIndex');
};

const generateCollScanComments = (stage) => {
  let fullScan = false;
  const filterStr = {};
  if (stage.filter) {
    Object.keys(stage.filter).map((filter) => {
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

const generateIxscanComments = (stage) => {
  const idxName = stage.indexName || 'Unknown';
  let columnList;
  if ('keyPattern' in stage) {
    columnList = Object.keys(stage.keyPattern).join(',');
  }
  return globalString('explain/step/ixscan', idxName, columnList);
};

const generateSortComments = (stage) => {
  const sortPattern = stage.sortPattern;
  return globalString('explain/step/sort', Object.keys(sortPattern));
};

const generateLimitComments = (stage) => {
  if ('limitAmount' in stage) {
    return globalString('explain/step/limit', stage.limitAmount);
  }
  return globalString('explain/step/limit', '?');
};

const generateSkipComments = (stage) => {
  if ('skipAmount' in stage) {
    return globalString('explain/step/skip', stage.skipAmount);
  }
  return globalString('explain/step/skip', '?');
};

/**
 * generate comments for the given stage.
 *
 */
export const generateComments = (stage) => {
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
    default:
      return stageName;
  }
};
