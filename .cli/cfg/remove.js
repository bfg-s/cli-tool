module.exports = class Remove extends process.Command {

    commandName = 'cfg:remove <name>';

    commandDescription = 'Command for remove config value';

    commandOptions = [
        ['-s, --store <store>', 'Set store for config save', 'tmp'],
    ];

    options = {
        store: 'tmp'
    };

    arguments = {
        name: null,
    }

    handle() {

        this.config.deleteFromStore(this.options.store, this.arguments.name);

        this.info('Config value removed successfully!');
    }
}
