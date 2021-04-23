import * as echarts from '../../components/ec-canvas/echarts';
let tool = require('../../js/tool');

//保存绘制canvas图形对象
let chartCanvas = null;

Page({
  data: {
    loading: false,
    ec: {
      onInit: null
    },

    //日期
    date:'选择日期',

    copyDate:'',

    //结束日期
    end:'',

    //日期状态，0年，1月，2月
    dateStatus:0,

    //默认激活下标
    activeIndex:0,
    //收入支出
    subType:[
      {
        title:'收入',
        type:'sr',
        money:0
      },
      {
        title:'支出',
        type:'zc',
        money:0
      }
    ],

    //大月 具有31天的月份
    largeMonth:['01','03','05','07','08','10','12'],

    //记账数据
    bookingData:{},

  },

  onLoad() {
    let currentDate = tool.formatDate(new Date(), 'yyyy-MM-dd');
    this.setData({
      end: currentDate,
      copyDate: currentDate.split('-'),
      ec:{
        onInit:this.initChart
      }
    })
    this.initDate();
    this.findBookingDataByDate();
  },

  //初始化饼图
  initChart(canvas,width,height,dpr){

    let chart = echarts.init(canvas,null,{
      width:width,
      height:height,
      devicePixelRatio: dpr
    });
    canvas.setChart(chart);

    //绘制canvas
    chart.setOption({});

    chartCanvas = chart;

    return chart;
  },

  //选择日期
  selectDate(e){
    console.log('e==>',e);
    let date = e.detail.value.split('-');
    this.setData({
      copyDate:date
    })
    this.initDate();
    this.findBookingDataByDate();
  },

  //初始化查询方法选择日期
  initDate(){
    let dateStatus = this.data.dateStatus;

    let date = this.data.copyDate;

    if (dateStatus == 0) {
      this.data.date = `${date[0]}年`;
    }else if (dateStatus == 1) {
      this.data.date = `${date[0]}年${date[1]}月`;
    }else{
      this.data.date = `${date[0]}年${date[1]}月${date[2]}日`;
    }

    this.setData({
      date:this.data.date
    })
  },

  //切换日查询方式
  toggleDateType(){
    let dateStatus = this.data.dateStatus;

    if (dateStatus == 2) {
      dateStatus = 0;
    }else{
      dateStatus++;
    }

    this.setData({
      dateStatus
    })

    this.initDate();
    this.findBookingDataByDate();
  },

  //切换收入和支出
  toggleSubType(e){
    console.log('e==>',e);

    let index = e.currentTarget.dataset.index;
    if (index == this.data.activeIndex) {
      return;
    }

    this.setData({
      activeIndex:index
    })

    this.getColorsByType();
  },

  //获取不同类型的颜色
  getColorsByType(){
    //颜色
    let colors = [];

    //获取指定类型的颜色（收入和支出）
    let type = this.data.bookingData[this.data.subType[this.data.activeIndex].type];
    let tyData = type ? type.subType : [];
    console.log('tyData==>',tyData);

    tyData.forEach(v=>{
      colors.push(v.color);
    })

    this.drawPie(colors,tyData);
  },

  //绘制饼图
  drawPie(colors,tyData){
    let option = {
      backgroundColor:'#ffffff',

      legend:{
        top:'bottom',
        left:'center',
      },
      series:[{
        ladel:{
          normal:{
            fontSize:14
          }
        },
        type:'pie',
        center:['50%','50%'],
        radius:[0,'50%'],

        //动态颜色
        color:colors,

        //动态饼图数据
        data:tyData
      }]
    };
    chartCanvas.setOption(option);
  },

  //查询记账数据
  findBookingData(name,data){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      name,
      data,
    }).then(result =>{
      wx.hideLoading();
      console.log('【查询记账数据】result ==> ', result);
      // 按照收入和支出分类
      let typeData = {};

      //遍历result.result.data
      result.result.data.forEach(v =>{

        if (!typeData[v.mintype.type]) {
          typeData[v.mintype.type] = [v];
        } else {
          typeData[v.mintype.type].push(v);
        }

      })

      console.log('typeData ==> ', typeData);

      //在收入和支出筛选子类型（学习，购物）
      let bookingData = {};
      for (let key in typeData) {
        let ty = {
          total: 0,
          subType: {}
        };
        typeData[key].forEach(v => {
          ty.total += Number(v.money);

          //寻找subType是否含有学习、健康等类型
          let keys = Object.keys(ty.subType);
          if (keys.indexOf(v.subtypes.type) === -1) {

            let color = tool.createRandomColor()
            //如果找不到, 初始化
            ty.subType[v.subtypes.type] = {
              name: v.subtypes.name,
              title:v.subtypes.name,
              value: Number(v.money),
              count: 1,
              type: [v],
              icon: v.subtypes.icons,
              color,
              _ids:[v._id]
            }

          } else {
            ty.subType[v.subtypes.type].value += Number(v.money);
            ty.subType[v.subtypes.type].count++;
            ty.subType[v.subtypes.type].type.push(v);
            ty.subType[v.subtypes.type]._ids.push(v.id);
          }
        })

        bookingData[key] = ty;
      }

      console.log('bookingData ==> ', bookingData);
      
      this.data.subType.forEach(v => {
        v.money=0;
        if(bookingData[v.type]){
          v.money= bookingData[v.type].total;
        }
        
      })

      for(let k in bookingData){
        let bd = bookingData[k].subType;
        console.log('bd==>',bd);

        let tyDataArray = [];
        for(let key in bd){
          bd[key].ty = key;
          bd[key].name = bd[key].name +' '+Math.round(bd[key].value / bookingData[k].total * 100) + '%';
          tyDataArray.push(bd[key]);
        }
        bookingData[k].subType = tyDataArray;
      }

      this.setData({
        bookingData,
        subType: this.data.subType
      })

      console.log('this.data.bookingData ==> ', this.data.bookingData);
      this.getColorsByType();

    }).catch(err =>{
      wx.hideLoading();
      console.log('err==>',err);
    })
  },

  //根据日期查询记账数据
  findBookingDataByDate(){

    //获取查询日期条件
    let start = '';
    let end = '';

    //获取当前日期
    let current = tool.formatDate(new Date(), 'yyyy-MM-dd').split('-');
    console.log('current ==> ', current);

    //获取用户查询的日期
    let copyDate = this.data.copyDate;
    console.log('copyDate ==> ', copyDate);

    //如果同年
    if (current[0] == copyDate[0]) {
      console.log('同年');
      if (this.data.dateStatus == 0) {
        /**
          * 1、按年查询
          * date的查询条件范围：当年-01-01 至 当年-当前的月份-当前的日份
        **/
        start = `${copyDate[0]}-01-01`;
        end = current.join('-');
      } else if (this.data.dateStatus == 1) {
        /**
          * 2、按月查询
          * 
        **/
       start = `${copyDate[0]}-${copyDate[1]}-01`;

       console.log('按月查询');
       if (current[1] == copyDate[1]) {
          //如果同月
          //date的查询条件范围 当年当月-01 至 当年当月当日
          end = current.join('-');
       } else {

        //如果不同月
        
        if (copyDate[1] == 2) {
          //如果是2月份
          //判断年份是否为闰年
          if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
            //date的查询条件范围 当年-02-01 至 当年02-29
           
            end = `${copyDate[0]}-${copyDate[1]}-29`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-28`;
          }

        } else {
          //如果不是2月份
          //判断月份是否大月(1, 3, 5, 7, 8, 10, 12)
          if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
            end = `${copyDate[0]}-${copyDate[1]}-31`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-30`;
          }
        }

       } 
       

      } else {
        
        /**
          * 3、按日查询
          * date的查询条件范围：当年当月当日
        **/
        console.log('按日查询');
        start = copyDate.join('-');
      }


    }else{
      console.log('不同年');

      if (this.data.dateStatus == 0) {
        //按年查询
        start = `${copyDate[0]}-01-01`;
        end = `${copyDate[0]}-12-31`;
      } else if (this.data.dateStatus == 1) {
        //按月查询
        start = `${copyDate[0]}-${copyDate[1]}-01`;
        if (copyDate[1] == 2) {
          //如果是2月份
          //判断年份是否为闰年
          if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
            //date的查询条件范围 当年-02-01 至 当年02-29
           
            end = `${copyDate[0]}-${copyDate[1]}-29`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-28`;
          }

        } else {
          //如果不是2月份
          //判断月份是否大月(1, 3, 5, 7, 8, 10, 12)
          if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
            end = `${copyDate[0]}-${copyDate[1]}-31`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-30`;
          }
        }

      } else {
        //按日查询
        start = copyDate.join('-');
      }

    }

    //如果存在end
    if (end) {
      //根据start和end查询记账数据
      //调用云函数【find_booking_by_month】
      this.findBookingData('find_booking_by_month', {start, end});
    } else {
      //根据start查询记账数据
      //调用云函数【find_data】
      this.findBookingData('find_data', {date: start, listName: 'booking'});
    }

  },

  //查看记账详情
  goDetail(e){
    wx.navigateTo({
      url: `../detail/detail?_ids=${e.detail._ids.join('-')}`,
    })
  }
});