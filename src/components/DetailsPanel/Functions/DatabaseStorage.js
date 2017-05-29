
export const DatabaseStorage = {
  // Prefill function for alter user
  dbcoda_DatabaseStorage: () => {
    return 'dbe.databaseStorage()';
  },
  dbcoda_DatabaseStorage_parse: (data) => {
    const result = {};
    result.storageByDb = [];
    result.shardMap = [];
    data.storageByDb.forEach((d) => {
        result.storageByDb.push(
            {
                name:d.name,
                sizeOnDisk:(d.sizeOnDisk / 1048576)
            }
        );
    });
    Object.keys(data.shardData).forEach((shard) => {
        result.shardMap.push({
            shardName:shard,
            size:data.shardData[shard] / 1048576
        });
    });
    console.log(result);
    return result;
  }
};
