const net = require('net')
const getPort = require('get-port');
const path = require('path')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const DefinePlugin = require('webpack/lib/DefinePlugin')

module.exports = class NwJSPlugin {
    constructor() {
        this.portPromise = getPort();
        this.sockets = [];

        this.portPromise.then((port) => {
            net.createServer((socket) => {
                this.sockets.push(socket);
                if (this.lastErrorMessage) {
                    socket.write(JSON.stringify(this.lastErrorMessage))
                }
            })
                .listen(port)
                .on('listening', () => console.log('listening on ' + port))
        })


    }
    runNW() {
        if (this.nw_instance && this.nw_instance.pid) return;
        this.nw_instance = require('child_process').spawn('nw', [process.cwd()], {
            stdio: "inherit"
        });
    }
    write(message) {
        this.sockets.forEach(socket => socket.write(JSON.stringify(message)))
        if (message.status === 'ERROR') {
            this.lastErrorMessage = message;
        } else {
            this.lastErrorMessage = null;
        }
    }
    apply(compiler) {

        const definePort = (port) => {
            new DefinePlugin({ 'NwJSPlugin_PORT': port }).apply(compiler);
            return true;
        }

        compiler.hooks.watchRun.tapPromise('NwJSPlugin', c => this.portPromise.then(definePort));
        compiler.hooks.run.tapPromise('NwJSPlugin', c => this.portPromise.then(definePort));


        compiler.hooks.entryOption.tap('NwJSPlugin', () => {

            new SingleEntryPlugin(__dirname, path.resolve(__dirname, 'reloader.js'), 'reloader').apply(compiler)
        })

        compiler.hooks.watchRun.tap('NwJSPlugin', () => {
            this.write({
                status: "WATCH_RUN"
            })
        });

        compiler.hooks.done.tap('NwJSPlugin', (stats) => {
            this.runNW();
            if (stats.compilation.errors.length) {
                this.write({
                    status: "ERROR",
                    errors: stats.compilation.errors.map(err => ({
                        file: err.module.id,
                        location: err.loc,
                        toEval: err.module._source._value,
                    }))
                })
            } else {
                this.write({
                    status: "DONE",
                })
            }
        });

    }
}