// 云函数入口文件
const cloud = require('wx-server-sdk')
const cherrio = require('cheerio')
const request = require('request')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var headers = {
    "Cookie":"shshshfpa=125d6477-dacd-5848-9797-236f3697c5e5-1584858268; shshshfpb=tV9pC5b01GNK3Bel%2F36JTUA%3D%3D; __jdu=364515129; areaId=21; ipLoc-djd=21-1861-26450-55227; mt_xid=V2_52007VwEVV1lYVlocQSlYAmIAR1cIUE5aGxtKQABuVhNODVtVDQNMTloFZlYTAF0LUF0vShhfBHsCF05dXENZHkIdXw5nAiJQbVhiWhZJGFwHZgYRVG1dU1MZ; PCSYCityID=CN_360000_361100_361121; unpl=V2_ZzNtbUVQE0UmWEZSeUoPUmILQA9KAkRCIVxHASkRXARkAUYOclRCFnQUR1FnGl4UZwsZXENcQxRFCEdkfh1eAmUzIlxyVEMlfThEU34dXAFnABptclBzJS5dKFF8Hw9VZ1MSXUEFFB1FCENWex5dAGUAGm1DZ0MQfA9OUHkaWgFXSHxcD1VEEHEIQlR4EWwEVwA%3d; __jdv=76161171|www.infinitynewtab.com|t_45363_|tuiguang|66aaba173bbf49cc9d6fee0dc91023eb|1587639608649; __jda=122270672.364515129.1581416291.1587556320.1587639609.24; __jdc=122270672; __jdb=122270672.3.364515129|24.1587639609; shshshfp=bc279e5fabdf2aa7d7a2d1e66fdc5f74; shshshsID=27e0fa574ac8ec0eaa5131789c28f0c2_2_1587639616122; 3AB9D23F7A4B3C9B=JYE4PC2FRYZD5S3EBVJ4BSXMNW72GY5RHHVBH7SJ4THIOY4THHDUMWTLPWRZ6EIKSI2U5HCE46RHCIA3AU7QQAAZTA",
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",    
  }
  //淘宝

  //拼多多
  if(event.url.indexOf("yangkeduo.com") >= 0 ){
    var id = getGoodsId(event.url)
    var data = {"goodsIds":[id+""]}
    return await new Promise((resolve,reject) => {
      request({
        url:"https://youhui.pinduoduo.com/network/api/goods/queryByGoodsId",
        body:data,
        method:"POST",
        headers:headers,
        json:true
      },function(err,res,body){
        if (!err && res.statusCode == 200) {
          body.result.goodsDetails[0].minGroupPrice/100
         resolve([body.result.goodsDetails[0].goodsName,body.result.goodsDetails[0].minGroupPrice/100])
        }else reject(err)
      })
    })
  }


  //京东
  if (event.url.indexOf(".jd.com") >= 0 ) {
    var p1 = await new Promise (function (resolve, reject) {
      request({
        url:event.url,
        headers:headers,
        json: true, //设置body为值的JSON表示并添加Content-type: application/json标头。此外，将响应主体解析为JSON。
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           let $ = cherrio.load(body)
           let name = $('.sku-name').text().trim()
           console.log(name)
          resolve(name)
        }else reject("pro1 shibai")
      })
    })
    var p2 = await new Promise (function (resolve, reject) {
      request({
         url: "https://p.3.cn/prices/mgets?skuIds=J_" + getGoodsId(event.url),
        headers:headers,
        json: true, //设置body为值的JSON表示并添加Content-type: application/json标头。此外，将响应主体解析为JSON。
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body[0].p)
          resolve(body[0].p)
        }else reject("pro2 shibai")
      })
    })
    return Promise.all([p1,p2])
    
  }

  function getGoodsId(url){
    let goodsId = -1
    //拼多多
    if(url.indexOf("yangkeduo.com") >= 0 )
      goodsId = url.match(/\d*(?=&)/)
    //京东
    if (url.indexOf("item.jd.com") >= 0)
      goodsId = url.match(/\d*(?=\.html)/)
    
    return goodsId
  }
}