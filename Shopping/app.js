var app = getApp();
wx.cloud.init();
// const db = wx.cloud.database();
// const commd = db.collection('commodities');
App({
  globalData: {
    openid: ""
  },
  onLaunch: function() {

  },
  getOpenid:()=>{
    let that = this;
    return new Promise((resolve,reject) => {
      wx.cloud.callFunction({
        name: 'getOpenId',
        success: function (res) {
          resolve(res.result.openid)
        }
      })
    })
  }

})



