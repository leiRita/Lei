Component({
  properties:{
    isDelete:{
      type:Boolean,
      value:false
    },
    bookingData:{
      type:Object,
      value:{}
    }
  },

  methods: {
    //删除当前记账数据
    removeCurrentBooking(e) {
      let _id = e.currentTarget.dataset._id;
      // console.log('_id ==> ', _id);
      this.triggerEvent('remove', {_id});
    }
  }
})