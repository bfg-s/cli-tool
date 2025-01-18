module.exports = class Reset extends process.Command {

    name = 'git:reset';

    description = 'Git reset';

    options = [
        ['--mixed', 'Reset HEAD and index'],
        ['--soft', 'Reset HEAD only'],
        ['--hard', 'Reset HEAD, index and working directory'],
        ['--merge', 'Reset HEAD, index and working directory'],
        ['--keep', 'Reset HEAD but keep local changes'],
    ];

    option = {
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
        if (this.option.mixed) {return 'mixed';}
        if (this.option.soft) {return 'soft';}
        if (this.option.hard) {return 'hard';}
        if (this.option.merge) {return 'merge';}
        if (this.option.keep) {return 'keep';}
        return null;
    }
}
