const request = require('request');
const crypto = require('crypto');
const Url = require('url');

const algorithm = 'des-ecb';
const key = 'z7X5)e/X';
const iv = Buffer.from('');

let getEncodeText = (plaintext) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(plaintext, 'utf8', 'binary');
    crypted += cipher.final('binary');

    return crypted;
};

let getDecodeText = (cryptedText) => {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let plaintext = decipher.update(cryptedText, 'binary', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
};

let ipCache = {};

let fetchProxyFromCache = (protocol, hostname) => {
    let host = `${protocol}${hostname}`;
    let ip = ipCache[host];

    return ip ? Promise.resolve(ip) : Promise.reject();
};

let saveProxyToCache = (protocol, hostname, ip, ttl) => {
    let host = `${protocol}${hostname}`;
    const percent = 0.75; // 官方最佳实践推荐 https://cloud.tencent.com/document/product/379/3523

    ipCache[host] = ip;

    setTimeout(() => {
        ipCache[host] = undefined;
    }, ttl * 1000 * percent);
};

let parseHttpDnsResult = (result) => {
    let [ips, ttl] = result && result.split && result.split(',');
    let ip = ips && ips.split && ips.split(';')[0];
    ttl = Number(ttl);

    if (!ip || isNaN(ttl)) {
        return undefined;
    }

    return {
        ip,
        ttl,
    };
};

let fetchFromRemote = (protocol, hostname, backup = 0) => new Promise((resolve, reject) => {
    let useHttps = /^https:/.test(protocol);
    let dn = getEncodeText(hostname);
    let httpIps = ['119.29.29.29', '119.28.28.28'];
    let httpIp = httpIps[backup];
    let dnsUrl;

    if (useHttps) {
        dnsUrl = `https://dns.qq.com/d?dn=${dn}&id=64&ttl=1`;
    } else if (httpIp) {
        dnsUrl = `http://${httpIp}/d?dn=${dn}&id=64&ttl=1`;
    } else {
        reject(
            new Error('httpdns 服务暂不可用')
        );
        return;
    }

    request({
        method: 'GET',
        url: dnsUrl,
        timeout: process.env.NODE_ENV === 'test' ? 30 * 1000 : 5 * 1000,
    }, (error, response, body) => {
        if (error) {
            if (useHttps) {
                return reject(error);
            }
            return resolve(fetchFromRemote(protocol, hostname, backup + 1));
        }

        let result = getDecodeText(body);
        let parsedResult = parseHttpDnsResult(result);

        if (!parsedResult) {
            return reject(
                new Error(JSON.stringify({
                    message: `couldn't parse httpdns result`,
                    encodeText: body,
                    decodeText: result,
                    protocol,
                    hostname,
                }))
            );
        }

        let {
            ip,
            ttl,
        } = parsedResult;
        let proxy = useHttps ? `https://${ip}:443` : `http://${ip}:80`;

        saveProxyToCache(protocol, hostname, proxy, ttl);

        return resolve(proxy);
    });
});

module.exports = (url) => {
    try {
        let urlObj = Url.parse(url);
        let {
            protocol,
            hostname,
        } = urlObj;

        return Promise.resolve()
            .then(() => fetchProxyFromCache(protocol, hostname))
            .catch(() => fetchFromRemote(protocol, hostname));
    } catch (ex) {
        return Promise.reject(ex);
    }
};
