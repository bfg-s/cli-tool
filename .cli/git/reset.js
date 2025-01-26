module.exports = class Reset extends process.Command {

    commandName = 'git:reset';

    commandDescription = 'Git reset';

    commandOptions = [
        ['--mixed', 'Reset HEAD and index'],
        ['--soft', 'Reset HEAD only'],
        ['--hard', 'Reset HEAD, index and working directory'],
        ['--merge', 'Reset HEAD, index and working directory'],
        ['--keep', 'Reset HEAD but keep local changes'],
    ];

    options = {
        mixed: false,
        soft: false,
        hard: false,
        merge: false,
        keep: false,
    }

    async handle() {

        if (this.git.exists()) {

            await this.git.reset(this.mode);

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }

    get mode () {
        if (this.options.mixed) {return 'mixed';}
        if (this.options.soft) {return 'soft';}
        if (this.options.hard) {return 'hard';}
        if (this.options.merge) {return 'merge';}
        if (this.options.keep) {return 'keep';}
        return null;
    }
}
