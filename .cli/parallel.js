const os = require('os');

module.exports = class Parallel extends process.Command {

    commandName = 'parallel [commands...]';

    commandDescription = 'Compact call of commands together';

    commandOptions = [
        ['-i, --immortal', 'Keep alive all process'],
        ['-t, --tries <tries>', 'Tries to repeat command if error (no limit if 0)', 0],
        ['-f, --file <file>', 'File to execute'],
        ['-c, --create', 'Create file with commands list'],
        ['-g, --global', 'Global file with commands list'],
        ['-d, --directory <directory>', 'Directory to execute', this.pwd]
    ];

    arguments = {
        commands: []
    };

    options = {
        immortal: false,
        file: null,
        create: false,
        global: false,
        directory: this.pwd,
        tries: 0,
    };

    async handle() {

        await this.parseFile(this.options.file);

        if (! this.arguments.commands || ! this.arguments.commands.length) {
            this.error('Enter at least one command');
            this.exit();
        }

        const promises = [];
        const shell = os.platform() === 'win32' ? 'cmd.exe' : 'sh';
        const shellArg = os.platform() === 'win32' ? '/c' : '-c';

        this.checkRepeats();

        this.arguments.commands.forEach(command => {
            if (! command) return false;
            command = String(command).trim();
            let immortal = this.options.tries ? true : this.options.immortal;
            const matches = command.match(/^t\d+\s/);
            let tries = this.options.tries;
            if (matches) {
                tries = Number(matches[0].replace('t', ''));
                command = command.replace(matches[0], '').trim();
                immortal = true;
            }
            if (command.startsWith('@')) {
                command = command.replace('@', '').trim();
                immortal = true;
            }
            if (command.startsWith('!')) {
                command = command.replace('!', '').trim();
                immortal = false;
            }
            let errors = 0;
            const restoredFunction = async () => {
                try {
                    await this.spawn(
                        shell,
                        [shellArg, command],
                        this.options.directory,
                        this.quiet ? null : 'inherit'
                    );
                } catch (e) {
                    if (this.quiet) {
                        this.error('Error:', e.message.reset);
                    }
                    errors++;
                }
                if (immortal && (tries === 0 || errors < tries)) {
                    await restoredFunction();
                }
            };
            promises.push(restoredFunction());
        });

        await Promise.all(promises);
    }

    async parseFile (fileName) {
        if (fileName) {
            let file = this.options.global
                ? this.fs.path(os.homedir(), '.' + fileName + '.parallel')
                : this.fs.path(this.options.directory, '.' + fileName + '.parallel');

            const fileExists = this.fs.exists(file);
            if (! this.options.create && fileExists) {
                const content = this.fs.get_contents(file);
                const commands = content.replace(/\\\n/g, '').split('\n').filter(Boolean).map(command => {
                    return command.trim();
                });
                this.arguments.commands = this.arguments.commands.concat(commands);
            } else {
                if (this.options.create) {
                    if (this.arguments.commands.length) {
                        this.fs.put_contents(file, this.arguments.commands ? this.arguments.commands.join('\n') : '');
                        this.success(`File [${file}] ${fileExists ? 'updated':'created'} successfully!`);
                        this.exit();
                    } else {
                        this.error(`Enter at least one command to save in file [${file}]`);
                        this.exit();
                    }
                } else {
                    this.error(`File [${file}] not found!`);
                    this.exit();
                }
            }
        } else {
            if (this.options.create) {
                this.error('Enter file name to create with (-f, --file) option');
                this.exit();
            }
        }
    }

    checkRepeats () {
        this.arguments.commands = this.arguments.commands.map(command => {
            const matches = command.match(/^x\d+/);
            if (matches) {
                const times = Number(matches[0].replace('x', ''));
                const otherCommand = command.replace(matches[0], '').trim();
                const commands = [];
                for (let i = 0; i < times; i++) {
                    commands.push(this.str.replace_tags(otherCommand, {
                        'p-index': i+1,
                        'p-iteration': i,
                    }));
                }
                return commands;
            }
            return [this.str.replace_tags(command, {
                'p-index': 1,
                'p-iteration': 0,
            })];
        }).filter(Boolean).flat().filter(Boolean);
    }
}
