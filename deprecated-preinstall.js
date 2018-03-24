var sys = require('util')
var child_process = require('child_process')
var exec = child_process.exec;

function puts(error, stdout, stderr) { console.log(stdout) }

var os = require('os');
//control OS
//then run command depengin on the OS

if (os.type() === 'Linux')
    exec("node setup-linux.js", puts);
else if (os.type() === 'Darwin')
    exec("node setup-mac.js", puts);
else if (os.type() === 'Windows_NT')
    exec("superhero.bat", puts);
else
    throw new Error("Unsupported OS found: " + os.type());