const Table = require('cli-table3');
const axios = require('axios');
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
const format = require( 'string-kit' ).format;
const PhpBuilder = require('bfg-js-comcode');
const readline = require('readline');
const { cursor, beep, erase, screen} = require('sisteransi');
const originalWrite = process.stdout.write;
const originalExit = process.exit;

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

    get commandRequiredOptions() {
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

    set quiet(value) {
        this.commander.opts().quiet = value;
    }

    set verbose(value) {
        this.commander.opts().verbose = value;
    }

    get commandDocumentation () {
        return '';
    }

    constructor(program, commander, config, commandFile, commandFindPath, rl) {
        this.program = program;
        this.commander = commander;
        this.config = config;
        this.pwd = process.cwd();
        this.path = path;
        this.moment = moment;
        this.lodash = lodash;
        this.axios = axios;
        this.format = format;

        this.fs = new fs(this);
        this.str = new str(this);
        this.obj = new obj(this);
        this.num = new num(this);
        this.git = new git(this);

        this.commandFile = commandFile;
        this.commandFilePath = this.fs.dirname(commandFile);
        this.commandFindPath = commandFindPath;

        this.rl = rl;

        this.STATUS_OK = 0;
        this.STATUS_ERROR = 1;
    }

    handle () {

    }

    async validation () {

        return true;
    }

    is_windows () {
        return process.platform === 'win32';
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

    async editor (file = null, tmp = false) {

        if (! file) {
            file = this.fs.tmp_file();
            tmp = true;
        }

        let editor = this.config.get('editor', null);

        if (! editor) {
            editor = (await this.prompts({
                type: 'select',
                name: 'value',
                message: 'Select editor',
                choices: [
                    {title: 'mcedit', value: 'mcedit'},
                    {title: 'nano', value: 'nano'},
                    {title: 'vi', value: 'vi'},
                    {title: 'vim', value: 'vim'},
                    {title: 'emacs', value: 'emacs'},
                ]
            })).value;

            this.config.setToStore('tmp', 'editor', editor);
        }

        await this.withoutRedLine(this.spawn(editor, [file]));

        const hasFile = this.fs.is_file(file);

        const result = hasFile ? this.fs.get_contents(file) : '';

        if (tmp && hasFile) { this.fs.unlink(file); }

        return result;
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
        if (! this.quiet) {
            this.process(text.green).start().succeed();
        }
        return this;
    }

    fail (text) {
        if (! this.quiet) {
            this.process(text.red).start().fail();
        }
        return this;
    }

    warn (text) {
        if (! this.quiet) {
            this.process(text.yellow).start().warn();
        }
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
        await promiseFromChildProcess(exec(command, {cwd: dir}), out);
        return out.flat().join("\n");
    }

    async redLinePause (execute) {
        let result = null;
        this.rl.pause();
        if (execute instanceof Promise) {
            result = await execute;
        } else {
            result = await execute();
        }
        this.rl.resume();
        return result;
    }

    async withoutRedLine (execute) {
        let result = null;
        this.rl.close();
        this.rl = null;
        if (execute instanceof Promise) {
            result = await execute;
        } else {
            result = await execute();
        }
        this.rl = readline.createInterface({input: process.stdin, output: process.stdout});
        this.makeSIGINT();
        return result;
    }

    async spawn (command, args = [], dir = this.pwd, stdio = 'inherit', env = process.env) {
        const cmdText = `${command} ${args.join(' ')}`;
        this.log(`Run cli command: ` + cmdText, 1);
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio,
                cwd: dir,
                env,
            });

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

    async sleep (ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    log (...messages) {
        this.program.log(...messages)
        return this;
    }

    async call (command, ...args) {

        const result = await this.spawn('cli', [command, ...args], this.pwd, null);

        if (result.stderr) {
            return result.stderr;
        }
        const stdout = result.stdout.trim();
        const json = this.str.is_json(stdout);

        if (json instanceof Error) {
            return stdout;
        }

        return json;
    }

    async captureStdout(callback) {
        let buffer = '';
        process.stdout.write = (chunk, encoding, cb) => {
            buffer += chunk;
        };

        await callback();

        process.stdout.write = originalWrite;

        return buffer;
    }

    logout () {

    }

    makeSIGINT () {
        this.rl.on('SIGINT', async () => {
            for (const out of this.outsFunction) {
                out.constructor.name === 'AsyncFunction'
                    ? await out()
                    : out();
            }
            const code = this.logout.constructor.name === 'AsyncFunction'
                ? await this.logout()
                : this.logout();
            this.log('Received SIGINT signal in command.');
            process.exit(code || 0);
        });
    }

    async _defaultAction (args, cmd) {

        this.makeSIGINT();

        const requiredKeys = Object.keys(this.required);

        for (const key of requiredKeys) {
            this[key] = await this._requireForce(this.required[key]);
        }

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

        this.logout();

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
