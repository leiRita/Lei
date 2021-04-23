// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookingData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _ids = options._ids.split('-');
    this.getBookingDataById(_ids);
  },

  //根据记账_id查询数据
  getBookingDataById(_ids){
    wx.cloud.callFunction({
      name:'find_booking_by_id',
      data:{
        _ids
      }
    }).then(res =>{
      let data = res.result.data[0];
      console.log('res==>',res);
      wx.setNavigationBarTitle({
        title: `${data.mintype.title}-${data.subtypes.name}记账详情`
      })
      this.setData({
        bookingData:res.result.data,
      })
    }).catch(err =>{
      console.log('err==>',err);
    })
    
  }

})