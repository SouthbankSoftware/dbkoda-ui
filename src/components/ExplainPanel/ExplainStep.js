/**
 * Created by joey on 22/5/17.
 */

const SINGLE_SHARD = 'SINGLE_SHARD';
const SORT_KEY_GENERATOR = 'SORT_KEY_GENERATOR';
const IXSCAN = 'IXSCAN';
const COLLSCAN = 'COLLSCAN';
const FETCH = 'FETCH';
const SORT = 'SORT';
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
    return `Documents from previous step where scanned looking for these criteria: ${JSON.stringify(filterStr)}.`;
  }
  return globalString('explain/comments/fetch/index');
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
    return globalString('explain/comments/collscan/fullscan');
  }
  return `Documents were scanned looking for these criteria: ${JSON.stringify(filterStr)}`;
};

const generateIxscanComments = (stage) => {
  const idxName = stage.indexName || 'Unknown';
  let columnList;
  if ('keyPattern' in stage) {
    columnList = Object.keys(stage.keyPattern).join(',');
  }
  return `Index ${idxName} was used to find matching values for ${columnList}`;
};

const generateSortComments = (stage) => {
  const sortPattern = stage.sortPattern;
  return `Documents were sorted on : ${Object.keys(sortPattern)}. Consider creating index on ${Object.keys(sortPattern)} to support the sort`;
};

const generateLimitComments = (stage) => {
  if ('limitAmount' in stage) {
    return `Limited documents returned : ${stage.limitAmount}`;
  }
  return globalString('explain/comments/limit/error');
};

const generateSkipComments = (stage) => {
  if ('skipAmount' in stage) {
    return `Skiped Forward : ${stage.skipAmount}`;
  }
  return globalString('explain/comments/skip/error');
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
      return `A single shard ${shard.shardName} was involved in the query `;
    case IXSCAN:
      return generateIxscanComments(stage);
    case SORT_KEY_GENERATOR:
      return 'Generate keys for the next sort step';
    case COLLSCAN:
      return generateCollScanComments(stage);
    case FETCH:
      return generateFetchComments(stage);
    case SORT:
      return generateSortComments(stage);
    case SHARDING_FILTER:
      return globalString('explain/comments/shard/filter');
    case SHARD_MERGE_SORT:
      return globalString('explain/comments/shard/mergesort');
    case SHARD_MERGE:
      return globalString('explain/comments/shard/merge');
    case KEEP_MUTATIONS:
      return globalString('explain/comments/keepmutation');
    case SUBPLAN:
      return globalString('explain/comments/subplan');
    case EOF:
      return globalString('explain/comments/eof');
    case AND_SORTED:
      return globalString('explain/comments/andsorted');
    case LIMIT:
      return generateLimitComments(stage);
    case SKIP:
      return generateSkipComments(stage);
    default:
      return stageName;
  }
};
