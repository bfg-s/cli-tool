module.exports = class Push extends process.Command {

    name = 'git:push';

    description = 'Git auto push';

    options = [
        ['-l, --last-message', 'Make commit with last message'],
    ];

    option = {
        lastMessage: false
    };

    async handle() {

        if (this.git.exists()) {

            const existsForCommit = await this.git.existsForCommit();

            if (existsForCommit) {

                const branch = await this.git.getCurrentBranch();

                let comment = null;

                if (this.option.lastMessage) {
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
                await this.git.push(branch);

                //this.success(`GIT: [${branch}] Pushed on repository!`);
            }

            else {

                this.warn(`GIT: Nothing to commit!`);
            }
        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
