// 云函数入口文件
const cloud = require('wx-server-sdk')
const cherrio = require('cheerio')
const request = require('request')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var header = {}
  //淘宝
  //拼多多
  if(event.url.indexOf("yangkeduo.com") >= 0 ){
    return new Promise((resolve,reject) => {
      request(event.url,function(err,res,body){
        if (!error && response.statusCode == 200) {
          let $ = cherrio.load(body)
          resolve(body)
        }
      })
    })
  }








  //京东
  if (event.url.indexOf(".jd.com") >= 0 ) {
    let jd_Id
    if (event.url.indexOf("item.jd.com") >= 0)
      jd_Id = event.url.substring(event.url.indexOf("jd.com") + 7, event.url.indexOf(".html"))
    if (event.url.indexOf("item.m.jd.com") >= 0)
      jd_Id = event.url.substring(event.url.indexOf("jd.com") + 15, event.url.indexOf(".html"))
    return await new Promise(function (resolve, reject) {
      request({
        url: "https://p.3.cn/prices/mgets?skuIds=J_" + jd_Id,
        json: true, //设置body为值的JSON表示并添加Content-type: application/json标头。此外，将响应主体解析为JSON。
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(body[0].p)
        }
      })
    })
  }

}