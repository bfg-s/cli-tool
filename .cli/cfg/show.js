module.exports = class Show extends process.Command {

    name = 'cfg:show <name>';

    description = 'Command for show config value';

    arg = {
        name: null,
    }

    handle() {

        this.info(`Config value [${this.arg.name}]: ${this.config.get(this.arg.name)}`);
    }
}
