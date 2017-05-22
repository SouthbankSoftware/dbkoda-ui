/**
 * Created by joey on 22/5/17.
 */

const SINGLE_SHARD = 'SINGLE_SHARD';
const SORT_KEY_GENERATOR = 'SORT_KEY_GENERATOR';
const IXSCAN = 'IXSCAN';


const generateIxscanComments = (stage) => {
  const idxName = stage.indexName || 'Unknown';
  let columnList;
  if (stage.keyPattern) {
    columnList = Object.keys(stage.keyPattern).join(',');
  }
  return `Index ${idxName} was used to find matching values for ${columnList}`;
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
    default:
      return stageName;
  }
};
