export const DatabaseStorage = {
  // Prefill function for alter user
  dbcoda_DatabaseStorage: () => {
    return 'dbe.databaseStorage()';
  },
  dbcoda_DatabaseStorage_parse: (data) => {
    const result = {};
    const sbdb = []; // tmp store for db storage
    result.shardMap = [];
    data
      .storageByDb
      .forEach((d) => {
        sbdb.push({
          name: d.name,
          sizeOnDisk: (d.sizeOnDisk / 1048576)
        });
      });
    result.storageByDb = sbdb.sort((a, b) => {
      return (b.sizeOnDisk - a.sizeOnDisk);
    }).slice(0, 10);
    Object
      .keys(data.shardData)
      .forEach((shard) => {
        result
          .shardMap
          .push({
            shardName: shard,
            size: data.shardData[shard] / 1048576
          });
      });
    console.log(result);
    return result;
  }
};
