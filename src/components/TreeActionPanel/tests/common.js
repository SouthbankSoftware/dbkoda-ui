/*
 * Run some mongo commands in the shell returning a promise that resolves to the shell output
 *
 */
// TODO: Should be integrated with mlaunch - assumes there is a mongod available

const spawn = require('child_process').spawn;

const debug = false;

module.exports = {
    mongoOutput: (cmds) => {
        return mongoPortOutputI(27017, cmds);
    },
    mongoPortOutput: (port, cmds) => {
        return mongoPortOutputI(port, cmds);
    }
};

function mongoPortOutputI(port, cmds) {
    // console.log('Connecting to mongodb on port ' + port);
    const moutput = new Promise((resolve) => {
        const mongoArgs = ['--port', port, '--shell'];
        const mongo = spawn('mongo', mongoArgs);
        mongo.stdin.write(cmds);
        mongo.stdin.write('\nexit;\n');
        let output = '';
        mongo.stderr.on('data', (data) => {
           if (debug) console.log(`stderr: ${data}`);
        });
        mongo.stdout.on('data', (stdOut) => {
            output += stdOut;
        });
        mongo.on('exit', (() => {
            resolve(output);
        }));
    });
    return (moutput);
}
