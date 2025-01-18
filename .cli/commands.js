module.exports = class Commands extends process.Command {

    name = 'commands';

    description = 'Commands list';

    options = [
        ['-i, --inlined', 'Show inlined commands']
    ];

    option = {
        inlined: false
    };

    handle() {

        if (! this.option.inlined) {

            let commands = this.program.commands.map(cmd => {
                return [cmd._name, cmd._description];
            });

            this.table(commands, {
                head: ['Command', 'Description']
            });
        } else {

            this.line(
                this.program.commands.map(cmd => {
                    return cmd._name;
                }).join(' ')
            );
        }
    }
}
