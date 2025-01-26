module.exports = class Pull extends process.Command {

    commandName = 'git:pull';

    commandDescription = 'Git auto pull';

    async handle() {

        if (this.git.exists()) {

            const branch = await this.git.getCurrentBranch();

            await this.git.pull(branch);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
