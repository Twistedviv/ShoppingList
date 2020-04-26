wx.cloud.init()
const db = wx.cloud.database()
const commd = db.collection('commodities')
const app = getApp()


Page({
  data: {
    list: [],
    selectedUrl: "",
    inputValue1: "",
    inputValue2: "",
    hiddenmodalput1: true,
    hiddenmodalput2: true,
    updateItemPlaceholder:""
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
      inputValue1: ""
    })
    wx.stopPullDownRefresh()
  },

  //-----------------点击item跳出操作项---------------------
  itemSelected: function (e) {
    let that = this
    this.setData({
      selectedUrl:this.data.list[e.currentTarget.id].url
    })
    wx.showActionSheet({
      itemList: ["修改名称", "删除"],
      success(res) {
        if (res.tapIndex == 0) {
          //修改名称
          that.updateItemName(e)
        } else {
          that.removeItem(e)
        }
      }
    })
  },
  
  updateItemName: function(e){
    //显示修改框并设置placeholder
    this.setData({
      updateItemPlaceholder:this.data.list[e.currentTarget.id].itemName,
      hiddenmodalput2: !this.data.hiddenmodalput2
    })
  },
  //实时监听inputValue2
  updateItem: function(e){
    this.setData({
      inputValue2:e.detail.value
    })
  },

  confirm2: function(){
    this.setData({
      hiddenmodalput2: true
    })
    commd.where({
      url: this.data.selectedUrl
    }).update({
      data:{
        itemName: this.data.inputValue2
      },
      success: function(res){
        console.log("更新成功:"+this.data.inputValue2)
        wx.startPullDownRefresh({
          complete: (res) => {console("改名刷新成功")},
        })
      }
    })
  },

  cancel2: function(){
    this.setData({
      hiddenmodalput2: true
    });
  },


  removeItem: function(e){
    //删除该项(找出对应list的第几项后，用list.item对应的url删除数据库中的数据)
    commd.where({
      url: this.data.list[e.currentTarget.id].url
    }).remove({
      success: function (res) {
        console.log("删除成功！")
        wx.startPullDownRefresh({});
      }
    })
  },

  //-------------------点击加号添加--------------------------
  addTap: function () {
    this.setData({
      hiddenmodalput1: !this.data.hiddenmodalput1
    });
  },

  //实时监听输入框中的地址，并修改页面变量inputValue
  addItem: function (e) {
    this.setData({
      inputValue1: e.detail.value
    })
  },

  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput1: true
    });
  },

  //确认  
  confirm: function (event) {
    let that = this
    this.setData({
      hiddenmodalput1: true
    })
    //异步操作爬虫获取价格，并存入数据库，成功后刷新页面
    wx.cloud.callFunction({
      name: "scrapyWeb",
      data: {
        url: that.data.inputValue1
      },
      success: function (res) {
        console.log(res.result[0].length)
        commd.add({
          data: {
            url: that.data.inputValue1,
            itemName: res.result[0].length < 10 ? res.result[0] : res.result[0].substring(0, 9),
            nPrice: res.result[1],
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
    wx.cloud.callFunction({
      name: 'scrapyWeb',
      data:{
        url:"https://item.jd.com/10462486984.html"
      },
      success: function (res) {
        console.log(res.result)
      },
      fail: function (err) {
        console.log("scrapyWeb fail")
        console.log(err)
      }
    })
    
  }

})