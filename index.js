// TUIKitWChat/Chat/index.js
import Aegis from './lib/aegis';
import constant from './utils/constant';
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowConversation: false,
    isShowConversationList: true,
    currentConversationID: '',
    unreadCount: 0,
    config: {
      userID: '',
      userSig: '',
      type: 1,
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      const { config } = this.data;
      config.userID = wx.$chat_userID;
      config.userSig = wx.$chat_userSig;
      this.setData({
        config,
      }, () => {
        this.TUICallKit = this.selectComponent('#TUICallKit');
        this.TUICallKit.init();
      });
      const TUIConversation = this.selectComponent('#TUIConversation');
      TUIConversation.init();
      if (app?.globalData?.reportType !== constant.OPERATING_ENVIRONMENT) {
        this.aegisInit();
      }
      wx.$chat_reportType = 'chat-uikit-wechat';
      wx.aegis.reportEvent({
        name: 'time',
        ext1: 'first-run-time',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
    },
    aegisInit() {
      wx.aegis = new Aegis({
        id: 'iHWefAYquFxvklBblC', // 项目key
        reportApiSpeed: true, // 接口测速
        reportAssetSpeed: true, // 静态资源测速
        pagePerformance: true, // 开启页面测速
      });
    },
    currentConversationID(event) {
      this.setData({
        isShowConversation: true,
        isShowConversationList: false,
        currentConversationID: event.detail.currentConversationID,
        unreadCount: event.detail.unreadCount,
      }, () => {
        const TUIChat = this.selectComponent('#TUIChat');
        TUIChat.init();
      });
    },
    showConversationList() {
      this.setData({
        isShowConversation: false,
        isShowConversationList: true,
      }, () => {
        const TUIConversation = this.selectComponent('#TUIConversation');
        TUIConversation.init();
      });
    },
    handleCall(event) {
      if (event.detail.groupID) {
        this.TUICallKit.groupCall(event.detail);
      } else {
        this.TUICallKit.call(event.detail);
      }
    },
    sendMessage(event) {
      this.selectComponent('#TUIChat').sendMessage(event);
    },
  },
});
