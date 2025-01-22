const { Command } = require('commander');
const program = new Command();
const ParentCommand = require('./command');
const {execSync} = require("child_process");
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

    applyCommands(commands, path) {
        for (const command of commands) {
            this.applyCommand(command, path);
        }
    }

    applyCommand(commandSchema, path) {

        const command = this._createCommand(commandSchema, path);

        if (command instanceof ParentCommand) {

            this._setupCommand(command);
        }
    }

    _createCommand(command, path) {

        if (typeof command.class !== 'function' || typeof command.path !== 'string') {
            return null;
        }

        this.log(`Create command ${command.path}...`);

        command = new command.class(this, program, this.config, command.path, path);

        return command;
    }

    _setupCommand(command) {

        const description = command.description;
        const requiredOption = command.requiredOptions;
        const options = command.options;
        const name = command.name;

        this.log(`Setup command ${name}...`);

        this._deleteExistsCommand(name);

        const cmd = program.command(name);

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
            .option('-v, --verbose', 'Enable verbose mode')
            .option('-a, --alias <alias>', 'Add alias for command');

        cmd.action(async (...args) => {

            const requiredKeys = Object.keys(command.required);

            for (const key of requiredKeys) {
                command[key] = this._requireForce(command.required[key]);
            }

            rl.on('SIGINT', () => {
                command.outsFunction.map((out) => {
                    out();
                });
                process.exit();
            });

            await this._defaultAction(args, command, cmd);
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

    async _defaultAction (args, command, cmd) {

        const options = cmd.opts();

        if (options.alias) {

            this._addAlias(options.alias, cmd._name);

        } else {

            this.log('Command action started...');

            const keys = Object.keys(options);
            for (const key of keys) {
                command.option[key] = options[key];
            }
            const keysArgs = Object.keys(command.arg);

            let index = 0;
            for (const argument of keysArgs) {
                command.arg[argument] = cmd.processedArgs[index] !== undefined ? cmd.processedArgs[index] : command.arg[argument];
                index++;
            }

            await command.handle.bind(command)(...args);
        }

        const elapsed = Date.now() - this.startTime;
        this.log('Finished.');
        this.log(`Total time: ${elapsed} ms`);

        command.exit();
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

    _requireForce(module) {

        if (! this.globalPath) {
            this.globalPath = this.config.getNpmGlobalPath();
        }

        const modulePath = path.join(this.globalPath, module);

        try {
            this.log(`Try to require module: ${module}`);
            const result = require(modulePath);
            this.log(`Module ${module} included.`);
            return result;
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                this.log(`Module ${module} not found. Try to install...`);
                execSync(`npm install -g ${module}`);
                try {
                    this.log(`Try to require module: ${module} again`);
                    return require(modulePath);
                } catch (e) {
                    this.log(`Module ${module} not found.`);
                }
            }
        }
        return null;
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

    run() {
        program.parse(process.argv);
    }
}
