import constant from "../../utils/constant";

// TUIKitWChat/Conversation/index.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    config: {
      type: Object,
      value: {},
      observer(config) {
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    conversationList: [],
    currentConversationID: '',
    showSelectTag: false,
    array: [
      { id: 1, name: '发起会话' },
      { id: 2, name: '发起群聊' },
      { id: 3, name: '加入群聊' },
    ],
    index: Number,
    unreadCount: 0,
    conversationInfomation: {},
    transChenckID: '',
    userIDList: [],
    statusList: [],
    currentUserIDList: [],
    showConversationList: true,
    showCreateConversation: false,
    showCreateGroup: false,
    showJoinGroup: false,
    handleChangeStatus: false,
    storageList: [],
  },
  lifetimes: {
    attached() {
    },
    detached() {
      wx.$TUIKit.off(wx.$TUIKitTIM.EVENT.CONVERSATION_LIST_UPDATED, this.onConversationListUpdated, this);
      wx.$TUIKit.off(wx.$TUIKitTIM.EVENT.USER_STATUS_UPDATED, this.onUserStatusUpdate, this);
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.CONVERSATION_LIST_UPDATED, this.onConversationListUpdated, this);
      wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.USER_STATUS_UPDATED, this.onUserStatusUpdate, this);
      this.getConversationList();
      wx.getStorageInfo({
        success(res) {
          wx.setStorage({
            key: 'storageList',
            data: res.keys,
          });
        },
      });
      this.setData({
        handleChangeStatus: wx.getStorageSync(app?.globalData?.userInfo?.userID) ? wx.getStorageSync(app?.globalData?.userInfo?.userID) : true,
      }, () => {
        if (!wx.getStorageSync('storageList').includes('showOnlineStatus')) {
          this.handleChangeStatus();
        }
      });
    },
    goBack() {
      if (app?.globalData?.reportType !== constant.OPERATING_ENVIRONMENT) {
        wx.navigateBack({
          delta: 1,
        });
      } else {
        wx.switchTab({
          url: '/pages/TUI-Index/index',
        });
      }
    },
    // 更新会话列表
    onConversationListUpdated(event) {
      this.setData({
        conversationList: event.data,
      });
      this.filterUserIDList(event.data);
    },
    transCheckID(event) {
      this.setData({
        transChenckID: event.detail.checkID,
      });
    },
    // 更新状态
    onUserStatusUpdate(event) {
      event.data.forEach((element) => {
        const index = this.data.statusList.findIndex(item => item.userID === element.userID);
        if (index === -1) {
          return;
        }
        this.data.statusList[index] = element;
        this.setData({
          statusList: this.data.statusList,
        });
      });
    },
    getConversationList() {
      wx.$TUIKit.getConversationList().then((imResponse) => {
        this.setData({
          conversationList: imResponse.data.conversationList,
        });
        this.filterUserIDList(imResponse.data.conversationList);
      });
    },
    // 跳转到子组件需要的参数
    handleRoute(event) {
      const flagIndex = this.data.conversationList.findIndex(item => item.conversationID === event.currentTarget.id);
      this.setData({
        index: flagIndex,
      });
      this.getConversationList();
      this.setData({
        currentConversationID: event.currentTarget.id,
        unreadCount: this.data.conversationList[this.data.index].unreadCount,
      });
      this.triggerEvent('currentConversationID', { currentConversationID: event.currentTarget.id,
        unreadCount: this.data.conversationList[this.data.index].unreadCount });
    },
    // 展示发起会话/发起群聊/加入群聊
    showSelectedTag() {
      wx.aegis.reportEvent({
        name: 'conversationType',
        ext1: 'conversationType-all',
      });
      this.setData({
        showSelectTag: !this.data.showSelectTag,
      });
    },
    handleOnTap(event) {
      this.setData({
        showSelectTag: false,
      }, () => {
        switch (event.currentTarget.dataset.id) {
          case 1:
            this.setData({
              showCreateConversation: true,
              showConversationList: false,
            });
            break;
          case 2:
            this.setData({
              showCreateGroup: true,
              showConversationList: false,
            });
            break;
          case 3:
            this.setData({
              showJoinGroup: true,
              showConversationList: false,
            });
            break;
          default:
            break;
        }
      });
    },
    // 点击空白区域关闭showMore弹窗
    handleEditToggle() {
      this.setData({
        showSelectTag: false,
      });
    },
    showConversation(event) {
      this.setData({
        showConversationList: true,
        showCreateConversation: false,
        showCreateGroup: false,
        showJoinGroup: false,
      });
    },
    searchUserID(event) {
      this.triggerEvent('currentConversationID', { currentConversationID: event.detail.searchUserID });
    },
    searchGroupID(event) {
      this.triggerEvent('currentConversationID', { currentConversationID: event.detail.searchGroupID });
    },
    createGroupID(event) {
      this.triggerEvent('currentConversationID', { currentConversationID: event.detail.createGroupID });
    },
    // 处理当前登录账号是否开启在线状态
    handleChangeStatus() {
      const currentID = wx.$chat_userID;
      const cacheList = wx.getStorageSync('currentUserID');
      const nowList = [];
      nowList.push(wx.$chat_userID);
      if (cacheList.length === 0 || !cacheList.includes(wx.$chat_userID)) {
        wx.setStorage({
          key: 'currentUserID',
          data: wx.getStorageSync('currentUserID').concat(nowList),
        });
      }
      wx.setStorage({
        key: currentID,
        data: this.data.handleChangeStatus,
      });
    },
    // 订阅在线状态
    subscribeOnlineStatus(userIDList) {
      wx.$TUIKit.getUserStatus({ userIDList }).then((imResponse) => {
        const { successUserList } = imResponse.data;
        this.setData({
          statusList: successUserList,
        });
      })
        .catch((imError) => {
          console.warn('开启在线状态功能，需要您开通旗舰版套餐：https://buy.cloud.tencent.com/avc'); // 获取用户状态失败的相关信息
        });
      wx.$TUIKit.subscribeUserStatus({ userIDList });
    },

    // 过滤会话列表，找出C2C会话，以及需要订阅状态的userIDList
    filterUserIDList(conversationList) {
      if (conversationList.length === 0) return;
      const userIDList = [];
      conversationList.forEach((element) => {
        if (element.type === wx.$TUIKitTIM.TYPES.CONV_C2C) {
          userIDList.push(element.userProfile.userID);
        }
      });
      const currentUserID = wx.getStorageSync('currentUserID');
      if (currentUserID.includes(wx.$chat_userID)) {
        const currentStatus = wx.getStorageSync(wx.$chat_userID);
        if (currentStatus) {
          this.subscribeOnlineStatus(userIDList);
        }
      } else {
        this.subscribeOnlineStatus(userIDList);
      }
    },

    learnMore() {
      if (app?.globalData?.reportType !== constant.OPERATING_ENVIRONMENT) return;
      wx.navigateTo({
        url: '/pages/TUI-User-Center/webview/webview?url=https://cloud.tencent.com/product/im',
      });
    },
  },
});
