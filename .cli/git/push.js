module.exports = class Push extends process.Command {

    commandName = 'git:push';

    commandDescription = 'Git auto push';

    commandOptions = [
        ['-l, --last-message', 'Make commit with last message'],
    ];

    options = {
        lastMessage: false
    };

    async handle() {

        if (this.git.exists()) {

            const existsForCommit = await this.git.existsForCommit();

            const branch = await this.git.getCurrentBranch();

            if (existsForCommit) {

                let comment = null;

                if (this.options.lastMessage) {
                    comment = await this.git.getLastCommitMessage(comment);
                }

                if (! comment) {
                    comment = await this.git.generateMessageForCommit();
                }

                const answer = await this.prompts({
                    type: 'text',
                    name: 'comment',
                    message: `GIT: [${branch}] Commit message?`,
                    initial: comment
                });

                comment = answer.comment ? answer.comment : comment;

                await this.git.add(branch);
                await this.git.commit(branch, comment);
            }

            else {

                this.warn(`GIT: Nothing to commit!`);
            }

            try {
                await this.git.push(branch);
            } catch (e) {
                this.line(e.message);
            }

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
