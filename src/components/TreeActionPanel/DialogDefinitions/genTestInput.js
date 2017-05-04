const file = process.argv[2];
const sprintf = require('sprintf-js').sprintf;
/*eslint-disable */
let ddd = require('./'+file); // eslint-disable-line no-dynamic-require
/*eslint-enable */
console.log(file);
console.log('{');
ddd.Fields.forEach((f) => {
    const line = sprintf('\t"%s":"%s",', f.name, f.name);
    console.log(line);
});
console.log('}\n');

