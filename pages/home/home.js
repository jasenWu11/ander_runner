// pages/home/home.js

const app = getApp();
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var order_data_list = {};
var latitude = wx.getStorageSync('latitude');
var longitude = wx.getStorageSync('longitude');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["全部", "待支付", "待接单", "待送达", "待评价", "已完成", "已取消"],
    activeIndex: 0,
    order_data: [],
    order_data_list: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('刷新')
    this.getallorder_list();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  checkprogress: function () {
    wx.navigateTo({
      url: 'progress/progress'
    });
  },
  getallorder_list() {
    var that = this;
    wx.request({
      url: app.globalData.URL + '/order/runner/list.do?userLng=' + longitude + '&userLat=' + latitude,
      method: 'get',
      dataType: 'json',
      responseType: 'text',
      header: {
        'Cookie': wx.getStorageSync('cookieKey')
      },
      data: {

      },
      success: function (res) {
        console.log("返回结果" + JSON.stringify(res));
        var status = res.data.status;
        if (status == 0) {
          var order_data = res.data.data;
          for (var i = 0; i < order_data.length; i++) {
            var distance = order_data[i].sDistance;
            order_data[i]['distance'] = (distance / 1000).toFixed(1) + '公里'
          }
          for (var i = 0; i < order_data.length; i++) {
            var distance = order_data[i].endDistance;
            order_data[i]['b_distance'] = (distance / 1000).toFixed(1) + '公里'
          }
          console.log(order_data);
          that.setData({
            order_data: order_data
          })
        } else {
          var msg = res.data.msg
          wx.showToast({
            title: msg,
            image: '/images/icons/wrong.png',
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '请求异常',
          image: '/images/icons/wrong.png',
        })
      },
      complete: function (res) {
        console.log("启动请求" + res);
      },
    })
  },
  to_detail: function (event) {
    var that = this;
    var oid = event.currentTarget.dataset.oid;
    wx.navigateTo({
      url: '../order_detail/order_detail?order_id=' + oid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  tomine: function () {
    wx.navigateTo({
      url: '../mine/mine'
    })
  },
  make_operation: function (event) {
    var that = this;
    var o_id = event.currentTarget.dataset.oid;
    wx.request({
      url: app.globalData.URL + '/order/runner/eceipt.do?id=' + o_id,
      method: 'get',
      dataType: 'json',
      header: {
        'Cookie': wx.getStorageSync('cookieKey')
      },
      responseType: 'text',
      success: function (res) {
        console.log("返回结果" + JSON.stringify(res));
        var status = res.data.status;
        if (status == 0) {
          wx.showToast({
            title: '接单成功',
            icon: 'success'
          })
          that.getallorder_list();
        } else {
          if (status == 10007) {
            wx.showModal({
              title: '未绑定学号',
              content: '您未绑定学号，绑定后才能发布订单',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                console.log(res);
                if (res.confirm) {
                  that.openbangDialog()
                } else {
                  console.log('用户点击辅助操作')
                }
              }
            });
          } else {
            var msg = res.data.msg;
            wx.showToast({
              title: msg,
              image: '/images/icons/wrong.png'
            })
          }
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '请求异常',
          image: '/images/icons/wrong.png',
        })
      },
      complete: function (res) {
        console.log("启动请求" + res);
      },
    })
  }
})