#!/usr/bin/env node

const path = require('path');
const rootDirName = '.cli';
const currentPath = path.join(process.cwd(), rootDirName);
const toolPath = path.join((process.main ? process.main : process.mainModule).path, rootDirName);
const homePath = path.join(process.env.HOME, rootDirName);

const Scanner = require('./scanner');
const ProgramClass = require('./program');
ProgramClass.log('CLI tool is running...');
ProgramClass.log('CLI tool load config...');
const Config = (require('./config'))
    .load(toolPath + '.json')
    .load(homePath + '.json')
    .load(currentPath + '.json');
ProgramClass.log('CLI tool config loaded...');
const Program = new ProgramClass(Config);
Program.log('CLI tool prepare...');
Program.prepare(toolPath, homePath, currentPath);
Program.log('CLI tool prepare done...');
(async () => {
    Program.log('CLI tool scan current path...');
    const currentPathCommands = await Scanner.findJsFilesWithClass(currentPath);
    Program.log('CLI tool scan tool path...');
    const toolPathCommands = await Scanner.findJsFilesWithClass(toolPath);
    Program.log('CLI tool scan home path...');
    const homePathCommands = await Scanner.findJsFilesWithClass(homePath);
    Program.log('CLI tool scan done...');
    Program.log('CLI tool apply commands to tool path...');
    Program.applyCommands(toolPathCommands, toolPath);
    Program.log('CLI tool apply commands to home path...');
    Program.applyCommands(homePathCommands, homePath);
    Program.log('CLI tool apply commands to current path...');
    Program.applyCommands(currentPathCommands, currentPath);
    Program.log('CLI tool apply commands done...');

    Program.run();
})();
