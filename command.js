const Table = require('cli-table3');
const loading =  require('loading-cli');
const prompts = require('prompts');
const { exec, spawn, execSync} = require('child_process');
const path = require('path');
const moment = require('moment');
const lodash = require('lodash');
const fs = require('./helpers/fs');
const obj = require('./helpers/obj');
const str = require('./helpers/str');
const num = require('./helpers/num');
const git = require('./helpers/git');
const argv = require('string-argv');
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

const PhpBuilder = require('bfg-js-comcode');

function promiseFromChildProcess(child, out = []) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
        child.stdout.on("data", (d) => out.push(d.trim().split(/\n/g)));
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}

module.exports = class Command {

    arguments = {};

    options = {};

    outsFunction = [];

    /**
     * The argument may be <required> or [optional] or <dirs...> for array.
     * @returns {string}
     */
    get commandName() {
        return this.constructor.name.toLowerCase();
    }

    get commandDescription() {
        return 'Unknown command';
    }

    /**
     * Format: [
     *     [flags, description, defaultValue],
     *     ...
     * ]
     * @returns {*[]}
     */
    get commandOptions() {
        return [];
    }

    get requiredCommandOptions() {
        return [];
    }

    get required() {
        return {};
    }

    get verbose() {
        return this.commander.opts().verbose;
    }

    get quiet() {
        return this.commander.opts().quiet;
    }

    constructor(program, commander, config, commandFile, commandFindPath) {
        this.program = program;
        this.commander = commander;
        this.config = config;
        this.pwd = process.cwd();
        this.path = path;
        this.moment = moment;
        this.lodash = lodash;

        this.fs = new fs(this);
        this.str = new str(this);
        this.obj = new obj(this);
        this.num = new num(this);
        this.git = new git(this);

        this.commandFile = commandFile;
        this.commandFilePath = this.fs.dirname(commandFile);
        this.commandFindPath = commandFindPath;

        this.STATUS_OK = 0;
        this.STATUS_ERROR = 1;
    }

    handle () {

    }

    stub (stub, params = {}) {

        const file = this.fs.path(this.commandFilePath, 'stubs', `${stub}.stub`);

        if (!this.fs.is_file(file)) {
            this.exit(`File template [${file}] not found!`);
        }

        return this.str.replace_tags(
            this.fs.get_contents(file), params
        );
    }

    async put_stub (file, stub, params = {}) {

        return this.fs.put_contents(
            file,
            this.stub(stub, params)
        );
    }

    js_ext (dir = this.pwd) {
        let ext = 'js';
        if (this.fs.exists(this.fs.path(dir, 'package.json'))) {
            let json = this.fs.get_json_contents(this.fs.path(dir, 'package.json'));
            if (json.type && json.type !== 'commonjs') {
                ext = 'cjs';
            }
        }
        return ext;
    }

    phpBuilder (file) {
        return new PhpBuilder(file);
    }

    success (text) {
        this.process(text.green).start().succeed();
        return this;
    }

    fail (text) {
        this.process(text.red).start().fail();
        return this;
    }

    warn (text) {
        this.process(text.yellow).start().warn();
        return this;
    }

    async signed_exec (title, command, dir = this.pwd) {
        command = Array.isArray(command) ? command.join(' ') : command;
        let out = [],
            process = this.process().start(title);

        try {
            await this.exec(command, out, dir);
            process.succeed();
        } catch (e) {
            process.fail(e.message);
        }

        return out.flat();
    }

    async exec (command, out = [], dir = this.pwd) {
        this.log(`Run cli command: ${command}`, 1);
        return await promiseFromChildProcess(exec(command, {cwd: dir}), out);
    }

    async spawn (command, args = [], dir = this.pwd, stdio = 'inherit') {
        const cmdText = `${command} ${args.join(' ')}`;
        this.log(`Run cli command: ` + cmdText, 1);
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {stdio, cwd: dir});

            let stdout = '';
            let stderr = '';

            if (child.stdout) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }

            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Command [${cmdText}] exited with code ${code}: \n ${stderr}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });

            this.outsFunction.push(() => {
                child.kill();
            });
        });
    }

    parseCommand(command) {
        const args = argv.default(command);
        const program = args.shift();
        return { program, args };
    }

    async cmd (command, dir = this.pwd) {
        let out = [];
        this.log(`Run cli command: ${command}`, 1);
        await this.exec(command, out, dir);
        return out.flat();
    }

    async ask (question, defaultValue = null, validate = undefined) {
        let result = await this.prompts({
            type: 'text',
            name: 'value',
            message: question,
            initial: defaultValue,
            validate: validate
        });
        return result.value
    }

    async confirm (message, defaultValue = true, active = 'yes', inactive = 'no') {
        let result = await this.prompts({
            type: 'toggle',
            name: 'value',
            message: message,
            initial: defaultValue,
            active, inactive
        });
        return result.value
    }

    async prompts (options) {
        return prompts(options);
    }

    process (options = {}) {
        return loading(options)
    }

    tbl (options = {}) {
        return new Table(options);
    }

    table (rows, options = {}) {
        if (!this.quiet) {
            let table = this.tbl(options);
            table.push(...rows);
            console.log(table.toString());
        }
        return this;
    }

    scheme (rows, options = {}) {
        options.chars = { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
            'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '',
            'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': '',
            'right': '' , 'right-mid': '' , 'middle': ' '};
        options.style = { 'padding-left': 0, 'padding-right': 0 };
        this.table(rows, options);
        return this;
    }

    comment (...data) {
        data = data.map(p => typeof p === 'string' ? (p.yellow) : p);
        this.line(...data);
        return this;
    }

    info (...data) {
        data = data.map(p => typeof p === 'string' ? (p.green) : p);
        this.line(...data);
        return this;
    }

    error (...data) {
        data = data.map(p => typeof p === 'string' ? (p.red) : p);
        if (!this.quiet || this.verbose) {
            console.error(...data);
        }
        return this;
    }

    exit (message = null, code = this.STATUS_OK) {

        if (typeof message === 'number') {
            code = message;
            message = null;
        }

        if (message) {
            this.error(message);
        }

        process.exit(code);
    }

    write (data) {
        if (!this.quiet) {
            process.stdout.write(data);
        }
        return this;
    }

    line (...data) {
        if (!this.quiet) {
            console.log(...data);
        }
        return this;
    }

    log (text) {
        this.program.log(text)
        return this;
    }

    async call (command, ...args) {
        const parsed = this.parseCommand(command);
        parsed.args.push(...args);
        return await this.commander.parseAsync([process.argv[0], process.argv[1], parsed.program, ...parsed.args])
    }

    async _defaultAction (args, cmd) {

        const requiredKeys = Object.keys(this.required);

        for (const key of requiredKeys) {
            this[key] = await this._requireForce(this.required[key]);
        }

        rl.on('SIGINT', () => {
            this.outsFunction.map((out) => {
                out();
            });
        });

        const options = cmd.opts();

        if (options.alias) {

            this.program._addAlias(options.alias, cmd._name);

        } else {

            this.log('Command action started...');

            const keys = Object.keys(options);
            const keysArgs = Object.keys(this.arguments);

            for (const key of keys) {
                this.options[key] = options[key];
            }

            let index = 0;
            for (const argument of keysArgs) {
                this.arguments[argument] = cmd.processedArgs[index] !== undefined ? cmd.processedArgs[index] : this.arguments[argument];
                index++;
            }

            await this.handle.bind(this)(...args);
        }

        const elapsed = Date.now() - this.program.startTime;

        this.log('Finished.');
        this.log(`Total time: ${elapsed} ms`);
    }

    async _requireForce(module) {

        if (! this.globalPath) {
            this.globalPath = this.config.getNpmGlobalPath();
        }

        const modulePath = path.join(this.globalPath, module);

        try {
            this.log(`Try to require module: ${module}`);
            const result = require(modulePath);
            this.log(`Module ${module} included.`);
            return result;
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                this.log(`Module ${module} not found. Try to install...`);
                //execSync(`npm install -g ${module}`);
                await this.spawn('npm', ['install', '-g', module]);
                try {
                    this.log(`Try to require module: ${module} again`);
                    return require(modulePath);
                } catch (e) {
                    this.log(`Module ${module} not found.`);
                }
            }
        }
        return null;
    }
}
