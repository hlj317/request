const test = require('ava').test;
const request = require('../index');
const httpdns = require('../src/httpdns');
const http = require('http');
const port = 10087;

test.before.serial(() => {
    http.createServer((req, res) => {
        const echo = {
            headers: req.headers,
            url: req.url,
            method: req.method,
        };

        if (echo.url !== '/timeout') {
            res.end(JSON.stringify(echo));
        }
    }).listen(port);
});

test.serial('test use http dns', async (t) => {
    // test empty url
    try {
        await httpdns(null);
        return t.fail();
    } catch (ex) { }

    // test https
    let httpsResp = await request.handleHostPort('get', 'https://m.beibei.com/ncm/activ/activity/fans_welfare.html', {});
    t.is(!!httpsResp.body, true);

    // test http
    let httpResp = await request.handleHostPort('get', 'http://sapi.beidian.com/item/detail/v1-29370257.html', {});
    t.is(!!httpResp.body, true);

    // test http use cache
    let httpResp2 = await request.handleHostPort('get', 'http://sapi.beidian.com/item/detail/v1-29370257.html', {});
    t.is(!!httpResp2.body, true);

    // test invalid hostname https
    try {
        await request.handleHostPort('get', 'https://ms.beibei.com/ncm/activ/activity/fans_welfare.html', {});
        t.fail();
    } catch (ex) { }

    // test invalid hostname http
    try {
        await request.handleHostPort('get', 'http://ma.beibei.com/ncm/activ/activity/fans_welfare.html', {});
        t.fail();
    } catch (ex) { }

    return t.pass();
});

test.serial('test Client.get success', async (t) => {
    let resp = await request.get('http://127.0.0.1:10087/get');

    t.is(resp.body.headers.host, '127.0.0.1:10087');
    t.is(resp.body.headers['accept-encoding'], 'gzip, deflate');
    t.is(resp.body.headers.accept, 'application/json');
    t.is(resp.body.url, '/get');
    t.is(resp.body.method, 'GET');

    return t.pass();
});

test.serial('test Client.post success', async (t) => {
    let resp = await request.post('http://127.0.0.1:10087/post');

    t.is(resp.body.method, 'POST');

    return t.pass();
});

test.serial('test Client.put success', async (t) => {
    let resp = await request.put('http://127.0.0.1:10087/put');

    t.is(resp.body.method, 'PUT');

    return t.pass();
});

test.serial('test Client.patch success', async (t) => {
    let resp = await request.patch('http://127.0.0.1:10087/patch');

    t.is(resp.body.method, 'PATCH');

    return t.pass();
});

test.serial('test Client.del success', async (t) => {
    let resp = await request.del('http://127.0.0.1:10087/del');

    t.is(resp.body.method, 'DELETE');

    return t.pass();
});

test.serial('test Client.get error', async (t) => {
    let resp;
    try {
        resp = await request.get('http://127.0.0.1:10088/post');
    } catch (ex) {
        resp = ex;
    }

    t.is(resp.address, '127.0.0.1');
    t.is(resp.code, 'ECONNREFUSED');
    t.is(resp.errno, 'ECONNREFUSED');
    t.is(resp.port, 10088);
    t.is(resp.method, 'GET');
    t.is(resp.url, 'http://127.0.0.1:10088/post');

    return t.pass();
});

test.serial('test Client get request', async (t) => {
    let req = await request.getRequest();

    t.is(typeof req, 'function');

    return t.pass();
});

test.serial('test Client get without url', async (t) => {
    try {
        await request.get();
    } catch (ex) {
        t.is(ex.message, 'url不能为空');
    }

    return t.pass();
});

test.serial('test the condition of generating abr', (t) => {
    const options0 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {});
    const options1 = request.composeOptions('get', 'api-xretail.beicang.com');
    const options2 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {
        abr: true,
    });
    const options3 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {
        abr: true,
        qs: {
            id: 1,
        },
    });
    const options4 = request.composeOptions('get', 'http://api.beicang.com/mroute.html?id=1', {
        abr: true,
        qs: {
            name: 'xxx',
        },
    });
    const options5 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {
        abr: true,
        body: {
            name: 'xxx',
        },
    });
    const options6 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {
        abr: true,
        form: {
            name: 'xxx',
        },
    });
    const options7 = request.composeOptions('get', 'http://api.beicang.com/mroute.html?id=1', {
        abr: true,
        body: {
            name: 'xxx',
        },
    });

    const options8 = request.composeOptions('get', 'http://api.beicang.com/mroute.html', {
        abr: true,
        qs: {
            id: 1,
        },
        body: {
            name: 'xxx',
        },
    });

    const hasAbr0 = options0.url.indexOf('_abr_') > -1;
    const hasAbr1 = options1.url.indexOf('_abr_') > -1;
    const hasAbr2 = options2.url.indexOf('_abr_') > -1;
    const hasAbr3 = options3.url.indexOf('_abr_') > -1;
    const hasAbr4 = options4.url.indexOf('_abr_') > -1;
    const hasAbr5 = options5.url.indexOf('_abr_') > -1;
    const hasAbr6 = options6.url.indexOf('_abr_') > -1;
    const hasAbr7 = options7.url.indexOf('_abr_') > -1;
    const hasAbr8 = options8.url.indexOf('_abr_') > -1;

    t.is(hasAbr0, false);
    t.is(hasAbr1, false);
    t.is(hasAbr2, true);
    t.is(hasAbr3, true);
    t.is(hasAbr4, true);
    t.is(hasAbr5, true);
    t.is(hasAbr6, true);
    t.is(hasAbr7, true);
    t.is(hasAbr8, true);
});

