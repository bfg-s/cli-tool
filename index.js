#!/usr/bin/env node

const startTime = Date.now();
const path = require('path');
const os = require('os');
const rootDirName = '.cli';
const currentPath = path.join(process.cwd(), rootDirName);
const toolPath = path.join(__dirname, rootDirName);
const homePath = path.join(os.homedir(), rootDirName);
const tmpPath = path.join(os.tmpdir(), rootDirName);
const Scanner = require('./scanner');
const ProgramClass = require('./program');

ProgramClass.log('Running...');
ProgramClass.log('Load configs...');

const Config = require('./config')
    .setLog(ProgramClass)

    .set('root.dir-name', rootDirName)
    .set('paths.current', currentPath)
    .set('paths.tool', toolPath)
    .set('paths.home', homePath)
    .set('paths.tmp', tmpPath)

    .load(toolPath + '.json', 'tool')
    .load(tmpPath + '.json', 'tmp')
    .load(homePath + '.json', 'home')
    .load(currentPath + '.json', 'current');

const Program = new ProgramClass(Config, startTime);
Program.log('Prepare...');
Program.prepare();

(async () => {

    Program.log(`Scan ${currentPath} path...`);
    const currentPathCommands = await Scanner.findJsFilesWithClass(currentPath);
    Program.log(`Scan ${toolPath} path...`);
    const toolPathCommands = await Scanner.findJsFilesWithClass(toolPath);
    Program.log(`Scan ${homePath} path...`);
    const homePathCommands = await Scanner.findJsFilesWithClass(homePath);

    const includedPaths = Config.getIncludedDirs();
    const includedPathsCommands = [];

    for (const includedPath of includedPaths) {
        const globalPath = Config.getNpmGlobalPath();
        const included = path.join(globalPath, includedPath);
        Program.log(`Scan ${included} path...`);
        includedPathsCommands.push({
            path: included,
            commands: await Scanner.findJsFilesWithClass(included)
        });
    }

    Program.log(`Apply commands to ${toolPath} path...`);
    Program.applyCommands(toolPathCommands, toolPath);
    Program.log(`Apply commands to ${homePath} path...`);
    Program.applyCommands(homePathCommands, homePath);
    Program.log(`Apply commands to ${currentPath} path...`);
    Program.applyCommands(currentPathCommands, currentPath);

    for (const includedPathCommands of includedPathsCommands) {
        Program.log(`Apply commands to ${includedPathCommands.path} path...`);
        Program.applyCommands(includedPathCommands.commands, includedPathCommands.path);
    }

    Program.log('Run command...');
    await Program.run();
})();

module.exports = Program;
