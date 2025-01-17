module.exports = class Hello extends process.Command {

    name = 'hello';

    description = 'Hello command';

    handle() {

        this.info('Hello');
    }
}
