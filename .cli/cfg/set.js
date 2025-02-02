module.exports = class Set extends process.Command {

    commandName = 'cfg:set <name> [value]';

    commandDescription = 'Command for set config value';

    commandOptions = [
        ['-s, --store <store>', 'Set store for config save', 'tmp'],
    ];

    commandDocumentation = `If you want to set a value from environment variables, you can use the following syntax:
    ${`cli cfg:set my_name "\\\${env.USER}"`.green}
Or with a default value:
    ${`cli cfg:set my_name "\\\${env.USER || John Doe}"`.green}`;

    options = {
        store: 'tmp'
    };

    arguments = {
        name: null,
        value: null
    }

    handle() {

        this.config.setToStore(this.options.store, this.arguments.name, this.arguments.value);

        this.info('Config value set successfully!');
    }
}
