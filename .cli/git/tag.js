module.exports = class Tag extends process.Command {

    name = 'git:tag';

    description = 'Git create tag';

    options = [
        ['-p, --publish', 'Publish to npm']
    ];

    option = {
        publish: false
    };

    async handle() {

        let dir = this.fs.base_path();

        if (this.fs.is_dir(this.fs.base_path('.git'))) {

            let out = await this.signed_exec(`GIT: Checking for the need to add a tag...`, `git tag --contains`, dir);

            if (!out.length) {

                let ans = await this.confirm(`GIT: Create a new tag?`);

                if (!ans) {

                    this.warn(`GIT: Tag creation canceled!`);
                    return;
                }

                out = await this.signed_exec(`GIT: Get last version...`, `git describe --abbrev=0 --tags`, dir);
                let ver = out.length ? this.obj.last(out) : '0.0.1';
                if (out.length) {
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

                await this.signed_exec(
                    `GIT: Creating a new tag [${ver}][${message}]...`,
                    `git tag -a ${ver} -m '${message}'`,
                    dir
                );

                await this.signed_exec(
                    `GIT: Publish a new tag...`,
                    `git push --tag`,
                    dir
                );

                if (this.option.publish) {

                    await this.signed_exec(
                        `GIT: Npm Publish...`,
                        `npm publish`,
                        dir
                    );
                }

                this.success(`GIT: Tag [${ver}] created!`);
            }

            else {

                this.warn(`GIT: The tag already exists [${this.obj.first(out)}]`);
            }

        } else {

            this.error(`GIT: Not a git repository!`);
        }
    }
}
