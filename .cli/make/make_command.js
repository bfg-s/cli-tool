module.exports = class MakeCommand extends process.Command {

    commandName = 'make:command [command-name]';

    commandDescription = 'Make new command';

    commandOptions = [
        ['-c, --command <command-signature>', 'Command name signature'],
        ['-d, --description <command-description>', 'Command description'],
        ['-f, --force', 'Overwrite existing command'],
        ['-i, --interface', 'Create command ".ts" interface'],
    ];

    arguments = {
        commandName: null
    }

    options = {
        command: null,
        description: 'Unknown command',
        force: false,
        interface: false,
    }

    async handle() {

        if (! this.arguments.commandName && ! this.options.interface) {
            this.exit('Command name is required');
        }

        if (this.options.interface) {
            const interfaceFile = this.path.join(__dirname, '..', '..', 'interface.ts');
            this.fs.copy(interfaceFile, this.fs.base_path('interface.ts'));
            this.success(`Interface [${this.fs.base_path('interface.ts')}] created successfully!`);
            if (! this.arguments.commandName) {
                this.exit();
            }
        }

        let ext = 'js';

        if (this.fs.exists(this.fs.base_path('package.json'))) {
            let json = this.fs.get_json_contents(this.fs.base_path('package.json'));
            if (json.type && json.type !== 'commonjs') {
                ext = 'cjs';
            }
        }

        const file = this.fs.base_path('.cli', `${this.arguments.commandName}.${ext}`);
        const exists = this.fs.exists(file);

        if (! this.options.force && exists) {
            this.error(`Command [${file}] already exists, use --force to overwrite`);
            this.exit();
        }

        const className = this.str.ucfirst(this.str.camel(this.arguments.commandName));
        const command = this.options.command || this.arguments.commandName;
        const description = this.options.description;

        await this.put_stub(file, 'make_command', {
            className, command, description
        });

        this.success(`Command [${file}] ${exists ? 'recreated' : 'created'} successfully!`);
    }
}
