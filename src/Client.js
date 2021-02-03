// +----------------------------------------------------------------------
// | Beibei request
// +----------------------------------------------------------------------
// | HomePage : http://git.beibei.com.cn/node/request
// +----------------------------------------------------------------------
// | Author: 应杲臻 <gaozhen.ying@beibei.com>
// +----------------------------------------------------------------------

const request = require('request');
const extend = require('extend');
const httpdns = require('./httpdns');
const {URL} = require('url');
const qs = require('qs');

class Client {
    /**
     * @public
     * @param {String} url      请求行地址
     * @param {Object} query    请求行参数
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static get(url, query = {}, options = {}) {
        options.qs = query;

        return this.send(Client.METHOD.GET, url, options);
    }

    /**
     * @public
     * @param {String} url      请求行地址
     * @param {Object} form     请求体参数
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static post(url, form = {}, options = {}) {
        options.form = form;

        return this.send(Client.METHOD.POST, url, options);
    }

    /**
     * @public
     * @param {String} url      请求行地址
     * @param {Object} form     请求体参数
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static put(url, form = {}, options = {}) {
        options.form = form;

        return this.send(Client.METHOD.PUT, url, options);
    }

    /**
     * @public
     * @param {String} url      请求行地址
     * @param {Object} form     请求体参数
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static patch(url, form = {}, options = {}) {
        options.form = form;

        return this.send(Client.METHOD.PATCH, url, options);
    }

    /**
     * @public
     * @param {String} url      请求行地址
     * @param {Object} form     请求体参数
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static del(url, query = {}, options = {}) {
        options.qs = query;

        return this.send(Client.METHOD.DELETE, url, options);
    }

    /**
     * 获取包含了默认值的的请求对象
     *
     * @returns {request}
     */
    static defaults(options) {
        class Defaults extends Client { }

        Defaults.DEFAULT_OPTIONS = extend(true, {}, this.DEFAULT_OPTIONS, options);

        return Defaults;
    }

    /**
     * 获取request客户端
     *
     * @returns {request}
     */
    static getRequest() {
        return request;
    }

    /**
     * @private
     * @param {String} method   请求方法
     * @param {String} url      请求行地址
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static send(method, url, options = {}) {
        /**
         * @type {Object}
         */
        let requestOptions;

        options.timeoutRetry === undefined && (options.timeoutRetry = 3);

        return new Promise((resolve, reject) => {
            try {
                requestOptions = this.composeOptions(method, url, options);
            } catch (e) {
                return reject(e);
            }

            return request(requestOptions, (error, response, body) => {
                if (error) {
                    let errorName = this.getErrorName(error);
                    let promise;
                    let sendError = (err) => {
                        if (Object.prototype.toString.call(err) === '[object Error]') {
                            err.method = method;
                            err.url = url;
                            err.options = JSON.stringify(options);
                        }

                        return reject(err);
                    };

                    if (errorName === 'timeout' && options.timeoutRetry) {
                        promise = this.handleTimeout(method, url, options);
                    } else if (errorName === 'rst' && options.timeoutRetry) {
                        // use handleTimeout retry.
                        promise = this.handleTimeout(method, url, options);
                    } else if (errorName === 'dns' && global.airjs && typeof global.airjs.bconfGet === 'function') {
                        promise = this.handleDns(method, url, options);
                    } else if (errorName === 'hostport' && !options.proxy) {
                        promise = this.handleHostPort(method, url, options);
                    }

                    if (promise) {
                        return promise
                            .then((result) => resolve(result))
                            .catch((err) => sendError(err || error));
                    }

                    return sendError(error);
                }

                return resolve(response);
            });
        });
    }

    /**
     * @private
     * @param {String} method   请求方法
     * @param {String} url      请求行地址
     * @param {Object} options  请求选项
     * @return {Promise.<IncomingMessage>}
     */
    static composeOptions(method, url, options = {}) {
        if (!url) {
            throw new Error('url不能为空');
        }

        let canSupportAbr = /\/\/api\./.test(url) || /\/\/api-xretail\./.test(url);

        if (canSupportAbr && options.abr) {
            const _url = new URL(url);

            const _query = qs.parse(_url.search, {
                ignoreQueryPrefix: true,
            });

            let {
                qs: query = {}, body = {}, form = {},
            } = options;

            let joinChar = url.indexOf('?') > -1 ? '&' : '?';
            url += `${joinChar}`;
        }

        if (global.airjs && global.airjs.projectConfig && global.airjs.projectConfig.biz_key) {
            options.qs = {
                ...options.qs,
                _airborne_channel: global.airjs.projectConfig.biz_key,
            };
        }

        let cookie = options && options.headers && options.headers.Cookie;

        if (cookie && cookie.match) {
            let match = cookie.match(/API-BETA=(\d+)/);

            if (match && match[1]) {
                let xBeta = Number(match[1]);

                if (!isNaN(xBeta)) {
                    options.proxy = 'http://212.129.209.215';

                    cookie = cookie.replace(/(HX|API)-BETA=\d+;?\s?/g, '').trim();

                    if (cookie[cookie.length - 1] === ';') {
                        cookie += `HX-BETA=${xBeta}`;
                    } else {
                        cookie += `; HX-BETA=${xBeta}`;
                    }
                    options.headers.Cookie = cookie;
                }
            }
        }

        return extend(true, {}, this.DEFAULT_OPTIONS, {
            method,
            url,
        }, options);
    }

    static getErrorName(error = {}) {
        let {
            code,
            syscall,
            address,
        } = error;

        if (code === 'ENOTFOUND' && syscall === 'getaddrinfo') {
            return 'dns';
        }

        if (code === 'ETIMEDOUT' && syscall === 'connect' && address) {
            return 'hostport';
        }

        if (code === 'ECONNRESET' && syscall === 'read') {
            return 'rst';
        }

        if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
            return 'timeout';
        }

        return undefined;
    }

    static handleTimeout(method, url, options = {}) {
        options.timeoutRetry -= 1;
        return this.send(method, url, options);
    }

    static handleDns(method, url, options = {}) {
        return global.airjs
            .bconfGet('/bconf/ops/monitor_dns/domainresolve_ip')
            .then((ip) => {
                let proxy;
                let useHttps = /^https:/.test(url);
                if (useHttps) {
                    proxy = `https://${ip}:443`;
                } else {
                    proxy = `http://${ip}:80`;
                }
                if (options.proxy === proxy) {
                    return Promise.reject();
                }
                url = url.replace(/^https?/, 'http');
                options.proxy = proxy;
                return this.send(method, url, options);
            });
    }

    static handleHostPort(method, url, options = {}) {
        return httpdns(url)
            .then((proxy) => {
                url = url.replace(/^https?/, 'http');
                options.proxy = proxy;

                return this.send(method, url, options);
            });
    }
}

Client.DEFAULT_OPTIONS = {
    timeout: 15 * 1000,
    json: true,
    gzip: true
};

Client.METHOD = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

module.exports = Client;
