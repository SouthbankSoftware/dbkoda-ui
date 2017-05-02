/*
 * Run some mongo commands in the shell returning a promise that resolves to the shell output
 * 
 */
//TODO: Should be integrated with mlaunch - assumes there is a mongod available 

const spawn = require('child_process').spawn;
const glob = require('glob');
const path = require('path');

module.exports = {
    mongoOutput: function(cmds) {
        const moutput = new Promise((resolve) => {
            const parentDir = path.normalize(__dirname + '/../');
            glob(parentDir + '/functions/*.js', (err, mongoFunctions) => {
                // console.log(mongoFunctions); 
                let mongoArgs=['--shell'];
                mongoArgs.push(mongoFunctions); 
                const mongo = spawn('mongo', []);
                mongo.stdin.write(cmds);
                mongo.stdin.write('\nexit;\n');
                let output = '';
                mongo.stdout.on('data', (stdOut) => {
                    output += stdOut;
                    // console.log('output'); 
                });
                mongo.on('exit', (() => {
                    resolve(output);
                }));
            });
        });
        return (moutput);
    }
};
