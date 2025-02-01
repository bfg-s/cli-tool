module.exports = class Eval extends process.Command {

    commandName = 'eval [name]';

    commandDescription = 'Eval JS code';

    commandOptions = [];

    arguments = {
        name: null,
    };

    async handle() {

        if (this.arguments.name) {
            this.arguments.name = this.fs.tmp_path('cliEval', this.arguments.name + `.js`);
        }

        const code = await this.editor(this.arguments.name);
        let result = null;

        if (code) {
            try {
                result = await eval(`(async () => { ${code} })()`);
            } catch (e) {
                this.error(e);
            }
        }

        if (result) {
            this.line(result);
        }
    }
}
