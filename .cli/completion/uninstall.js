const tabtab = require('tabtab');

module.exports = class UninstallCompletion extends process.Command {

    commandName = 'completion:uninstall';

    commandDescription = 'Uninstall completion for CLI';

    async handle() {

        await tabtab.uninstall({
            name: 'cli',
        });

        this.success('CLI completion uninstalled successfully!');
    }
}
