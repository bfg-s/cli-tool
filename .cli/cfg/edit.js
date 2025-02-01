module.exports = class Edit extends process.Command {

    commandName = 'cfg:edit';

    commandDescription = 'Command for remove config value';

    commandOptions = [
        ['-s, --store <store>', 'Set store for config save', 'tmp'],
    ];

    options = {
        store: 'tmp'
    };

    async handle() {

        const file = this.config.store[this.options.store];

        if (!file || !this.fs.is_file(file)) {

            this.exit('Store not found!');
        }

        await this.editor(file);
    }
}
