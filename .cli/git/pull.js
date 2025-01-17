module.exports = class Pull extends process.Command {

    name = 'git:pull';

    description = 'Git auto pull';

    async handle() {

        if (this.git.exists()) {

            const branch = await this.git.getCurrentBranch();

            await this.git.pull(branch);

            this.success(`GIT: [${branch}] Pulled from repository!`);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
