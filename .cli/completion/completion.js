const tabtab = require('tabtab');

module.exports = class InstallCompletion extends process.Command {

    commandName = 'completion [env...]';

    commandDescription = 'CLI completion';

    arguments = {
        env: []
    }

    async handle() {

        const env = tabtab.parseEnv(process.env);

        this.completion(env);
    }

    async validation () {

        return ! this.is_windows();
    }

    completion (env) {

        if (!env.complete) return;

        if (this.arguments.env[1]) {

            for (const cmd of this.commander.commands) {
                if (cmd._name === this.arguments.env[1]) {
                    const result = [];
                    for (const opt of cmd.options) {
                        let hidden = false;
                        const has = this.arguments.env.includes(opt.long) || this.arguments.env.includes(opt.short);
                        if (! has) {
                            result.push({name: opt.long, description: opt.description});
                        } else {
                            hidden = true;
                        }
                        if (opt.short && ! has && ! hidden) {
                            result.push({name: opt.short, description: opt.description});
                        }
                    }
                    const hasHelp = this.arguments.env.includes('--help') || this.arguments.env.includes('-h');
                    if (! hasHelp) result.push({name: '--help', description: 'Display help for command'});
                    if (! hasHelp) result.push({name: '-h', description: 'Display help for command'});
                    return tabtab.log(result);
                }
            }
        }

        const commands = this.commander.commands.map(command => {
            if (command._name === 'completion') {
                return null;
            }
            return {name: command._name, description: command._description};
        }).filter(Boolean);

        commands.push({name: '--version', description: 'Output the version number'});
        commands.push({name: '--help', description: 'Display help for command'});
        commands.push({name: '--quiet', description: 'Disable output messages'});
        commands.push({name: '--verbose', description: 'Enable verbose mode'});

        return tabtab.log(commands);
    }
}
