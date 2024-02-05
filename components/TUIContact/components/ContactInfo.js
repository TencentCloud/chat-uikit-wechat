

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    contactInfo: {
      type: Object,
      value: {},
      observer(newVal) {
        this.setData({
          contactInfo: newVal,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    contactInfo: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack() {
      this.triggerEvent('showContact');
    },
    createConversation() {
      this.triggerEvent('createConversation', { currentConversationID: `C2C${this.data.contactInfo.userID}` });
    },
  },

  lifetimes: {
    attached() {
    },
  },
});
