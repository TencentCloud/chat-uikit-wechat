import { caculateTimeago } from '../../../../utils/common';
const app = getApp();
// eslint-disable-next-line no-undef
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    conversation: {
      type: Object,
      value: {},
      observer(conversation) {
        this.setData({
          conversationName: this.getConversationName(conversation),
          setConversationAvatar: this.setConversationAvatar(conversation),
        });
        this.setMuteIcon(conversation);
        this.showMuteIconImg(conversation);
        this.$updateTimeAgo(conversation);
        this.setPinName(conversation.isPinned);
      },
    },
    charge: {
      type: Boolean,
      value: {},
      observer(charge) {
        if (!charge) {
          this.setData({
            xScale: 0,
          });
        }
      },
    },
    statusList: {
      type: Array,
      value: [],
      observer(statusList) {
        this.setUserStatus(this.data.conversation, statusList);
      },
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    xScale: 0,
    conversationName: '',
    conversationAvatar: '',
    conversation: {},
    showName: '',
    showMessage: '',
    showPin: '置顶聊天',
    showMute: '消息免打扰',
    popupToggle: false,
    isTrigger: false,
    num: 0,
    setShowName: '',
    showMuteIcon: false,
    showStatus: false,
  },
  lifetimes: {
    attached() {
    },

  },
  pageLifetimes: {
    // 展示已经置顶的消息和更新时间戳
    show() {
      this.showMuteIconImg(this.data.conversation);
      this.setPinName(this.data.conversation.isPinned);
      this.setMuteIcon(this.data.conversation);
      this.$updateTimeAgo(this.data.conversation);
    },
    // 隐藏动画
    hide() {
      this.setData({
        xScale: 0,
      });
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 切换置顶聊天状态
    setPinName(isPinned) {
      this.setData({
        showPin: isPinned ? '取消置顶' : '置顶聊天',
      });
    },
    // 切换免打扰状态
    setMuteIcon(conversation) {
      this.setData({
        showMute: (conversation.messageRemindType === 'AcceptNotNotify') ? '取消免打扰' : '消息免打扰',
      });
    },
    // 先查 remark；无 remark 查 (c2c)nick/(group)name；最后查 (c2c)userID/(group)groupID
    // 群会话，先展示namecard,无namecard展示nick，最展示UserID
    getConversationName(conversation) {
      if (conversation.type === '@TIM#SYSTEM') {
        return '系统通知';
      }
      if (conversation.type === 'C2C') {
        return conversation.remark || conversation.userProfile.nick || conversation.userProfile.userID;
      }
      if (conversation.type === 'GROUP') {
        if (conversation.lastMessage.nameCard !== '') {
          this.data.setShowName = conversation.lastMessage.nameCard;
        } else if (conversation.lastMessage.nick !== '') {
          this.data.setShowName = conversation.lastMessage.nick;
        } else {
          if (conversation.lastMessage.fromAccount === wx.$chat_userID) {
            this.data.setShowName = '我';
          } else {
            this.data.setShowName = conversation.lastMessage.fromAccount;
          }
        }
        this.setData({
          showName: this.data.setShowName,
        });
        return conversation.groupProfile.name || conversation.groupProfile.groupID;
      }
    },
    // 设置会话的头像
    setConversationAvatar(conversation) {
      if (conversation.type === '@TIM#SYSTEM') {
        return 'https://web.sdk.qcloud.com/component/TUIKit/assets/system.png';
      }
      if (conversation.type === 'C2C') {
        return conversation.userProfile.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';
      }
      if (conversation.type === 'GROUP') {
        return conversation.groupProfile.avatar || '../../../../static/assets/group-avatar.svg';
      }
    },
    // 删除会话
    deleteConversation() {
      wx.showModal({
        content: '确认删除会话？',
        success: (res) => {
          if (res.confirm) {
            wx.aegis.reportEvent({
              name: 'conversationOptions',
              ext1: 'conversation-delete',
              ext2: wx.$chat_reportType,
              ext3: wx.$chat_SDKAppID,
            });
            wx.$TUIKit.deleteConversation(this.data.conversation.conversationID);
            this.setData({
              conversation: {},
              xScale: 0,
            });
          }
        },
      });
    },
    // 消息置顶
    pinConversation() {
      wx.aegis.reportEvent({
        name: 'conversationOptions',
        ext1: 'conversation-top',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      wx.$TUIKit.pinConversation({ conversationID: this.data.conversation.conversationID, isPinned: true })
        .then(() => {
          this.setData({
            xScale: 0,
          });
        })
        .catch((imError) => {
          console.warn('pinConversation error:', imError); // 置顶会话失败的相关信息
        });
      if (this.data.showPin === '取消置顶') {
        wx.$TUIKit.pinConversation({ conversationID: this.data.conversation.conversationID, isPinned: false })
          .then(() => {
            this.setData({
              xScale: 0,
            });
          })
          .catch((imError) => {
            console.warn('pinConversation error:', imError); // 置顶会话失败的相关信息
          });
      }
    },
    // 是否显示免打扰图标
    showMuteIconImg(conversation) {
      if (conversation.messageRemindType === 'AcceptNotNotify') {
        this.setData({
          showMuteIcon: true,
        });
      } else {
        this.setData({
          showMuteIcon: false,
        });
      }
    },
    // 消息免打扰
    muteNotifications() {
      wx.aegis.reportEvent({
        name: 'conversationOptions',
        ext1: 'conversation-mutenotifications',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      let newShowMute = '';
      let newShowMuteIcon = false;
      let messageRemindType = wx.$TUIKitTIM.TYPES.MSG_REMIND_ACPT_NOT_NOTE;
      if (this.data.showMute === '消息免打扰') {
        newShowMute = '取消免打扰';
        newShowMuteIcon = true;
        messageRemindType = wx.$TUIKitTIM.TYPES.MSG_REMIND_ACPT_NOT_NOTE;
      }
      if (this.data.showMute === '取消免打扰') {
        newShowMute = '消息免打扰';
        newShowMuteIcon = false;
        messageRemindType = wx.$TUIKitTIM.TYPES.MSG_REMIND_ACPT_AND_NOTE;
      }

      if (this.data.conversation.type === 'C2C') {
        // C2C 消息免打扰，一般的实现是在线接收消息，离线不接收消息（在有离线推送的情况下），v2.16.0起支持
        const { userID } = this.data.conversation.userProfile;
        wx.$TUIKit.setMessageRemindType({
          userIDList: [userID],
          messageRemindType,
        })
          .then((imResponse) => {
            this.setData({
              xScale: 0,
              showMuteIcon: newShowMuteIcon,
              showMute: newShowMute,
            });
          })
          .catch((imError) => {
            console.warn('setMessageRemindType error:', imError);
          });
      }

      if (this.data.conversation.type === 'GROUP')  {
        const { groupID } = this.data.conversation.groupProfile;
        // 群消息免打扰，一般的实现是在线接收消息，离线不接收消息（在有离线推送的情况下）
        wx.$TUIKit.setMessageRemindType({
          groupID,
          messageRemindType,
        })
          .then((imResponse) => {
            this.setData({
              xScale: 0,
              showMuteIcon: newShowMuteIcon,
              showMute: newShowMute,
            });
            // 设置消息免打扰成功
          })
          .catch((imError) => {
            // 设置消息免打扰失败
            console.warn('setMessageRemindType error:', imError);
          });
      }
    },
    // 控制左滑动画
    handleTouchMove(e) {
      this.setData({
        num: e.detail.x,
      });
      if (e.detail.x < 0 && !this.data.isTrigger) {
        this.setData({
          isTrigger: true,
        });
        this.triggerEvent('transCheckID', {
          checkID: this.data.conversation.conversationID,
        });
      }
      if (e.detail.x === 0) {
        this.setData({
          isTrigger: false,
        });
      }
    },
    handleTouchEnd() {
      if (this.data.num < -wx.getSystemInfoSync().windowWidth / 5) {
        this.setData({
          xScale: -wx.getSystemInfoSync().windowWidth,
        });
      }
      if (this.data.num >= -wx.getSystemInfoSync().windowWidth / 5 && this.data.num < 0) {
        this.setData({
          xScale: 0,
        });
      }
    },
    // 更新会话的时间戳，显示会话里的最后一条消息
    $updateTimeAgo(conversation) {
      if (conversation.conversationID && conversation.lastMessage.lastTime) {
        conversation.lastMessage.timeago = caculateTimeago(conversation.lastMessage.lastTime * 1000);
        if (conversation.lastMessage.isRevoked) {
          this.setData({
            showMessage: '撤回了一条消息',
          });
        } else {
          this.setData({
            showMessage: conversation.lastMessage.messageForShow,
          });
        }
        this.setData({
          conversation,
        });
      }
    },
    // 会话头像显示失败显示的默认头像
    handleimageerro() {
      this.setData({
        setConversationAvatar: '../../../../static/assets/group-avatar.svg',
      });
    },
    // 判断该用户的状态并展示出来
    setUserStatus(conversation, statusList) {
      // if (!wx.getStorageSync('showOnlineStatus')) return;
      const currentUserID = wx.getStorageSync('currentUserID');
      if (currentUserID.includes(wx.$chat_userID)) {
        this.setData({
          getStatus: wx.getStorageSync(wx.$chat_userID),
        });
      } else {
        this.setData({
          getStatus: true,
        });
      }
      if (conversation.type !== wx.$TUIKitTIM.TYPES.CONV_C2C) return;
      statusList.forEach((item) => {
        if (item.userID !== conversation.userProfile.userID) return;
        const showStatus = (item.statusType === 1);
        this.setData({
          showStatus,
        });
      });
    },
  },
});
