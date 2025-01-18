module.exports = class Hello extends process.Command {

    name = 'hello';

    description = 'Hello command';

    handle() {

        console.log(this.config.getNpmGlobalHash());

        //this.info('Hello');
    }
}
