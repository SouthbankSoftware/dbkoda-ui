const file = process.argv[2];
const sprintf = require('sprintf-js').sprintf;
/*eslint-disable */
let ddd = require('./'+file); // eslint-disable-line no-dynamic-require
/*eslint-enable */
console.log(file);
ddd.Fields.forEach((f) => {
    const line = sprintf('{{#if %s ~}},\n\t\t %s: {{%s}}{{/if ~}}', f.name, f.name, f.name);
    console.log(line);
});

