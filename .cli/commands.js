module.exports = class Commands extends process.Command {

    commandName = 'commands';

    commandDescription = 'Commands list';

    commandOptions = [
        ['-l, --list', 'Show simple list of commands'],
    ];

    options = {
        list: false
    };

    handle() {

        if (! this.options.list) {

            let commands = this.commander.commands.map(cmd => {
                return [cmd._name, cmd._description];
            });

            this.table(commands, {
                head: ['Command', 'Description']
            });
        } else {

            this.line(
                this.commander.commands.map(cmd => {
                    return cmd._name;
                }).join("\n")
            );
        }
    }
}
