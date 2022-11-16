// TUIKit-WChat/Chat/index.js
import logger from '../../utils/logger';
import constant from '../../utils/constant';
// eslint-disable-next-line no-undef
const app = getApp();

const inputStyle = `
  --padding: 25px
`;

let newInputStyle =  `
--padding: 0px
`;

const setNewInputStyle = (number) => {
  const height = number;
  newInputStyle = `--padding: ${height}px`;
};

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentConversationID: {
      type: String,
      value: '',
      observer(currentConversationID) {
        this.setData({
          conversationID: currentConversationID,
        });
      },
    },
    unreadCount: {
      type: Number,
      value: '',
      observer(unreadCount) {
        this.setData({
          unreadCount,
        });
      },
    },
  },

  lifetimes: {
    attached() {
      if (app?.globalData?.reportType === constant.OPERATING_ENVIRONMENT) {
        this.setData({
          showTips: true,
        });
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    conversationName: '',
    conversation: {},
    messageList: [],
    isShow: false,
    showImage: false,
    showChat: true,
    conversationID: '',
    config: {
      sdkAppID: '',
      userID: '',
      userSig: '',
      type: 1,
      tim: null,
    },
    unreadCount: 0,
    viewData: {
      style: inputStyle,
    },
    KeyboardHeight: 0,
    showTips: false,
    showGroupTips: false,
    showAll: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      wx.$TUIKit.setMessageRead({ conversationID: this.data.conversationID }).then(() => {
        logger.log('| TUI-chat | setMessageRead | ok');
      });
      wx.$TUIKit.getConversationProfile(this.data.conversationID).then((res) => {
        const { conversation } = res.data;
        this.setData({
          conversationName: this.getConversationName(conversation),
          conversation,
          isShow: conversation.type === wx.$TUIKitTIM.TYPES.CONV_GROUP,
        });
        if (conversation.type !== wx.$TUIKitTIM.TYPES.CONV_GROUP) return;
        if (!this.data.showTips) {
          this.setData({
            showGroupTips: true,
          });
        } else {
          this.setData({
            showAll: true,
          });
        }
      });
    },
    getConversationName(conversation) {
      if (conversation.type === '@TIM#SYSTEM') {
        this.setData({
          showChat: false,
        });
        return '系统通知';
      }
      if (conversation.type === wx.$TUIKitTIM.TYPES.CONV_C2C) {
        return conversation.remark || conversation.userProfile.nick || conversation.userProfile.userID;
      }
      if (conversation.type === wx.$TUIKitTIM.TYPES.CONV_GROUP) {
        return conversation.groupProfile.name || conversation.groupProfile.groupID;
      }
    },
    sendMessage(event) {
      // 将自己发送的消息写进消息列表里面
      this.selectComponent('#MessageList').updateMessageList(event.detail.message);
    },
    showMessageErrorImage(event) {
      this.selectComponent('#MessageList').sendMessageError(event);
    },
    triggerClose() {
      this.selectComponent('#MessageInput').handleClose();
    },
    handleCall(event) {
      this.triggerEvent('handleCall', event.detail);
    },

    goBack() {
      this.triggerEvent('showConversationList');
      wx.$TUIKit.setMessageRead({
        conversationID: this.data.conversationID,
      }).then(() => {});
    },
    showConversationList() {
      this.triggerEvent('showConversationList');
    },
    changeMemberCount(event) {
      this.selectComponent('#TUIGroup').updateMemberCount(event.detail.groupOptionsNumber);
    },
    resendMessage(event) {
      this.selectComponent('#MessageInput').onInputValueChange(event);
    },
    // 监听键盘，获取焦点时将输入框推到键盘上方
    pullKeysBoards(event) {
      setNewInputStyle(event.detail.event.detail.height);
      this.setData({
        'viewData.style': newInputStyle,
      });
    },
    // 监听键盘，失去焦点时收起键盘
    downKeysBoards(event) {
      this.setData({
        'viewData.style': inputStyle,
      });
    },
    typing(event) {
      const { STRING_TEXT, FEAT_NATIVE_CODE } = constant;
      if (this.data.conversation.type === wx.$TUIKitTIM.TYPES.CONV_C2C) {
        if (event.detail.typingMessage.typingStatus === FEAT_NATIVE_CODE.ISTYPING_STATUS && event.detail.typingMessage.actionParam === constant.TYPE_INPUT_STATUS_ING) {
          this.setData({
            conversationName: STRING_TEXT.TYPETYPING,
          });
          setTimeout(() => {
            this.setData({
              conversationName: this.getConversationName(this.data.conversation),
            });
          }, (1000 * 30));
        } else if (event.detail.typingMessage.typingStatus === FEAT_NATIVE_CODE.NOTTYPING_STATUS && event.detail.typingMessage.actionParam === constant.TYPE_INPUT_STATUS_END) {
          this.setData({
            conversationName: this.getConversationName(this.data.conversation),
          });
        }
      }
    },
    handleReport() {
      const url = '/pages/TUI-User-Center/webview/webview?url=https://cloud.tencent.com/apply/p/xc3oaubi98g';
      wx.navigateTo({
        url,
      });
    },
  },

});
