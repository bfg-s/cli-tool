module.exports = class Doc extends process.Command {

    commandName = 'doc <command>';

    commandDescription = 'Unknown command';

    commandOptions = [];

    arguments = {
        command: ''
    }

    async handle() {

        const command = this.arguments.command;
        const cmd = this.lodash.find(this.commander.commands, {_name: command});

        if (cmd) {

            this.line(`${cmd.generalCommandClass.commandName}`);
            this.line(`${cmd.generalCommandClass.commandDescription}`);

            if (cmd.generalCommandClass.commandDocumentation) {

                this.line(cmd.generalCommandClass.commandDocumentation);
            }

        } else {

            this.error(`Command "${command}" not found!`);
        }
    }
}
