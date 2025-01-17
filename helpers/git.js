module.exports = class Git {

    constructor(command) {
        this.command = command;
        this.dir = this.command.fs.base_path();
        this.remoteName = 'origin';
    }

    changeDir (dir) {
        this.dir = dir;
        return this;
    }

    changeRemoteName (remoteName) {
        this.remoteName = remoteName;
        return this;
    }

    exists () {
        return this.command.fs.is_dir(this.command.fs.path(this.dir, '.git'));
    }

    async existsForCommit () {
        const out = await this.command.signed_exec(`GIT: Get status...`, `git status`, this.dir);
        return !/.*nothing\sto\scommit.*/.test(out.join(","));
    }

    async getCurrentBranch () {
        let out = await this.command.signed_exec(`GIT: Get branch...`, `git branch`, this.dir);
        let branch = this.command.obj.get_start_with(out, '*');
        return branch ? branch.replace('*','').trim() : 'master';
    }

    async getLastCommitMessage (defaultValue = null) {
        const out = await this.command.signed_exec(`GIT: Get last message...`, `git log -1 --pretty=%B`, this.dir);
        if (out.length) {
            return out.join("\n").trim();
        }
        return defaultValue;
    }

    async generateMessageForCommit () {
        const out = await this.command.signed_exec(`GIT: Get file list...`, `git diff --name-only`, this.dir);
        if (out.length) {
            return out.join(", ");
        }
        return (new Date()).toLocaleString('en-US', { hour12: false });
    }

    async pull (branch) {
        return await this.command.signed_exec(`GIT: [${branch}] Pulling...`, `git pull ${this.remoteName} ${branch}`, this.dir);
    }

    async add (branch) {
        return await this.command.signed_exec(`GIT: [${branch}] Add...`, `git add .`, this.dir);
    }

    async commit (branch, comment) {
        return await this.command.signed_exec(`GIT: [${branch}] Commit...`, `git commit -m "${comment}"`, this.dir);
    }

    async push (branch) {
        return await this.command.signed_exec(`GIT: [${branch}] Push...`, `git push ${this.remoteName} ${branch}`, this.dir);
    }
}
