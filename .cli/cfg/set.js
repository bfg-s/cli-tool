module.exports = class Set extends process.Command {

    commandName = 'cfg:set <name> <value>';

    commandDescription = 'Command for set config value';

    commandOptions = [
        ['-s, --store <store>', 'Set store for config save', 'tmp'],
    ];

    options = {
        store: 'tmp'
    };

    arguments = {
        name: null,
        value: null
    }

    handle() {

        this.config.setToStore(this.options.store, this.arguments.name, this.arguments.value);

        this.info('Config value set.');
    }
}
