module.exports = class Untag extends process.Command {

    commandName = 'git:untag <tag-name>';

    commandDescription = 'Git delete tag';

    arguments = {
        tagName: null
    }

    async handle() {

        if (this.git.exists()) {

            await this.git.localeDropTag(this.arguments.tagName);

            await this.git.remoteDropTag(this.arguments.tagName);

            this.success(`GIT: Finished drop tag...`);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
