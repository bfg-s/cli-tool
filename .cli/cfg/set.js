module.exports = class Set extends process.Command {

    name = 'cfg:set <name> <value>';

    description = 'Command for set config value';

    options = [
        ['-s, --store <store>', 'Set store for config save', 'tmp'],
    ];

    option = {
        store: 'tmp'
    };

    arg = {
        name: null,
        value: null
    }

    handle() {

        this.config.setToStore(this.option.store, this.arg.name, this.arg.value);

        this.info('Config value set.');
    }
}
