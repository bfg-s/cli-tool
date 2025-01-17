module.exports = class Untag extends process.Command {

    name = 'git:untag <tag-name>';

    description = 'Git delete tag';

    arg = {
        tagName: null
    }

    async handle() {

        let dir = this.fs.base_path();

        if (this.fs.is_dir(this.fs.base_path('.git'))) {

            await this.signed_exec(
                `GIT: Local drop tag...`,
                `git tag -d ${this.arg.tagName}`,
                dir);

            await this.signed_exec(
                `GIT: Remote drop tag...`,
                `git push --delete origin ${this.arg.tagName}`,
                dir);

            this.success(`GIT: Finished drop tag...`);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
