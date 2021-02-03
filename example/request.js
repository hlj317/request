// +----------------------------------------------------------------------
// | Beibei request
// +----------------------------------------------------------------------
// | HomePage : http://git.beibei.com.cn/node/request
// +----------------------------------------------------------------------
// | Author: 应杲臻 <gaozhen.ying@beibei.com>
// +----------------------------------------------------------------------

// const Request = require('request');

// // Request.get('http://127.0.0.1:10086/test', function(error, response) {
// //     console.log(response.body);
// // });
//
// const form = {
//     hello: 'world',
//     nihao: 'haoa'
// };
//
// const options = {
//     method : 'get',
//     url: 'http://127.0.0.1:10086?asdas=aa',
//     // form: form,
//     headers: {
//         Cookie: 'alan=walker'
//     },
//     qs: form
// };
//
// // Request.post('http://127.0.0.1:10086/test', {form: form}, function(error, response) {
// //     console.log(response.body);
// // });
// Request(options, function(error, response, body) {
//     console.log(body)
// });

const Request = require('../index');

(async () => {
    const resp = await Request.get('http://127.0.0.1:10087');
    // eslint-disable-next-line
    console.log(resp.body);
})();
