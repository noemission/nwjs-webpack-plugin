const net = require('net');

const randomNumber = Math.random() * 10e9 | 0;
const randomID = `webpack-error-message-${randomNumber}`
const client = net.connect({ port: NwJSPlugin_PORT }, () => console.log('Live reload connected!'))

const css = `
#${randomID}{
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: rgb(222, 85, 85);
    margin: 0px;
    font-size: 1.3em;
}
`
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css))
document.head.appendChild(style)


client.on('data', (data) => {
    data = JSON.parse(data.toString())
    console.log("Server:", data);
    if (data.status === 'DONE') {
        location.reload();
    }
    if (data.status === 'ERROR') {
        data.errors.forEach(err => {
            try {
                eval(err.toEval)
            } catch (error) {
                let el = document.getElementById(randomID);
                const header = [
                    `ERROR in ${err.file} ${err.location.line}:${err.location.column}`,
                    ...error.message.split('\n').slice(0, 2)
                ]
                const body = error.message.split('\n').slice(2)

                el && el.remove();
                el = document.createElement('div')
                el.id = randomID
                
                const headerEl = document.createElement('pre')
                headerEl.innerText = header.join('\n');
                headerEl.style.fontWeight = 'bold'
                headerEl.style.marginLeft = '0.5em'

                const bodyEl = document.createElement('pre')
                bodyEl.innerText = body.join('\n');
                bodyEl.style.marginLeft = '1em'

                el.append(headerEl)
                el.append(bodyEl)

                document.body.append(el);
                console.error(error.message)
            }
        });
    }
    nw.Window.get().focus();
});