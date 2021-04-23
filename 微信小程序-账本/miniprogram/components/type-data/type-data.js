Component({

  properties: {
    booking: {
      type: Object,
      value: {}
    },

    total: {
      type: Number,
      value: 1
    }
  },
  
  methods:{
    click(e){
      this.triggerEvent('clicktypedata', {_ids: e.currentTarget.dataset._ids});
    }
  }
})