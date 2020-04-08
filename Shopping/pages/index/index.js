wx.cloud.init()
const db = wx.cloud.database()
const commd = db.collection('commodities')
const app = getApp()


Page({
  data: {
    list: [],
    inputValue: "",
    hiddenmodalput: true,
  },

  //------------页面第一次加载时，渲染list------------------
  onLoad: async function () {
    //等待获取openid后再查询数据库
    await app.getOpenid().then(openid => {
      console.log(openid)
      app.globalData.openid = openid
    })
    commd.where({
      _openid: app.globalData.openid
    }).get().then(res => {
      this.setData({
        list: res.data
      })
    })
  },

  //-------------------重写下拉刷新-------------------
  onPullDownRefresh: function () {
    let that = this
    //每次刷新时，以openid为条件，查询用户list，重新渲染
    commd.where({
      _openid: app.globalData.openid
    }).get({
      success: function (res) {
        //刷新成功，控制台打印list
        console.log("刷新成功！")
        console.log(res.data);
        that.setData({
          list: res.data
        })
      }
    })
    //刷新后清空input
    that.setData({
      inputValue: ""
    })
    wx.stopPullDownRefresh()
  },

  //-----------------点击item跳出操作项---------------------
  itemSelected: function (e) {
    let that = this
    wx.showActionSheet({
      itemList: ["复制链接", "删除"],
      success(res) {
        if (res.tapIndex == 0) {
          //复制链接
        } else {
          //删除该项(找出对应list的第几项后，用list.item对应的url删除数据库中的数据)
          commd.where({
            url: that.data.list[e.currentTarget.id].url
          }).remove({
            success: function (res) {
              console.log("删除成功！")
              wx.startPullDownRefresh({});
            }
          })
        }
      }
    })
  },

  //-------------------点击加号添加--------------------------
  addTap: function () {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    });
  },
  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //实时监听输入框中的地址，并修改页面变量inputValue
  addItem: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //确认  
  confirm: function (event) {
    let that = this
    this.setData({
      hiddenmodalput: true
    })
    //异步操作爬虫获取价格，并存入数据库，成功后刷新页面
    wx.cloud.callFunction({
      name: "scrapyWeb",
      data: {
        url: that.data.inputValue
      },
      success: function (res) {
        commd.add({
          data: {
            url: that.data.inputValue,
            nPrice: res.result,
            createDate: db.serverDate()
          },
          success: function (res) {
            console.log("添加成功！");
            wx.startPullDownRefresh({});
          }
        })
      }
    })
  },

  test: function () {
    let nowprice = wx.cloud.callFunction({
      name: 'scrapyWeb',
      data: {
        url: "https://item.jd.com/100006320174.html"
      },
      success: function (res) {
        console.log("scrapyWeb ok")
      },
      fail: function (err) {
        console.log("scrapyWeb fail")
        console.log(err)
      }
    })
    console.log("price is $" + nowprice)
  }

})