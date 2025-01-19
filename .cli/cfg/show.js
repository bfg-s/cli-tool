module.exports = class Show extends process.Command {

    name = 'cfg:show [name]';

    description = 'Command for show config value';

    arg = {
        name: null,
    }

    handle() {

        if (this.arg.name) {

            this.info(`Config value [${this.arg.name}]: ${this.config.get(this.arg.name)}`);
        } else {
            let rows = [];

            const dots = this.obj.dot(this.config.data);

            Object.keys(dots).map((key) => {
                let val = dots[key];
                rows.push([
                    key.green, this.obj.isArrayOrObject(val) ?
                        this.make_table(val) : val
                ]);
            });

            this.table(rows, {head: ['Key', 'Value']});
        }
    }

    make_table (obj) {
        if (Array.isArray(obj)) {
            return JSON.stringify(obj);
        }
        let tbl = this.tbl();
        Object.keys(obj).map((key) => {
            let val = obj[key];
            tbl.push([
                key.green, this.obj.isArrayOrObject(val) ?
                    this.make_table(val) : val
            ]);
        });
        return tbl.toString();
    }

    show_version() {
        super.show_version();

        this.line("Config viewer", "v1.0.0".green);
    }
}
