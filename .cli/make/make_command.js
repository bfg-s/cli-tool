module.exports = class MakeCommand extends process.Command {

    name = 'make:command [command-name]';

    description = 'Make new command';

    options = [
        ['-c, --command <command-signature>', 'Command name signature'],
        ['-d, --description <command-description>', 'Command description'],
        ['-f, --force', 'Overwrite existing command'],
        ['-i, --interface', 'Create command ".ts" interface'],
    ];

    arg = {
        commandName: null
    }

    option = {
        command: null,
        description: 'Unknown command',
        force: false,
        interface: false,
    }

    async handle() {

        if (! this.arg.commandName && ! this.option.interface) {
            this.exit('Command name is required');
        }

        if (this.option.interface) {
            const interfaceFile = this.path.join(__dirname, '..', '..', 'interface.ts');
            this.fs.copy(interfaceFile, this.fs.base_path('interface.ts'));
            this.success(`Interface [${this.fs.base_path('interface.ts')}] created successfully!`);
            if (! this.arg.commandName) {
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

        const file = this.fs.base_path('.cli', `${this.arg.commandName}.${ext}`);
        const exists = this.fs.exists(file);

        if (! this.option.force && exists) {
            this.error(`Command [${file}] already exists, use --force to overwrite`);
            this.exit();
        }

        const className = this.str.ucfirst(this.str.camel(this.arg.commandName));
        const command = this.option.command || this.arg.commandName;
        const description = this.option.description;

        await this.put_stub(file, 'make_command', {
            className, command, description
        });

        this.success(`Command [${file}] ${exists ? 'recreated' : 'created'} successfully!`);
    }
}
