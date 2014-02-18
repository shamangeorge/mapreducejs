importScripts('./mapreduce.js');

self.addEventListener('message', function(e) {
    var data = e.data;
    var obj;
    switch (data.cmd) {
        case 'start':
            obj = {
                str: 'WORKER STARTED: ' + data.msg,
                type: 'string'
            }
            self.postMessage(JSON.stringify(obj));
            break;
        case 'map':
            obj = {
                str: JSON.stringify(mapper(data.msg)),
                type: 'map'
            }
            self.postMessage(JSON.stringify(obj));
            break;
        case 'sort':
            obj = {
                str: JSON.stringify(ssort(JSON.parse(data.msg))),
                type: 'sort'
            }
            self.postMessage(JSON.stringify(obj));
            break;
        case 'reduce':
            obj = {
                str: JSON.stringify(reduce(JSON.parse(data.msg))),
                type: 'reduce'
            }
            self.postMessage(JSON.stringify(obj));
            break;
        case 'all':
            obj = {
                str: JSON.stringify(reduce(ssort(mapper(data.msg).map).map)),
                type: 'all'
            }
            self.postMessage(JSON.stringify(obj));
            break;
        case 'stop':
            obj = {
                str: 'WORKER STOPPED: ' + data.msg + '. <span style="color: red">buttons will no longer work, and you WILL have to refresh the page. Click on restarte worker to respawn the Web Woker</span>',
                type: 'stop'
            }
            self.postMessage(JSON.stringify(obj));
            self.close(); // Terminates the worker.
            break;
        default:
            obj = {
                str: 'Unknown command: ' + data.msg,
                type: 'string'
            }
            self.postMessage(JSON.stringify(obj));
    };
}, false);
