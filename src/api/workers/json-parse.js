self.addEventListener('message', (e) => {
  const jsonStr = e.data.jsonStr;
  let json = jsonStr.replace(/ObjectId\("([0-9a-z]*)"\)/gm, '"$1"')
    .replace(/NumberLong\("([0-9]*)"\)/gm, '$1')
    .replace(/NumberDecimal\("([0-9.]*)"\)/gm, '$1')
    .replace(/BinData\("([0-9a-zA-Z]*)"\)/gm, '"$1"')
    .replace(/ISODate\("([0-9a-zA-Z\-:]*)"\)/gm, '"$1"')
    .replace(/Timestamp\("([0-9], *)"\)/gm, '"$1"')
    .replace(/\n/gm, '')
    .replace(/<(.*)>/gm, (contents) => {
      return contents.replace(/(<[^>])*\/([^>]>)*/gm, '$1\\\/$2')
        .replace(/="([^"]*)"/gm, '=\\\"$1\\\"');
    });
  json = JSON.parse(json);
  self.postMessage(json);
  self.close();
}, false);
