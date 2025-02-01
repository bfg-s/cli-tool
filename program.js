const { Command } = require('commander');
const program = new Command();
const ParentCommand = require('./command');
const {execSync, spawn} = require("child_process");
const path = require('path');
const CommandParent = require('./command');
const fs = require('fs');
const os = require('os');
const colors = require('colors');
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const argsInline = process.argv.join(" ") + " ";

let lastLogTime = Date.now();

module.exports = class Program {
    constructor(config, startTime) {
        program
            .name('cli')
            .description('Bfg CLI tool for managing your projects')
            .version('1.0.0');

        program
            .option('-q, --quiet', 'Disable output messages')
            .option('-v, --verbose', 'Enable verbose mode');

        this.config = config;
        this.program = program;
        this.startTime = startTime;
    }

    prepare () {
        process.Command = CommandParent;

        colors.enable();

        if (
            ! this.config.has(this.config.NPM_GLOBAL_HASH)
            || this.config.getNpmGlobalHash(true) !== this.config.getNpmGlobalHash()
        ) {

            this.config.updateGlobalHash();
            this.config.updateIncludedPaths();
        }
    }

    async applyCommands(commands, path) {
        for (const command of commands) {
            await this.applyCommand(command, path);
        }
    }

    async applyCommand(commandSchema, path) {

        const command = this._createCommand(commandSchema, path);

        if (command instanceof ParentCommand) {

            if (await command.validation()) {

                this._setupCommand(command);
            }
        }
    }

    _createCommand(command, path) {

        if (typeof command.class !== 'function' || typeof command.path !== 'string') {
            return null;
        }

        this.log(`Create command ${command.path}...`);

        command = new command.class(this, program, this.config, command.path, path, rl);

        return command;
    }

    _setupCommand(command) {

        const description = command.commandDescription;
        const requiredOption = command.commandRequiredOptions;
        const options = command.commandOptions;
        const name = command.commandName;

        this.log(`Setup command ${name}...`);

        this._deleteExistsCommand(name);



        const cmd = program.command(name);

        cmd.generalCommandClass = command;
        cmd.originalName = name;

        if (description) {
            cmd.description(description);
        }

        if (Array.isArray(requiredOption) && requiredOption.length) {
            for (const [flags, description, defaultValue] of requiredOption) {
                cmd.requiredOption(flags, description, defaultValue);
            }
        }

        if (Array.isArray(options) && options.length) {
            for (const [flags, description, defaultValue] of options) {
                cmd.option(flags, description, defaultValue);
            }
        }

        cmd
            .option('-q, --quiet', 'Disable output messages')
            .option('-v, --verbose', 'Enable verbose mode');

        if (! command.is_windows()) {
            cmd.option('--alias <alias>', 'Add alias for command');
        }

        cmd.action(async (...args) => {

            return await command._defaultAction(args, cmd);
        });
    }

    _deleteExistsCommand(name) {

        const indexFindProgram = program.commands.findIndex(
            cmd => String(cmd._name) === String(name).match(/([^ ]+) *(.*)/)[1]
        );

        if (indexFindProgram !== -1) {
            this.log(`Command ${name} already exists. Remove...`);
            program.commands.splice(indexFindProgram, 1);
        }
    }

    _addAlias(alias, command) {
        const shell = process.env.SHELL || '';
        let rcFile;

        if (shell.includes('zsh')) {
            rcFile = path.join(os.homedir(), '.zshrc');
        } else if (shell.includes('bash')) {
            rcFile = path.join(os.homedir(), '.bashrc');
        } else {
            rcFile = path.join(os.homedir(), '.profile');
        }

        const aliasCommand = `alias ${alias}='cli ${command}'`;

        if (fs.existsSync(rcFile)) {
            const content = fs.readFileSync(rcFile, 'utf8');
            if (content.includes(aliasCommand)) {
                console.log(`Alias "${alias}" already exists in ${rcFile}.`);
                return;
            }
        }

        fs.appendFileSync(rcFile, `\n${aliasCommand}\n`);
        console.log(`Alias "${alias}" added in ${rcFile}.`);

        console.log(
            `Please, run command: ${colors.green(`source ${rcFile}`)} for apply changes.`
        );
    }

    log(message) {
        this.constructor.log(message);
    }

    static log(message) {
        if (! this.isQuiet() && this.isVerbose()) {
            const now = Date.now();
            const elapsed = now - lastLogTime;

            console.log(`[CLI][${elapsed} ms]`, message);

            lastLogTime = now;
        }
    }

    static isVerbose() {
        return argsInline.includes(" -v ") || argsInline.includes(" --verbose ");
    }

    static isQuiet() {
        return argsInline.includes(" -q ") || argsInline.includes(" --quiet ");
    }

    async run() {
        await program.parseAsync(process.argv);
        process.exit();
    }
}
