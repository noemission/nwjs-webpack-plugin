# nwjs-webpack-plugin

A webpack plugin that provides live reload capabilities during development of NW.js applications. Something like webpack-dev-server for NW.js.

## Features
* Live reload after code change
* A black overlay will appear in case of code error
* Starts automatically the application after webpack's compile 

## How it works
A tcp server is being created during webpack's build, publishing important lifecycle events to clients. Example of events are (build succeed, build failed due to error, etc...)

A script is being injected into the application that establishes the tcp connection with the server above. The script manipulates the app in response to the events that receives. For example reload is triggered when build is done, or an error overlay is placed in case of an invalid build.

## Instalation
`npm i -D nwjs-webpack-plugin`

## Basic Usage
```javascript
// webpack.config.js
const NwjsWebpackPlugin = require('nwjs-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    target: 'node-webkit',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new NwjsWebpackPlugin()
    ],
    watch: true
}
```

## Todo
- [x] Auto start NW after build
- [x] Provide error overlay
- [ ] Remove unnecessary logs
- [ ] Accept options from configuration
- [ ] Further testing
- [ ] HMR
- [ ] Provide more webpack's events/stats for client to consume
