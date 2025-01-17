module.exports = class Untag extends process.Command {

    name = 'git:untag <tag-name>';

    description = 'Git delete tag';

    arg = {
        tagName: null
    }

    async handle() {

        if (this.git.exists()) {

            await this.git.localeDropTag(this.arg.tagName);

            await this.git.remoteDropTag(this.arg.tagName);

            this.success(`GIT: Finished drop tag...`);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
