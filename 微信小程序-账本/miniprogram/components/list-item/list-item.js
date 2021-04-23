// miniprogram/components/list-item/list-item.js
Component({

  /**
   * 页面的初始数据
   */
  properties: {
    title:{
      type:String,
      value:'标题'
    }
  },

  data:{},

  methods:{
    clickListItem(){
      this.triggerEvent('clickListItem');
    }
  },
})