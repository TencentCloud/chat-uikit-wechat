// TUIKitWChat/Chat/index.js
import constant from './utils/constant';
import TUICore, {
  TUIConstants,
} from '@tencentcloud/tui-core';
import TUICustomerServer from '@tencentcloud/tui-customer-service-plugin-wechat/server';

const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    conversationID: {
      type: String,
      value: '',
      observer(conversationID) {
        this.setData({
          outsideConversation: true,
          currentConversationID: conversationID,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowConversation: false,
    isShowConversationList: false,
    currentConversationID: '',
    unreadCount: 0,
    hasCallKit: false,
    config: {
      userID: '',
      userSig: '',
      type: 1,
      tim: null,
      SDKAppID: 0,
    },
    outsideConversation: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      const {
        config,
      } = this.data;
      config.userID = wx.$chat_userID;
      config.userSig = wx.$chat_userSig;
      config.tim = wx.$TUIKit;
      config.SDKAppID = wx.$chat_SDKAppID;
      if (this.data.outsideConversation) {
        this.currentConversationID({
          detail: {
            currentConversationID: this.data.currentConversationID,
            unreadCount: 0,
          },
        });
      } else {
        this.showConversationList();
      }
      this.setData(
        {
          config,
        },
        () => {
          this.initCallKit();
        },
      );
      TUICustomerServer.getInstance();
    },
    initCallKit() {
      if (TUICore.getService(TUIConstants.TUICalling.SERVICE.NAME)) {
        this.setData({
          hasCallKit: true,
        });
      }
    },
    createConversation(event) {
      this.setData(
        {
          isShowConversation: true,
          currentConversationID: event.detail.currentConversationID,
          unreadCount: event.detail.unreadCount,
        },
        () => {
          const TUIChat = this.selectComponent('#TUIChat');
          TUIChat.init();
          const timer = setTimeout(() => {
            const TUIConversation = this.selectComponent('#TUIConversation');
            TUIConversation.destroy();
            clearTimeout(timer);
          }, 300);
        },
      );
    },
    showConversationList() {
      if (this.data.outsideConversation) {
        this.handleBack();
      } else {
        const TUIConversation = this.selectComponent('#TUIConversation');
        TUIConversation.init();
        this.setData({
          isShowConversation: false,
        });
      }
    },
    async handleCall(event) {
      let { userIDList = [] } = event.detail;
      const { groupID = '', userID = '', type } = event.detail;
      if (userID) {
        userIDList = [userID];
      }
      TUICore.callService({
        serviceName: TUIConstants.TUICalling.SERVICE.NAME,
        method: TUIConstants.TUICalling.SERVICE.METHOD.START_CALL,
        params: {
          groupID,
          userIDList,
          type,
        },
      });
    },
    handleBack() {
      if (
        app.globalData
        && app.globalData.reportType !== constant.OPERATING_ENVIRONMENT
      ) {
        wx.navigateBack({
          delta: 1,
        });
      } else {
        wx.switchTab({
          url: '/pages/TUI-Index/index',
        });
      }
    },
    sendMessage(event) {
      this.selectComponent('#TUIChat').sendMessage(event);
    },
  },
});
