module.exports = class Tag extends process.Command {

    commandName = 'git:tag';

    commandDescription = 'Git create tag';

    commandOptions = [
        ['-p, --publish', 'Publish to npm']
    ];

    options = {
        publish: false
    };

    async handle() {

        const dir = this.fs.base_path();

        if (this.git.exists()) {

            const tag = await this.git.getLastTag();

            if (! tag) {

                const answerOnCreate = await this.confirm(`GIT: Create a new tag?`);

                if (!answerOnCreate) {
                    this.warn(`GIT: Tag creation canceled!`);
                    return;
                }

                const lastVersion = await this.git.getLastVersion();

                let ver = lastVersion ? lastVersion : '0.0.1';

                if (lastVersion) {
                    this.success(`GIT: Found last version [${ver}]`);
                    ver = ver.split('.');
                    ver[this.obj.last_key(ver)] =
                        String(this.num.isNumber(this.obj.last(ver)) ? (Number(this.obj.last(ver))+1) : 0);
                    ver = ver.join('.');
                } else {
                    this.warn(`GIT: Version not found!`);
                }

                ver = await this.ask(`GIT: Enter a next version:`, ver, (d) => {
                    return /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(d);
                });

                const message = await this.ask(
                    `GIT: Enter description of the tag:`,
                    `New version ${ver}`
                );

                await this.git.addTag(ver, message);

                await this.git.pushTag();

                if (this.options.publish) {

                    await this.signed_exec(
                        `GIT: Npm Publish...`,
                        `npm publish`,
                        dir
                    );
                }

                this.success(`GIT: Tag [${ver}] created!`);
            }

            else {

                this.warn(`GIT: The tag already exists [${tag}]`);
            }

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