test.serial('test generate right abr in composeOptions', (t) => {
    let obj0 = {
        type: 'GET',
        url: '/mroute.html',
        query: {
            a: 1,
            b: 2,
        },
        body: {
            c: 3,
            d: 4,
        },
        unixTime: '1519722776',
    };

    let obj1 = {
        type: 'GET',
        url: '/mroute.html',
        query: {
            a: 11,
            b: 22,
        },
        body: {},
        unixTime: '1519722777',
    };

    let obj2 = {
        type: 'POST',
        url: '/mroute.html',
        query: {
            a: 24,
            b: 33,
        },
        body: {
            c: 11,
            d: 44,
        },
        unixTime: '1519722786',
    };
});

test('should return x-beta cookie when set api-cookie', (t) => {
    const options = request.composeOptions('localhost', 'get', {
        headers: {
            Cookie: 'API-BETA=57',
        },
    });

    t.is(options.headers.Cookie, '; HX-BETA=57');
});

test('should return x-beta cookie when set api-cookie and other cookie', (t) => {
    const options = request.composeOptions('localhost', 'get', {
        headers: {
            Cookie: 'test=1;API-BETA=57',
        },
    });

    t.is(options.headers.Cookie, 'test=1;HX-BETA=57');
});

test('should return _airborne_channel qs when airjs biz_key is set', (t) => {
    const airjs = global.airjs;
    global.airjs = {
        projectConfig: {
            biz_key: 'beibei',
        },
    };
    const options = request.composeOptions('localhost', 'get', {});

    t.deepEqual(options.qs, {
        _airborne_channel: 'beibei',
    });
    global.airjs = airjs;
});

test.serial('test Client timeout', async (t) => {
    try {
        await request.get('http://127.0.0.1:10087/timeout', {
            timeout: 1000,
        });
    } catch (ex) {
        let options = JSON.parse(ex.options);

        t.is(ex.code, 'ESOCKETTIMEDOUT');
        t.is(options.timeoutRetry, 0);
    }

    return t.pass();
});

test.serial('test Client enotfound', async (t) => {
    global.airjs = {
        bconfGet(path) {
            return Promise.resolve('183.136.223.213');
        },
    };

    await request.get('https://api2.beibei.com/index.html', {}, {
        timeout: 1000,
    });

    await request.get('https://api2.beibei.com/index.html', {}, {
        timeout: 1000 * 10,
    });

    await request.get('https://api2.beibei.com/index.html', {}, {
        timeout: 1000 * 10,
        timeoutRetry: 1,
    });

    return t.pass();
});

test.serial('test Client defaults', async (t) => {
    let startTime = Date.now();

    try {
        let newRequest = request.defaults({
            timeout: 1000,
        });

        await newRequest.get('http://127.0.0.1:10087/timeout');
    } catch (ex) {
        t.is(Date.now() - startTime < 10000, true);
    }

    return t.pass();
});

test.serial('test get error name', (t) => {
    t.is(
        request.getErrorName(),
        undefined
    );
    t.is(
        request.getErrorName({
            code: 'ENOTFOUND',
            syscall: 'getaddrinfo',
        }),
        'dns'
    );
    t.is(
        request.getErrorName({
            code: 'ETIMEDOUT',
            syscall: 'connect',
            address: '61.130.9.130',
        }),
        'hostport'
    );
    t.is(
        request.getErrorName({
            code: 'ETIMEDOUT',
        }),
        'timeout'
    );
    t.is(
        request.getErrorName({
            code: 'ESOCKETTIMEDOUT',
        }),
        'timeout'
    );
});

let sleep = (time) => new Promise((resolve) => {
    setTimeout(() => resolve(), time);
});

test.serial('test use http dns ttl', async (t) => {
    // test ttl
    await sleep(10000);

    let httpsResp2 = await request.handleHostPort('get', 'https://m.beibei.com/ncm/activ/activity/fans_welfare.html', {});
    t.is(!!httpsResp2.body, true);
});

