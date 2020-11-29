'use strict';
const tools = require('../tools.js');

function addInstance(ip, device, options, name, manufacturer) {
    options.log.debug('frontier_silicon FOUND! ' + ip);
    let instance = tools.findInstance(options, 'frontier_silicon', obj => obj.native.IP === ip);

    if (!instance) {
        const id = tools.getNextInstanceID('frontier_silicon', options);
        instance = {
            _id: id,
            native: {
                IP: ip
            }
        };
        options.newInstances.push(instance);
        return true;
    }
    return false;
}

// just check if IP exists
function detect(ip, device, options, callback) {
    let foundInstance = false;

    device._upnp.forEach(upnp => {
        if (upnp._location) {
            const lines = upnp._location.split('\n');

            let api;
            let name;
            lines.forEach(line => {
                let m = line.match('<webfsapi>(.+)</webfsapi>');
                if (m) {
                    api = m[1];
                }
                m = line.match('<friendlyName>(.+)</friendlyName>');
                if (m) {
                    name = m[1];
                }

                if (api && (api.toLowerCase().includes('fsapi')))
                    if (addInstance(ip, device, options, name, api)) {
                        foundInstance = true;
                    }
            });
        }
    });

    callback(null, foundInstance, ip);
}

exports.detect  = detect;
exports.type    = ['upnp'];// make type=serial for USB sticks // TODO make to upnp call location
exports.timeout = 100;
