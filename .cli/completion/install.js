const tabtab = require('tabtab');
const colors = require("colors");

module.exports = class InstallCompletion extends process.Command {

    commandName = 'completion:install';

    commandDescription = 'Install completion for CLI';

    async handle() {

        await tabtab.install({
            name: 'cli',
            completer: 'cli',
        });

        this.success('CLI completion installed successfully!');
    }

    async validation () {

        return ! this.is_windows();
    }
}
