module.exports = class Commands extends process.Command {

    name = 'commands';

    description = 'Commands list';

    options = [
        ['-l, --list', 'Show simple list of commands'],
    ];

    option = {
        list: false
    };

    handle() {

        if (! this.option.list) {

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
