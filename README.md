# Request

request是基于[request](https://www.npmjs.com/package/request)封装的http客户端请求工具.

[![build status](http://git.beibei.com.cn/node/request/badges/master/build.svg)](http://git.beibei.com.cn/node/request/commits/master)
[![coverage report](http://git.beibei.com.cn/node/request/badges/master/coverage.svg)](http://git.beibei.com.cn/node/request/commits/master)
[![node](https://img.shields.io/badge/node-8.5.0-brightgreen.svg)](https://img.shields.io/badge/node-8.5.0-brightgreen.svg)
[![version](http://npm.beibei.com.cn/badge/v/@node/request.svg)](http://npm.beibei.com.cn/package/@node/request)
_ _ _

+ [安装](#安装)
+ [特性](#特性)
+ [用法](#用法)
+ [文档](#文档)
    + [Request](#request)
        + [get](#get)
        + [post](#post)

+ [联系我们](#联系我们)

_ _ _

## 安装

> npm install @node/request --registry="http://10.2.223.167:7001" --save

## 特性

相较于原始的 `request` 库，`@node/request` 针对我们自己的使用场景做了如下优化：

- 非常方便的连接预发调试

    使用者可以通过在请求头的 `Cookie` 中加入 `API-BETA` 来非常方便的连接预发调试，具体用法参见下方的 `预发调试`。

- 超时自动重连三次

    针对线上出现的 `ETIMEDOUT` 和 `ESOCKETTIMEDOUT` 错误，`@node/request` 会尝试重连三次，从而大幅减少此类错误。

- 支持 HTTPDNS

    `@node/request` 会自动识别「阿里云抖动等原因导致的域名解析错误」，并使用 `HTTPDNS` 获取正确 `IP`。

- 域名解析兜底

    遇到域名解析服务商故障也不用担心，`@node/request` 会自动从 `hconf` 获取兜底 IP。

- 由公司内部团队维护，可定制性高

    `@node/request` 现在由大前端架构团队维护，所以针对业务中具有一定通用性的场景，我们都可以添加到该基础库中，避免重复劳动，提升开发效率。

## 用法

```javascript
const request = require('@node/request');

await request.get('http://m.beidian.com');

```

### 预发调试

```javascript
const request = require('@node/request');

await request.get('https://api.beibei.com/mroute.html?method=xxx', {
    method: 'xxx'
}, {
    headers: {
        Cookie: ctx.headers.cookie, // 保证 `cookie` 中包含 `API-BETA=xx` ，其中 `xx` 必须是一个数字
    },
});

```

### 默认选项

通过 defaults 方法返回一个设置了默认选项的请求对象，接下来使用该对象发送的请求都将拥有这些默认选项。

```javascript
const request = require('@node/request');
const newRequest = request.defaults({
    json: false
});

await newRequest.get('https://api.beibei.com/mroute.html?method=xxx', {
    method: 'xxx'
});

```

_ _ _


## 文档

### Request

### get

**static Promiase.<IncomingMessage> get(string url, [object query], [object, options])**

| 参数 | 类型 | 默认值 | 是否必须 | 说明 |
|--------|--------|--------|--------|--------|
| url       |  String   | -   | 是 | 请求地址  |
| query       |  Object   | -   | 否 | 请求参数  |
| options       |  Object   | -   | 否 | 可以其他请求参数,相见[https://www.npmjs.com/package/request#requestoptions-callback](https://www.npmjs.com/package/request#requestoptions-callback)  |

```javascript
await Request.get('http://test.api?id=1');
```
- - -

### post

**static Promiase.<IncomingMessage> post(string url, [object form], [object, options])**

| 参数 | 类型 | 默认值 | 是否必须 | 说明 |
|--------|--------|--------|--------|--------|
| url       |  String   | -   | 是 | 请求地址  |
| form       |  Object   | -   | 否 | 请求体参数  |
| options       |  Object   | -   | 否 | 可以其他请求参数,相见[https://www.npmjs.com/package/request#requestoptions-callback](https://www.npmjs.com/package/request#requestoptions-callback)  |


```javascript
await Request.post('http://test.api', {id: 1});
```

_ _ _

### put

**static Promiase.<IncomingMessage> put(string url, [object form], [object, options])**

| 参数 | 类型 | 默认值 | 是否必须 | 说明 |
|--------|--------|--------|--------|--------|
| url       |  String   | -   | 是 | 请求地址  |
| form       |  Object   | -   | 否 | 请求体参数  |
| options       |  Object   | -   | 否 | 可以其他请求参数,相见[https://www.npmjs.com/package/request#requestoptions-callback](https://www.npmjs.com/package/request#requestoptions-callback)  |


```javascript
await Request.put('http://test.api', {id: 1});
```

_ _ _

### patch

**static Promiase.<IncomingMessage> patch(string url, [object form], [object, options])**

| 参数 | 类型 | 默认值 | 是否必须 | 说明 |
|--------|--------|--------|--------|--------|
| url       |  String   | -   | 是 | 请求地址  |
| form       |  Object   | -   | 否 | 请求体参数  |
| options       |  Object   | -   | 否 | 可以其他请求参数,相见[https://www.npmjs.com/package/request#requestoptions-callback](https://www.npmjs.com/package/request#requestoptions-callback)  |


```javascript
await Request.patch('http://test.api', {id: 1});
```

_ _ _

### del

**static Promiase.<IncomingMessage> del(string url, [object query], [object, options])**

| 参数 | 类型 | 默认值 | 是否必须 | 说明 |
|--------|--------|--------|--------|--------|
| url       |  String   | -   | 是 | 请求地址  |
| query       |  Object   | -   | 否 | 请求参数  |
| options       |  Object   | -   | 否 | 可以其他请求参数,相见[https://www.npmjs.com/package/request#requestoptions-callback](https://www.npmjs.com/package/request#requestoptions-callback)  |

```javascript
await Request.del('http://test.api?id=1');
```
- - -



## 联系我们

- 联系人 : 陈泽韦(zewei.chen@beibei.com)
- Issue  : [http://git.beibei.com.cn/node/request/issues](http://git.beibei.com.cn/node/request/issues)
