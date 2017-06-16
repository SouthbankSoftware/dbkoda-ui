// Run this in mongo to check that we can parse attributes
// eslint-disable

function dbkodaListAttributes_parse(res) { //eslint-disable-line
  // Print attributes to one level (eg xxx.yyy but not xxx.yyy.zzz)
  // console.log(res);
  const attributes = {};
  res.forEach((doc) => {
    Object.keys(doc).forEach((key) => {
      let keytype = typeof doc[key];
      if (doc[key]) {
        if (doc[key].constructor === Array) {
          keytype = 'array';
        }
      }
      attributes[key] = keytype;
      if (keytype == 'object') {
        const obj = doc[key];
        if (obj) {
          Object.keys(obj).forEach((nestedKey) => {
            attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
          });
        }
      } else
      if (keytype === 'array') {
        const docarray = doc[key];
        docarray.forEach((nestedDoc) => {
          const obj = nestedDoc;
          Object.keys(obj).forEach((nestedKey) => {
            attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
          });
        });
      }
    });
  });
  const results = Object.keys(attributes).sort();
 // console.log('listAttributes returning ' + results.length);
  return results;
}

db.getSiblingDB('SampleCollections').getCollectionNames().forEach((collection) => {
  print(collection);
  const x = db.getSiblingDB('SampleCollections').getCollection(collection).aggregate([{
    $sample: {
      size: 20
    }
  }]).toArray();
  dbkodaListAttributes_parse(x).forEach((att) => {
    print('   ' + att);
  });
});
