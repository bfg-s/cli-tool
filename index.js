#!/usr/bin/env node

const startTime = Date.now();
const path = require('path');
const rootDirName = '.cli';
const currentPath = path.join(process.cwd(), rootDirName);
const toolPath = path.join((process.main ? process.main : process.mainModule).path, rootDirName);
const homePath = path.join(process.env.HOME, rootDirName);
const tmpPath = path.join(process.env.TMPDIR, rootDirName);

const Scanner = require('./scanner');
const ProgramClass = require('./program');
ProgramClass.log('Running...');
ProgramClass.log('Load config...');
const Config = (require('./config'))
    .load(toolPath + '.json', 'tool')
    .load(homePath + '.json', 'home')
    .load(currentPath + '.json', 'current')
    .load(tmpPath + '.json', 'tmp');
ProgramClass.log('Config loaded...');
const Program = new ProgramClass(Config, startTime);
Program.log('Prepare...');
Program.prepare(toolPath, homePath, currentPath, tmpPath);
Program.log('Prepare done...');
(async () => {
    Program.log('Scan current path...');
    const currentPathCommands = await Scanner.findJsFilesWithClass(currentPath);
    Program.log('Scan tool path...');
    const toolPathCommands = await Scanner.findJsFilesWithClass(toolPath);
    Program.log('Scan home path...');
    const homePathCommands = await Scanner.findJsFilesWithClass(homePath);
    Program.log('Scan done...');
    Program.log('Apply commands to tool path...');
    Program.applyCommands(toolPathCommands, toolPath);
    Program.log('Apply commands to home path...');
    Program.applyCommands(homePathCommands, homePath);
    Program.log('Apply commands to current path...');
    Program.applyCommands(currentPathCommands, currentPath);
    Program.log('Apply commands done...');
    Program.log('Run program...');
    Program.run();
})();
