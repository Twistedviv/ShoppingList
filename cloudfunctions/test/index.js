// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var str = "https://item.jd.com/100004772689.html"
  var reg = "//"
  var id = str.match(/\d*(?=\.html)/)
  
  return id
}