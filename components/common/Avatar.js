const defaultImage = 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    imageSrc: {
      type: String,
      value: '',
      observer(imageSrc) {
        this.setData({
          imageSrc,
        });
      },
    },
  },

  lifetimes: {
    attached() {
      if (!this.data.imageSrc) {
        this.setData({
          imageSrc: defaultImage,
        });
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    imageSrc: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleErrorImage() {
      this.setData({
        imageSrc: defaultImage,
      });
    },
  },
});
