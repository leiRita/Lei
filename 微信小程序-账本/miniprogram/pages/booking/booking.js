// miniprogram/pages/booking/booking.js
//导入外部js
let tool = require('../../js/tool');

//获取小程序的实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //骨架屏
    loading: true,

    //每一页显示10个子类型
    typecont:10,

    //子类型的页码
    page:-1,

    //当前页的下标
    iconIndex: -1,

    //收入-支出切换激活标
    datatype:0,

    //账户类型的激活下标
    activeAccountIndex: -1,

    //记账类型(收入-支出)
    bookingtype:[
      {
        title:'收入',
        type:'sr'
      },{
        title:'支出',
        type:'zc'
      }
    ],
    //记账的子类型
    subTypes: [],

    //账户类型
    accounts:[
      {
        name: '现金',
        type: 'xj'
      },
      {
        name: '支付宝',
        type: 'zfb'
      },
      {
        name: '微信',
        type: 'wx'
      },
      {
        name: '信用卡',
        type: 'xyk'
      },
      {
        name: '储蓄卡',
        type: 'cxk'
      },
    ],
    //当前日期
    currentDate: '',

    //选择日期
    date: '选择日期',

    //金额
    money: '',

    //备注
    comment: '',

    //用户是否已经授权
    isAuth: false
  },

  //切换商品类型(收入-支出), 账户类型
  onLoad:function(options){
    this.findbookingstub();

    //获取当前日期
    let date = new Date();
    this.data.currentDate = tool.formatDate(date,'yyyy-MM-dd');
    console.log('this.data.currentDate ==> ', this.data.currentDate);
    this.setData({
      currentDate:this.data.currentDate
    })
  },

  onShow(){
    this.setData({
      isAuth:app.globalData.isAuth
    })
  },

  toggleBookingType(e){
    //获取下标
    let index = e.currentTarget.dataset.index;

    let key = e.currentTarget.dataset.key;
    console.log('key==>',key);

    if(index == this.data[key]){
      return;
    }

    this.data[key] = index;

    this.setData({
      [key]:index
    })
  },

  //切换子类型
  toggleSubtype(e){
    //获取页码
    let page = e.currentTarget.dataset.page;

    //获取当前页的图标的下标
    let index = e.currentTarget.dataset.index;

    //获取当前页的当前的图标
    let currentIcon = this.data.subTypes[page][index];
    console.log('currentIcon ==>',currentIcon);

    if(currentIcon.isAction){
      return
    }

    let isHas = false;

    //将其它激活状态去除
    for(let i = 0;i<this.data.subTypes.length;i++){
      let icondata = this.data.subTypes[i];
      console.log('yyy',icondata);
      for(let j = 0;j < icondata.length; j++){
        console.log('1222');
        if (icondata[j].isAction) {
          //将其他激活的状态去除
          icondata[j].isAction = false;
          isHas = true;
          break;
        }
      }

      if (isHas) {
        break;
      }

    }
    //将图标激活
    currentIcon.isAction=true;
    this.setData({
      subTypes:this.data.subTypes,
      page,
      iconIndex:index
    })
  },

  //查询记账子类型
  findbookingstub(){
    console.log('开启云函数调用');

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    wx.cloud.callFunction({
      // 云函数名称
      name:'find_data',
      //参数
      data:{
        //集合名称
        listName:'booking_icons'
      }
    }).then(res =>{
      console.log("res==>",res);
      wx.hideLoading()

      res.result.data.forEach(v => {
        v.isAction = false;
      });
      let typedata = [];
      for(let i = 0;i < res.result.data.length;i += this.data.typecont){
        let types=res.result.data.slice(i , i + this.data.typecont);
        typedata.push(types);
      }
      console.log("typedata ==>",typedata);

      this.setData({
        subTypes:typedata,
        loading: false
      })
    }).catch((err)=>{
      wx.hideLoading()
      console.log("err==>",err);
    })
  },

  //输入框的值
  setValue(e){
    let key = e.currentTarget.dataset.key;
    console.log('key=>',key);
    let value = e.detail.value;

    if(key == 'comment' && /[<>]/.test(value)){
      wx.showToast({
        title: '备注不包括<>符号',
        icon:'none',
        duration:3000
      })
      this.setData({
        [key]:''
      })
      return;
    }

    this.setData({
      [key]:e.detail.value
    })

    console.log('this.data[key] ==> ', this.data[key]);
  },

  //添加记账数据
  creatBooking(data){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      name:'create_data',
      data
    }).then(res => {
      wx.hideLoading();
      console.log('res=>',res);
      this.data.subTypes[this.data.page][this.data.iconIndex].isAction = false;

      this.setData({
        //选择日期
        date: '选择日期',

        //金额
        money: '',

        //备注
        comment: '',
        //子类型的页码
        page: -1,

        //当前页的下标
        iconIndex: -1,

        //账户类型的激活下标
        activeAccountIndex: -1,

        subTypes: this.data.subTypes
      })

      wx.showToast({
        title: '保存成功',
        icon: 'none',
        duration: 2000
      })

    }).catch(err => {
      wx.hideLoading();
      console.log('err==>',err);
    })
  },

  //保存记账数据
  save(){
    //判断是否选择子类型
    if (this.data.page == -1 && this.data.iconIndex == -1) {
      return wx.showToast({
        title: '选择账户类型',
        icon:'none',
        duration:3000
      })
    }

    //判断是否选择账户类型
    if (this.data.activeAccountIndex == -1) {
      return wx.showToast({
        title: '选择记账类型(餐饮，购物等)',
        icon:'none',
        duration:3000
      })
    }

    //判断是否选择日期
    if (this.data.date == '选择日期') {
      return wx.showToast({
        title: '选择日期',
        icon:'none',
        duration:3000
      })
    }

    //判断是否填写金额
    if (!this.data.money) {
      return wx.showToast({
        title: '请填写金额',
        icon:'none',
        duration:3000
      })
    }

    //记账数据
    let data = {
      date:this.data.date,
      money:this.data.money,
      comment:this.data.comment,
      listName:'booking'
    }

    console.log('data==>',data);

    //获取收入-支出类型
    data.mintype = this.data.bookingtype[this.data.datatype];

    //获取子类型
    data.subtypes = this.data.subTypes[this.data.page][this.data.iconIndex];

    //获取账户类型
    data.account = this.data.accounts[this.data.activeAccountIndex]

    //添加记账数据
    this.creatBooking(data);
  },

  //获取用户授权信息
  getuserAuthInfo(res){
    if(res.detail.userInfo){
      app.globalData.isAuth = true;
      this.setData({
        isAuth: true
      })
    }
    console.log("huoqu=>信息",res);
  }
})