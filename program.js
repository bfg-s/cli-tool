const { Command } = require('commander');
const program = new Command();
const ParentCommand = require('./command');
const {execSync} = require("child_process");
const path = require('path');

module.exports = class Program {
    constructor() {
        program
            .name('cli')
            .description('Bfg CLI tool for managing your projects')
            .version('1.0.0');

        program
            .option('-q, --quiet', 'Disable output messages')
            .option('-v, --verbose', 'Enable verbose mode');
    }

    applyCommands(commands, path) {
        for (const command of commands) {
            this.applyCommand(command, path);
        }
    }

    applyCommand(command, path) {

        if (typeof command.class !== 'function') {
            return;
        }

        command = new command.class(program, command.path, path);

        const requiredKeys = Object.keys(command.required);
        if (requiredKeys.length && ! this.globalPath) {
            this.globalPath = execSync(`npm root -g`).toString().trim();
        }
        for (const key of requiredKeys) {
            command[key] = this._requireForce(command.required[key]);
        }

        if (command instanceof ParentCommand) {

            const description = command.description;
            const requiredOption = command.requiredOptions;
            const options = command.options;
            const name = command.name;
            const indexFindProgram = program.commands.findIndex(
                cmd => String(cmd._name) === String(name).match(/([^ ]+) *(.*)/)[1]
            );

            if (indexFindProgram !== -1) {
                program.commands.splice(indexFindProgram, 1);
            }

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
                .option('-v, --verbose', 'Enable verbose mode');

            cmd.action(async (...args) => {

                const options = cmd.opts();
                const keys = Object.keys(options);
                for (const key of keys) {
                    command.option[key] = options[key];
                }
                const keysArgs = Object.keys(command.arg);
                let index = 0;
                for (const argument of keysArgs) {
                    command.arg[argument] = cmd.args[index] !== undefined ? cmd.args[index] : command.arg[argument];
                    index++;
                }

                await command.handle.bind(command)(...args);

                command.exit();
            });
        }
    }

    _requireForce(module) {

        const modulePath = path.join(this.globalPath, module);

        try {
            return require(modulePath);
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                execSync(`npm install -g ${module}`);
                try {
                    return require(modulePath);
                } catch (e) {

                }
            }
        }
        return {};
    }

    run() {
        program.parse(process.argv);
    }
}
