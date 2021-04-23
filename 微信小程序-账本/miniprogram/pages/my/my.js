
//获取小程序实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    userInfoData:{},
    isAuth:false
  },

  onLoad(){
    this.getUserInfo();
  },

  onShow(){
    this.setData({
      isAuth: app.globalData.isAuth
    })
  },

  onReady(){
    setTimeout(()=>{
      this.setData({
        loading:false
      })
    },1000)
  },

  viewMyBooking(){
    wx.navigateTo({
      url: '../myBooking/myBooking',
    })
  },

  // viewWeather(){
  //   wx.navigateTo({
  //     url: '../weather/weather',
  //   })
  // },

  //获取用户信息
  getUserInfo(){
    if(app.globalData.isAuth){

      wx.getUserInfo({
        success:res => {
          this.setData({
            userInfoData:res.userInfo
          })

          console.log('this.data.userInfoData ==> ', this.data.userInfoData);

        }
      })

    }
  },

  //获取用户信息
  getuserAuthInfo(res){
    if(res.detail.userInfo){
      app.globalData.isAuth = true;
      this.setData({
        isAuth: true,
        userInfoData: res.detail.userInfo
      })
    }
  }

})