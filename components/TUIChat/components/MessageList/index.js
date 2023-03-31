import dayjs from '../../../../utils/dayjs';
import logger from '../../../../utils/logger';
import constant from '../../../../utils/constant';
// eslint-disable-next-line no-undef
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    conversation: {
      type: Object,
      value: {},
      observer(newVal) {
        if (!newVal.conversationID) return;
        this.setData({
          conversation: newVal,
        }, () => {
          this.getMessageList(this.data.conversation);
        });
      },
    },
    unreadCount: {
      type: Number,
      value: '',
      observer(newVal) {
        this.setData({
          unreadCount: newVal,
        });
      },
    },
    chatContainerHeight:{
      type: Number,
      value: '',
      observer(newVal) {
        this.setData({
          chatContainerHeight: newVal,
        });
      },
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatar: '',
    userID: '',
    isLostsOfUnread: false,
    unreadCount: '',
    conversation: {}, // 当前会话
    messageList: [],
    // 自己的 ID 用于区分历史消息中，哪部分是自己发出的
    scrollView: '',
    triggered: true,
    nextReqMessageID: '', // 下一条消息标志
    isCompleted: false, // 当前会话消息是否已经请求完毕
    messagepopToggle: false,
    messageID: '',
    checkID: '',
    selectedMessage: {},
    deleteMessage: '',
    RevokeID: '', // 撤回消息的ID用于处理对方消息展示界面
    showName: '',
    showUnreadMessageCount: false,
    showUpJump: false,
    jumpAim: '',
    messageIndex: '',
    isShow: false,
    Show: false,
    UseData: '',
    chargeLastmessage: '',
    groupOperationType: 0,
    newMessageCount: [],
    messageTime: '',
    messageHistoryTime: '',
    messageTimeID: {},
    showMessageTime: false,
    showMessageHistoryTime: false,
    showMessageError: false,
    personalProfile: {},
    showPersonalProfile: false,
    resendMessage: {},
    showOnlyOnce: false,
    lastMessageSequence: '',
    isRewrite: false,
    isMessageTime: {},
    firstTime: Number,
    newArr: {},
    errorMessage: {},
    errorMessageID: '',
    typingMessage: {},
    // 是否在最底部
    isScrollToBottom:false,
    chatContainerHeight:0,
    // 修改的群资料
    newGroupProfile: {}
  },

  lifetimes: {
    attached() {
    },
    ready() {
      if (this.data.unreadCount > 12) {
        if (this.data.unreadCount > 99) {
          this.setData({
            isLostsOfUnread: true,
            showUpJump: true,
          });
        } else {
          this.setData({
            showUpJump: true,
          });
        }
      }
      wx.$TUIKit.getMyProfile().then((res) => {
        this.data.avatar = res.data.avatar;
        this.data.userID = res.data.userID;
      });
      wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.MESSAGE_RECEIVED, this.$onMessageReceived, this);
      wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.MESSAGE_READ_BY_PEER, this.$onMessageReadByPeer, this);
      wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.MESSAGE_REVOKED, this.$onMessageRevoked, this);
    },

    detached() {
      // 一定要解除相关的事件绑定
      wx.$TUIKit.off(wx.$TUIKitTIM.EVENT.MESSAGE_RECEIVED, this.$onMessageReceived);
      wx.$TUIKit.off(wx.$TUIKitTIM.EVENT.MESSAGE_READ_BY_PEER, this.$onMessageReadByPeer);
      wx.$TUIKit.off(wx.$TUIKitTIM.EVENT.MESSAGE_REVOKED, this.$onMessageRevoked);
    },
  },

  methods: {
    // 刷新消息列表
    refresh() {
      if (this.data.isCompleted) {
        this.setData({
          isCompleted: true,
          triggered: false,
        });
        return;
      }
      this.getMessageList(this.data.conversation);
      setTimeout(() => {
        this.setData({
          triggered: false,
        });
      }, 2000);
    },
    // 获取消息列表
    getMessageList(conversation) {
      if (!this.data.isCompleted) {
        wx.$TUIKit.getMessageList({
          conversationID: conversation.conversationID,
          nextReqMessageID: this.data.nextReqMessageID,
          count: 15,
        }).then((res) => {
          this.showMoreHistoryMessageTime(res.data.messageList);
          const { messageList } = res.data; // 消息列表。
          this.data.nextReqMessageID = res.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
          this.data.isCompleted = res.data.isCompleted; // 表示是否已经拉完所有消息。
          this.data.messageList = [...messageList, ...this.data.messageList];
          if (messageList.length > 0 && this.data.messageList.length < this.data.unreadCount) {
            this.getMessageList(conversation);
          }
          this.$handleMessageRender(this.data.messageList, messageList);
        });
      }
    },
    // 历史消息渲染
    $handleMessageRender(messageList, currentMessageList) {
      this.showHistoryMessageTime(currentMessageList);
      if (messageList.length > 0) {
        if (this.data.conversation.type === '@TIM#SYSTEM') {
          this.filterRepateSystemMessage(messageList);
        } else {
          this.setData({
            messageList,
            // 消息ID前拼接字符串为了解决scroll-into-view，无法跳转以数字开头的ID。
            jumpAim: `ID-${this.filterSystemMessageID(currentMessageList[currentMessageList.length - 1].ID)}`,
          }, () => {
          });
        }
      }
    },
    // 系统消息去重
    filterRepateSystemMessage(messageList) {
      const noRepateMessage = [];
      for (let index = 0;  index < messageList.length; index++) {
        if (!noRepateMessage.some(item => item && item.ID === messageList[index].ID)) {
          noRepateMessage.push(messageList[index]);
        }
      }
      this.setData({
        messageList: noRepateMessage,
      });
    },
    // 消息已读更新
    $onMessageReadByPeer(event) {
      this.updateReadByPeer(event);
    },
    // 更新已读更新
    updateReadByPeer(event) {
      event.data.forEach((item) => {
        const index = this.data.messageList.findIndex(element => element.ID === item.ID);
        this.data.messageList[index] = item;
        this.setData({
          messageList: this.data.messageList,
        });
      });
    },

    // 收到的消息
    $onMessageReceived(value) {
      const message = value.data[0];
      wx.$TUIKit.setMessageRead({ conversationID: this.data.conversation.conversationID }).then(() => {
        logger.log('| MessageList | setMessageRead | ok');
      });
      const { BUSINESS_ID_TEXT, MESSAGE_TYPE_TEXT } = constant;
      this.messageTimeForShow(message);
      this.setData({
        UseData: value,
      });
      value.data.forEach((item) => {
        switch(item.type) {
          // 群提示消息
          case 'TIMGroupTipElem':
            this.handleGroupTipMessage(item);
            break;
          // 群系统消息
          case 'TIMGroupSystemNoticeElem':
            this.handleGroupSystemNoticeMessage(item);
            break;
          default:
            break;
        }
        // 判断收到的消息是否是正在输入状态消息。由于正在输入状态消息是自定义消息，需要对自定义消息进行一个过滤，是自定义消息但不是正在输入状态消息，则新消息未读数加1，不是自定义消息则新消息未读数直接加1
        if (this.data.messageList.length > 12 && !message.isRead) {
          try {
            const typingMessage = JSON.parse(item.payload.data);
            this.setData({
              typingMessage,
            });
          } catch (error) {
          }
          if ((item.type === MESSAGE_TYPE_TEXT.TIM_CUSTOM_ELEM && this.data.typingMessage.businessID !== BUSINESS_ID_TEXT.USER_TYPING) || item.type !== MESSAGE_TYPE_TEXT.TIM_CUSTOM_ELEM) {
            this.data.newMessageCount.push(message);
            this.setData({
              newMessageCount: this.data.newMessageCount,
            });
            // 当滚轮在最底部的时候
            if(this.data.isScrollToBottom) {
              // 跳转到最新的消息
              setTimeout(() => {
                this.handleJumpNewMessage();
              },300)
            } else {
              // 不在最底部的时候弹出未读消息
              this.setData({
                showUnreadMessageCount: true,
              });
            }
          }
        } else {
          this.setData({
            showUnreadMessageCount: false,
          });
        }
      });
      // 若需修改消息，需将内存的消息复制一份，不能直接更改消息，防止修复内存消息，导致其他消息监听处发生消息错误
      // 将收到的消息存入messageList之前需要进行过滤，正在输入状态消息不用存入messageList.
      const list = [];
      value.data.forEach((item) => {
        if (item.conversationID === this.data.conversation.conversationID && item.type === MESSAGE_TYPE_TEXT.TIM_CUSTOM_ELEM) {
          try {
            const typingMessage = JSON.parse(item.payload.data);
            if (typingMessage.businessID !== BUSINESS_ID_TEXT.USER_TYPING) {
              list.push(item);
            } else {
              this.triggerEvent('typing', {
                typingMessage,
              });
            }
          } catch (error) {
          }
        } else if (item.conversationID === this.data.conversation.conversationID) {
          list.push(item);
        }
      });
      this.data.messageList = this.data.messageList.concat(list);
      this.setData({
        messageList: this.data.messageList,
      });
      if (this.data.conversation.type === 'GROUP') {
        const groupOperationType = this.data.messageList.slice(-1)[0].payload?.operationType || 0; 
        this.triggerEvent('changeMemberCount', {
          groupOperationType
        });
      }
    },
    // 自己的消息上屏
    updateMessageList(message) {
      if (message.conversationID !== this.data.conversation.conversationID) return;
      wx.$TUIKit.setMessageRead({ conversationID: this.data.conversation.conversationID }).then(() => {
        logger.log('| MessageList | setMessageRead | ok');
      });
      const { BUSINESS_ID_TEXT, MESSAGE_TYPE_TEXT } = constant;
      // this.$onMessageReadByPeer();
      this.messageTimeForShow(message);
      if (message.type === MESSAGE_TYPE_TEXT.TIM_CUSTOM_ELEM) {
        const typingMessage = JSON.parse(message.payload.data);
        if (typingMessage.businessID === BUSINESS_ID_TEXT.USER_TYPING) {
          this.setData({
            messageList: this.data.messageList,
          });
        } else {
          this.data.messageList.push(message);
        }
      } else {
        this.data.messageList.push(message);
      }
      this.setData({
        lastMessageSequence: this.data.messageList.slice(-1)[0].sequence,
        messageList: this.data.messageList,
        jumpAim: `ID-${this.filterSystemMessageID(this.data.messageList[this.data.messageList.length - 1].ID)}`,
      }, () => {
        this.setData({
          messageList: this.data.messageList,
        });
      });
    },

    handleGroupTipMessage(msg) {
      // 群资料改变
      if(msg.payload.operationType === 6) {
        const newGroupProfile = msg.payload.newGroupProfile;
        this.setData({
          newGroupProfile: newGroupProfile
        });
        this.triggerEvent('handleNewGroupProfile',this.data.newGroupProfile);
      }
    },

    handleGroupSystemNoticeMessage(msg) {
      // 被群主踢出群组
      if(msg.payload.operationType === 4) {
        // 跳转到聊天列表页面
        wx.navigateTo({
          url: '../../../../../../TUI-CustomerService/pages/index',
        });
        this.showToast(`您已被${msg.payload.operatorID}踢出群组！`);
      }
    },

    // 兼容 scrollView
    filterSystemMessageID(messageID) {
      const index = messageID.indexOf('@TIM#');
      const groupIndex = messageID.indexOf('@TGS#');
      if (index === 0) {
        messageID =  messageID.replace('@TIM#', '');
      }
      if (groupIndex === 0) {
        messageID =  messageID.replace('@TGS#', '');
      }
      return messageID;
    },
    // 获取消息ID
    handleLongPress(e) {
      for (let index = 0; index < this.data.messageList.length; index++) {
        if (this.data.messageList[index].status === 'success') {
          const { index } = e.currentTarget.dataset;
          this.setData({
            messageID: e.currentTarget.id,
            selectedMessage: this.data.messageList[index],
            Show: true,
          });
        }
      }
    },
    // 更新 messagelist
    updateMessageByID(deleteMessageID) {
      const { messageList } = this.data;
      const deleteMessageArr = messageList.filter(item => item.ID === deleteMessageID);
      this.setData({
        messageList,
      });
      return deleteMessageArr;
    },
    // 删除消息
    deleteMessage() {
      wx.aegis.reportEvent({
        name: 'messageOptions',
        ext1: 'messageOptions-delete',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      wx.$TUIKit.deleteMessage([this.data.selectedMessage])
        .then((imResponse) => {
          this.updateMessageByID(imResponse.data.messageList[0].ID);
          wx.showToast({
            title: '删除成功!',
            duration: 800,
            icon: 'none',
          });
        })
        .catch(() => {
          wx.showToast({
            title: '删除失败!',
            duration: 800,
            icon: 'error',
          });
        });
    },
    // 撤回消息
    revokeMessage() {
      wx.aegis.reportEvent({
        name: 'messageOptions',
        ext1: 'messageOptions-revoke',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      wx.$TUIKit.revokeMessage(this.data.selectedMessage)
        .then((imResponse) => {
          this.setData({
            resendMessage: imResponse.data.message,
          });
          this.updateMessageByID(imResponse.data.message.ID);
          // 消息撤回成功
        })
        .catch((imError) => {
          wx.showToast({
            title: '超过2分钟消息不支持撤回',
            duration: 800,
            icon: 'none',
          }),
          this.setData({
            Show: false,
          });
          // 消息撤回失败
          console.warn('revokeMessage error:', imError);
        });
    },
    // 撤回消息重新发送
    resendMessage(e) {
      this.triggerEvent('resendMessage', {
        message: e.detail.message,
      });
    },
    // 关闭弹窗
    handleEditToggleAvatar() {
      this.setData({
        Show: false,
      });
    },
    // 向对方通知消息撤回事件
    $onMessageRevoked(event) {
      this.updateMessageByID(event.data[0].ID);
    },
    // 复制消息
    copyMessage() {
      wx.aegis.reportEvent({
        name: 'messageOptions',
        ext1: 'messageOptions-copy',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      wx.setClipboardData({
        data: this.data.selectedMessage.payload.text,
        success() {
          wx.getClipboardData({
            success(res) {
              logger.log(`| TUI-chat | message-list | copyMessage: ${res.data} `);
            },
          });
        },
      });
      this.setData({
        Show: false,
      });
    },
    // 消息跳转到最新
    handleJumpNewMessage() {
      this.setData({
        jumpAim: `ID-${this.filterSystemMessageID(this.data.messageList[this.data.messageList.length - 1].ID)}`,
        showUnreadMessageCount: false,
        newMessageCount: [],
      });
    },
    // 消息跳转到最近未读
    handleJumpUnreadMessage() {
      if (this.data.unreadCount > 15) {
        this.getMessageList(this.data.conversation);
        this.setData({
          jumpAim: `ID-${this.filterSystemMessageID(this.data.messageList[this.data.messageList.length - this.data.unreadCount].ID)}`,
          showUpJump: false,
        });
      } else {
        this.getMessageList(this.data.conversation);
        this.setData({
          jumpAim: `ID-${this.filterSystemMessageID(this.data.messageList[this.data.messageList.length - this.data.unreadCount].ID)}`,
          showUpJump: false,
        });
      }
    },
    // 滑动到最底部置跳转事件为false
    scrollHandler() {
      this.setData({
        jumpAim: `ID-${this.filterSystemMessageID(this.data.messageList[this.data.messageList.length - 1].ID)}`,
        showUnreadMessageCount: false,
      });
    },
    // 删除处理掉的群通知消息
    changeSystemMessageList(event) {
      this.updateMessageByID(event.detail.message.ID);
    },
    // 展示消息时间
    messageTimeForShow(messageTime) {
      const interval = 5 * 60 * 1000;
      const nowTime = Math.floor(messageTime.time / 10) * 10 * 1000;
      if (this.data.messageList.length > 0) {
        const lastTime = this.data.messageList.slice(-1)[0].time * 1000;
        if (nowTime  - lastTime > interval) {
          Object.assign(messageTime, {
            isShowTime: true,
          }),
          this.data.messageTime = dayjs(nowTime);
          this.setData({
            messageTime: dayjs(nowTime).format('YYYY-MM-DD HH:mm:ss'),
            showMessageTime: true,
          });
        }
      }
    },
    // 渲染历史消息时间
    showHistoryMessageTime(messageList) {
      const cut = 30 * 60 * 1000;
      for (let index = 0; index < messageList.length; index++) {
        const nowadayTime = Math.floor(messageList[index].time / 10) * 10 * 1000;
        const firstTime = messageList[0].time * 1000;
        if (nowadayTime - firstTime > cut) {
          const indexbutton = messageList.map(item => item).indexOf(messageList[index]); // 获取第一个时间大于30分钟的消息所在位置的下标
          const firstTime = nowadayTime; // 找到第一个数组时间戳大于30分钟的将其值设为初始值
          const showHistoryTime = Math.floor(messageList[indexbutton].time / 10) * 10 * 1000;
          Object.assign(messageList[indexbutton], {
            isShowHistoryTime: true,
          }),
          this.setData({
            firstTime: nowadayTime,
            messageHistoryTime: dayjs(showHistoryTime).format('YYYY-MM-DD HH:mm:ss'),
            showMessageHistoryTime: true,
          });
          return firstTime;
        }
      }
    },
    // 拉取更多历史消息渲染时间
    showMoreHistoryMessageTime(messageList) {
      if (messageList.length > 0) {
        const showHistoryTime = messageList[0].time * 1000;
        Object.assign(messageList[0], {
          isShowMoreHistoryTime: true,
        });
        this.data.newArr[messageList[0].ID] = dayjs(showHistoryTime).format('YYYY-MM-DD HH:mm:ss');
        this.setData({
          newArr: this.data.newArr,
        });
      }
    },
    // 消息发送失败
    sendMessageError(event) {
      this.setData({
        errorMessage: event.detail.message,
        errorMessageID: event.detail.message.ID,
      });
      const errorCode = event.detail.showErrorImageFlag;
      this.handleErrorCode(errorCode);
    },
    // 消息发送失败后重新发送
    ResendMessage() {
      wx.showModal({
        content: '确认重发该消息？',
        success: (res) => {
          if (!res.confirm) {
            return;
          }
          wx.$TUIKit.resendMessage(this.data.errorMessage) // 传入需要重发的消息实例
            .then(() => {
              this.showToast(TOAST_TITLE_TEXT.RESEND_SUCCESS);
              this.setData({
                showMessageError: false,
              });
            })
            .catch((imError) => {
              this.handleErrorCode(imError.code);
            });
        },
      });
    },
    // 处理错误码信息
    handleErrorCode(errorCode) {
      const { MESSAGE_ERROR_CODE, TOAST_TITLE_TEXT } = constant;
      switch (errorCode) {
        case MESSAGE_ERROR_CODE.DIRTY_WORDS:
          this.showToast(TOAST_TITLE_TEXT.DIRTY_WORDS);
          break;
        case MESSAGE_ERROR_CODE.UPLOAD_FAIL:
          this.showToast(TOAST_TITLE_TEXT.UPLOAD_FAIL);
          break;
        case MESSAGE_ERROR_CODE.REQUESTOR_TIME || MESSAGE_ERROR_CODE.DISCONNECT_NETWORK:
          this.showToast(TOAST_TITLE_TEXT.CONNECT_ERROR);
          break;
        case MESSAGE_ERROR_CODE.DIRTY_MEDIA:
          this.showToast(TOAST_TITLE_TEXT.DIRTY_MEDIA);
          break;
        case MESSAGE_ERROR_CODE.UNUPLOADED_PICTURE:
          this.showToast(TOAST_TITLE_TEXT.UNUPLOADED_PICTURE);
          break;
        case MESSAGE_ERROR_CODE.UNUPLOADED_MEDIA:
          this.showToast(TOAST_TITLE_TEXT.UNUPLOADED_MEDIA);
          break;
        case MESSAGE_ERROR_CODE.BLACKLIST_MEMBER:
          this.showToast(TOAST_TITLE_TEXT.BLACKLIST_MEMBER);
          break;
        case MESSAGE_ERROR_CODE.NOT_GROUP_MEMBER:
          this.showToast(TOAST_TITLE_TEXT.NOT_GROUP_MEMBER);
          break;
        default:
          break;
      }
    },
    showToast(toastTitle) {
      if (this.data.showMessageError) {
        wx.showToast({
          title: toastTitle,
          duration: 800,
          icon: 'none',
        });
      } else {
        this.setData({
          showMessageError: true,
        });
        wx.showToast({
          title: toastTitle,
          duration: 800,
          icon: 'none',
        });
      }
    },
    // 点击购买链接跳转
    handleJumpLink(e) {
      if (app?.globalData?.reportType !== constant.OPERATING_ENVIRONMENT) return;
      const { BUSINESS_ID_TEXT }  = constant;
      const dataLink = JSON.parse(e.currentTarget.dataset.value.payload.data);
      if (dataLink.businessID === BUSINESS_ID_TEXT.ORDER || dataLink.businessID === BUSINESS_ID_TEXT.LINK) {
        const url = `/pages/TUI-User-Center/webview/webview?url=${dataLink.link}&wechatMobile`;
        wx.navigateTo({
          url: encodeURI(url),
        });
      }
    },
    onScroll(event) {
      let isScrollToBottom = false;
      // 滚动条在底部
      if(event.detail.scrollHeight - (event.detail.scrollTop + this.data.chatContainerHeight) <= 0) {
        isScrollToBottom = true;
      }
      this.setData({
        isScrollToBottom
      })
    }
  },

});
