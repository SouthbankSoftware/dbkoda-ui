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
    return `Documents from previous step where scanned looking for these criteria: ${JSON.stringify(filterStr)}. Consider creating covering index on ${Object.keys(stage.filter)}`;
  }
  return 'Retrieved documents from index fetch';
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
    return 'All documents in the collection where scanned. No filter condition was specified';
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
  return 'Limited documents returned : ?';
};

const generateSkipComments = (stage) => {
  if ('skipAmount' in stage) {
    return `Skiped Forward : ${stage.skipAmount}`;
  }
  return 'Skiped Forward : ?';
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
      return 'The previous operation was sent to one or more shards';
    case SHARD_MERGE_SORT:
      return 'Output from multiple shards was merged and sorted';
    case SHARD_MERGE:
      return 'Output from multiple shards was merged';
    case KEEP_MUTATIONS:
      return 'Merge in any documents which may have been incorrectly invalidated mid-query';
    case SUBPLAN:
      return 'Selected one of multiple possible plans based on $or condition';
    case EOF:
      return 'Nothing was found: maybe collection does not exist?';
    case AND_SORTED:
      return 'Output from the previous steps was sort-merged';
    case LIMIT:
      return generateLimitComments(stage);
    case SKIP:
      return generateSkipComments(stage);
    default:
      return stageName;
  }
};
