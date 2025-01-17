#!/usr/bin/env node

const os = require('os');
const ProgramClass = require('./program');
const path = require('path');
const Command = require('./command');
const scanner = require('./scanner');
const rootDirName = '.cli';
const currentPath = path.join(process.cwd(), rootDirName);
const toolPath = path.join((process.main ? process.main : process.mainModule).path, rootDirName);
const homePath = path.join(process.env.HOME, rootDirName);
const Program = new ProgramClass();
const colors = require('colors');
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

process.Command = Command;
process.cliPaths = {currentPath, toolPath, homePath};

colors.enable();

rl.on('SIGINT', () => {
    process.exit();
});

(async () => {
    const currentPathCommands = await scanner(currentPath);
    const toolPathCommands = await scanner(toolPath);
    const homePathCommands = await scanner(homePath);

    Program.applyCommands(toolPathCommands, toolPath);
    Program.applyCommands(homePathCommands, homePath);
    Program.applyCommands(currentPathCommands, currentPath);

    Program.run();
})();
