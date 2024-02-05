// TUI-CustomerService/TUIKit/plugins/message-bubble/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    message: {
      type: Object,
      value: {},
      observer(newVal) {
        if (!newVal) return;
        this.setData({
          message: newVal,
        });
      },
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    message: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },
});
