import logger from '../../../../utils/logger';
import constant from '../../../../utils/constant';
// eslint-disable-next-line no-undef
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    conversation: {
      type: Object,
      value: {},
      observer(newVal) {
        this.setData({
          conversation: newVal,
        });
      },
    },
    hasCallKit: {
      type: Boolean,
      value: false,
      observer(hasCallKit) {
        this.setData({
          hasCallKit,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    conversation: {},
    message: '',
    extensionArea: false,
    sendMessageBtn: false,
    displayFlag: '',
    isAudio: false,
    bottomVal: 0,
    startPoint: 0,
    popupToggle: false,
    isRecording: false,
    canSend: true,
    text: '按住说话',
    title: ' ',
    notShow: false,
    isShow: true,
    commonFunction: [
      { name: '常用语', key: '0' },
      { name: '发送订单', key: '1' },
      { name: '服务评价', key: '2' },
    ],
    displayServiceEvaluation: false,
    showErrorImageFlag: 0,
    messageList: [],
    isFirstSendTyping: true,
    time: 0,
    focus: false,
    isEmoji: false,
    fileList: [],
    hasCallKit: false,
  },

  lifetimes: {
    attached() {
      // 加载声音录制管理器
      this.recorderManager = wx.getRecorderManager();
      this.recorderManager.onStop((res) => {
        wx.hideLoading();
        if (this.data.canSend) {
          if (res.duration < 1000) {
            wx.showToast({
              title: '录音时间太短',
              icon: 'none',
            });
          } else {
            // res.tempFilePath 存储录音文件的临时路径
            const message = wx.$TUIKit.createAudioMessage({
              to: this.getToAccount(),
              conversationType: this.data.conversation.type,
              payload: {
                file: res,
              },
            });
            this.$sendTIMMessage(message);
          }
        }
        this.setData({
          startPoint: 0,
          popupToggle: false,
          isRecording: false,
          canSend: true,
          title: ' ',
          text: '按住说话',
        });
      });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取消息列表来判断是否发送正在输入状态
    getMessageList(conversation) {
      wx.$TUIKit.getMessageList({
        conversationID: conversation.conversationID,
        nextReqMessageID: this.data.nextReqMessageID,
        count: 15,
      }).then((res) => {
        const { messageList } = res.data;
        this.setData({
          messageList,
        });
      });
    },

    // 打开录音开关
    switchAudio() {
      this.setData({
        isAudio: !this.data.isAudio,
        isEmoji: false,
        text: '按住说话',
        focus: false,
      });
    },

    // 长按录音
    handleLongPress(e) {
      wx.aegis.reportEvent({
        name: 'messageType',
        ext1: 'messageType-audio',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      this.recorderManager.start({
        duration: 60000, // 录音的时长，单位 ms，最大值 600000（10 分钟）
        sampleRate: 44100, // 采样率
        numberOfChannels: 1, // 录音通道数
        encodeBitRate: 192000, // 编码码率
        format: 'aac', // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
      });
      this.setData({
        startPoint: e.touches[0],
        title: '正在录音',
        // isRecording : true,
        // canSend: true,
        notShow: true,
        isShow: false,
        isRecording: true,
        popupToggle: true,
      });
    },

    // 录音时的手势上划移动距离对应文案变化
    handleTouchMove(e) {
      if (this.data.isRecording) {
        if (this.data.startPoint.clientY - e.touches[e.touches.length - 1].clientY > 100) {
          this.setData({
            text: '抬起停止',
            title: '松开手指，取消发送',
            canSend: false,
          });
        } else if (this.data.startPoint.clientY - e.touches[e.touches.length - 1].clientY > 20) {
          this.setData({
            text: '抬起停止',
            title: '上划可取消',
            canSend: true,
          });
        } else {
          this.setData({
            text: '抬起停止',
            title: '正在录音',
            canSend: true,
          });
        }
      }
    },

    // 手指离开页面滑动
    handleTouchEnd() {
      this.setData({
        isRecording: false,
        popupToggle: false,

      });
      wx.hideLoading();
      this.recorderManager.stop();
    },
    // 选中表情消息
    handleEmoji() {
      let targetFlag = 'emoji';
      if (this.data.displayFlag === 'emoji') {
        targetFlag = '';
      }
      this.setData({
        isAudio: false,
        isEmoji: true,
        displayFlag: targetFlag,
        focus: false,
      });
    },

    // 选自定义消息
    handleExtensions() {
      wx.aegis.reportEvent({
        name: 'chooseExtensions',
        ext1: 'chooseExtensions',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      let targetFlag = 'extension';
      if (this.data.displayFlag === 'extension') {
        targetFlag = '';
      }
      this.setData({
        displayFlag: targetFlag,
      });
    },

    error(e) {
      console.log(e.detail);
    },

    handleSendPicture() {
      this.sendMediaMessage('camera', 'image');
    },

    handleSendImage() {
      wx.aegis.reportEvent({
        name: 'messageType',
        ext1: 'messageType-image',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      this.sendMediaMessage('album', 'image');
    },

    sendMediaMessage(type, mediaType) {
      const { fileList } = this.data;
      wx.chooseMedia({
        count: 9,
        sourceType: [type],
        mediaType: [mediaType],
        success: (res) => {
          const mediaInfoList = res.tempFiles;
          mediaInfoList.forEach((mediaInfo) => {
            fileList.push({ type: res.type, tempFiles: [{ tempFilePath: mediaInfo.tempFilePath }] });
          });
          fileList.forEach((file) => {
            if (file.type === 'image') {
              this.handleSendImageMessage(file);
            }
            if (file.type === 'video') {
              this.handleSendVideoMessage(file);
            }
          });
          this.data.fileList = [];
        },
      });
    },

    // 发送图片消息
    handleSendImageMessage(file) {
      const message = wx.$TUIKit.createImageMessage({
        to: this.getToAccount(),
        conversationType: this.data.conversation.type,
        payload: {
          file,
        },
        onProgress: (percent) => {
          message.percent = percent;
        },
      });
      this.$sendTIMMessage(message);
    },

    // 发送视频消息
    handleSendVideoMessage(file) {
      const message = wx.$TUIKit.createVideoMessage({
        to: this.getToAccount(),
        conversationType: this.data.conversation.type,
        payload: {
          file,
        },
        onProgress: (percent) => {
          message.percent = percent;
        },
      });
      this.$sendTIMMessage(message);
    },

    handleShootVideo() {
      this.sendMediaMessage('camera', 'video');
    },

    handleSendVideo() {
      wx.aegis.reportEvent({
        name: 'messageType',
        ext1: 'messageType-video',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      this.sendMediaMessage('album', 'video');
    },

    handleCommonFunctions(e) {
      switch (e.target.dataset.function.key) {
        case '0':
          this.setData({
            displayCommonWords: true,
          });
          break;
        case '1':
          this.setData({
            displayOrderList: true,
          });
          break;
        case '2':
          this.setData({
            displayServiceEvaluation: true,
          });
          break;
        default:
          break;
      }
    },

    handleSendOrder() {
      this.setData({
        displayOrderList: true,
      });
    },

    appendMessage(e) {
      this.setData({
        message: this.data.message + e.detail.message,
        sendMessageBtn: true,
      });
    },

    getToAccount() {
      if (!this.data.conversation || !this.data.conversation.conversationID) {
        return '';
      }
      switch (this.data.conversation.type) {
        case wx.$TUIKitTIM.TYPES.CONV_C2C:
          return this.data.conversation.conversationID.replace(wx.$TUIKitTIM.TYPES.CONV_C2C, '');
        case wx.$TUIKitTIM.TYPES.CONV_GROUP:
          return this.data.conversation.conversationID.replace(wx.$TUIKitTIM.TYPES.CONV_GROUP, '');
        default:
          return this.data.conversation.conversationID;
      }
    },
    async handleCheckAuthorize(e) {
      const type = e.currentTarget.dataset.value;
      wx.getSetting({
        success: async (res) => {
          const isRecord = res.authSetting['scope.record'];
          const isCamera = res.authSetting['scope.camera'];
          if (!isRecord && type === 1) {
            const title = '麦克风权限授权';
            const content = '使用语音通话，需要在设置中对麦克风进行授权允许';
            try {
              await wx.authorize({ scope: 'scope.record' });
              this.handleCalling(e);
            } catch (e) {
              this.handleShowModal(title, content);
            }
            return;
          }
          if ((!isRecord || !isCamera) && type === 2) {
            const title = '麦克风、摄像头权限授权';
            const content = '使用视频通话，需要在设置中对麦克风、摄像头进行授权允许';
            try {
              await wx.authorize({ scope: 'scope.record' });
              await wx.authorize({ scope: 'scope.camera' });
              this.handleCalling(e);
            } catch (e) {
              this.handleShowModal(title, content);
            }
            return;
          }
          this.handleCalling(e);
        },
      });
    },
    handleShowModal(title, content) {
      wx.showModal({
        title,
        content,
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.openSetting();
          }
        },
      });
    },

    handleCalling(e) {
      if (!this.data.hasCallKit) {
        wx.showToast({
          title: '请先集成 TUICallKit 组件',
          icon: 'none',
        });
        return;
      }
      const type = e.currentTarget.dataset.value;
      const conversationType = this.data.conversation.type;
      if (conversationType === wx.$TUIKitTIM.TYPES.CONV_GROUP) {
        if (type === 1) {
          wx.aegis.reportEvent({
            name: 'audioCall',
            ext1: 'audioCall-group',
            ext2: wx.$chat_reportType,
            ext3: wx.$chat_SDKAppID,
          });
        } else if (type === 2) {
          wx.aegis.reportEvent({
            name: 'videoCall',
            ext1: 'videoCall-group',
            ext2: wx.$chat_reportType,
            ext3: wx.$chat_SDKAppID,
          });
        }
        this.triggerEvent('handleCall', {
          type,
          conversationType,
        });
      }
      if (conversationType === wx.$TUIKitTIM.TYPES.CONV_C2C) {
        const { userID } = this.data.conversation.userProfile;
        if (type === 1) {
          wx.aegis.reportEvent({
            name: 'audioCall',
            ext1: 'audioCall-1v1',
            ext2: wx.$chat_reportType,
            ext3: wx.$chat_SDKAppID,
          });
        } else if (type === 2) {
          wx.aegis.reportEvent({
            name: 'videoCall',
            ext1: 'videoCall-1v1',
            ext2: wx.$chat_reportType,
            ext3: wx.$chat_SDKAppID,
          });
        }
        this.triggerEvent('handleCall', {
          conversationType,
          type,
          userID,
        });
      }
      this.setData({
        displayFlag: '',
      });
    },

    sendTextMessage(msg, flag) {
      wx.aegis.reportEvent({
        name: 'messageType',
        ext1: 'messageType-text',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      const to = this.getToAccount();
      const text = flag ? msg : this.data.message;
      const { FEAT_NATIVE_CODE } = constant;
      const message = wx.$TUIKit.createTextMessage({
        to,
        conversationType: this.data.conversation.type,
        payload: {
          text,
        },
        cloudCustomData: JSON.stringify({ messageFeature:
        {
          needTyping: FEAT_NATIVE_CODE.FEAT_TYPING,
          version: FEAT_NATIVE_CODE.NATIVE_VERSION,
        },
        }),
      });
      this.setData({
        message: '',
        sendMessageBtn: false,
      });
      this.$sendTIMMessage(message);
    },

    // 监听输入框value值变化
    onInputValueChange(event) {
      if (event.detail.message || event.detail.value) {
        this.setData({
          message: event.detail.message || event.detail.value,
          sendMessageBtn: true,
        });
      } else {
        this.setData({
          sendMessageBtn: false,
        });
      }
      event.detail.value && this.sendTypingStatusMessage();
    },

    // 发送正在输入状态消息
    sendTypingStatusMessage() {
      const { BUSINESS_ID_TEXT, FEAT_NATIVE_CODE } = constant;
      // 创建正在输入状态消息, "typingStatus":1,正在输入中1,  输入结束0, "version": 1 兼容老版本,userAction:0, // 14表示正在输入,actionParam:"EIMAMSG_InputStatus_Ing" //"EIMAMSG_InputStatus_Ing" 表示正在输入, "EIMAMSG_InputStatus_End" 表示输入结束
      const typingMessage = wx.$TUIKit.createCustomMessage({
        to: this.getToAccount(),
        conversationType: this.data.conversation.type,
        payload: {
          data: JSON.stringify({
            businessID: BUSINESS_ID_TEXT.USER_TYPING,
            typingStatus: FEAT_NATIVE_CODE.ISTYPING_STATUS,
            version: FEAT_NATIVE_CODE.NATIVE_VERSION,
            userAction: FEAT_NATIVE_CODE.ISTYPING_ACTION,
            actionParam: constant.TYPE_INPUT_STATUS_ING,
          }),
          description: '',
          extension: '',
        },
        cloudCustomData: JSON.stringify({
          messageFeature: {
            needTyping: FEAT_NATIVE_CODE.FEAT_TYPING,
            version: FEAT_NATIVE_CODE.NATIVE_VERSION,
          },
        }),
      });
        // 在消息列表中过滤出对方的消息，并且获取最新消息的时间。
      const inList =  this.data.messageList.filter(item => item.flow === 'in');
      if (inList.length === 0) return;
      const sortList = inList.sort((firstItem, secondItem) => secondItem.time - firstItem.time);
      const newMessageTime = sortList[0].time * 1000;
      // 发送正在输入状态消息的触发条件。
      const isSendTypingMessage = this.data.messageList.every((item) => {
        try {
          const sendTypingMessage = JSON.parse(item.cloudCustomData);
          return sendTypingMessage.messageFeature.needTyping;
        } catch (error) {
          return false;
        }
      });
        // 获取当前编辑时间，与收到对方最新的一条消息时间相比，时间小于30s则发送正在输入状态消息/
      const now = new Date().getTime();
      const timeDifference =  (now  - newMessageTime);

      if (isSendTypingMessage && timeDifference > (1000 * 30)) return;
      if (this.data.isFirstSendTyping) {
        this.$sendTypingMessage(typingMessage);
        this.setData({
          isFirstSendTyping: false,
        });
      } else {
        this.data.time = setTimeout(() => {
          this.$sendTypingMessage(typingMessage);
        }, (1000 * 4));
      }
    },
    // 监听是否获取焦点，有焦点则向父级传值，动态改变input组件的高度。
    inputBindFocus(event) {
      this.setData({
        focus: true,
      });
      this.getMessageList(this.data.conversation);
      this.triggerEvent('pullKeysBoards', {
        event,
      });
      // 有焦点则关闭除键盘之外的操作界面，例如表情组件。
      this.handleClose();
    },

    // 监听是否失去焦点
    inputBindBlur(event) {
      const { BUSINESS_ID_TEXT, FEAT_NATIVE_CODE } = constant;
      const typingMessage = wx.$TUIKit.createCustomMessage({
        to: this.getToAccount(),
        conversationType: this.data.conversation.type,
        payload: {
          data: JSON.stringify({
            businessID: BUSINESS_ID_TEXT.USER_TYPING,
            typingStatus: FEAT_NATIVE_CODE.NOTTYPING_STATUS,
            version: FEAT_NATIVE_CODE.NATIVE_VERSION,
            userAction: FEAT_NATIVE_CODE.NOTTYPING_ACTION,
            actionParam: constant.TYPE_INPUT_STATUS_END,
          }),
          cloudCustomData: JSON.stringify({ messageFeature:
              {
                needTyping: FEAT_NATIVE_CODE.FEAT_TYPING,
                version: FEAT_NATIVE_CODE.NATIVE_VERSION,
              },
          }),
          description: '',
          extension: '',
        },
      });
      this.$sendTypingMessage(typingMessage);
      this.setData({
        isFirstSendTyping: true,
      });
      clearTimeout(this.data.time);
      this.triggerEvent('downKeysBoards', {
        event,
      });
    },

    $handleSendTextMessage(event) {
      this.sendTextMessage(event.detail.message, true);
      this.setData({
        displayCommonWords: false,
      });
    },

    $handleSendCustomMessage(e) {
      wx.aegis.reportEvent({
        name: 'messageType',
        ext1: 'messageType-custom',
        ext2: wx.$chat_reportType,
        ext3: wx.$chat_SDKAppID,
      });
      const message = wx.$TUIKit.createCustomMessage({
        to: this.getToAccount(),
        conversationType: this.data.conversation.type,
        payload: e.detail.payload,
      });
      this.$sendTIMMessage(message);
      this.setData({
        displayOrderList: false,
        displayCommonWords: false,
      });
    },

    $handleCloseCards(e) {
      switch (e.detail.key) {
        case '0':
          this.setData({
            displayCommonWords: false,
          });
          break;
        case '1':
          this.setData({
            displayOrderList: false,
          });
          break;
        case '2':
          this.setData({
            displayServiceEvaluation: false,
          });
          break;
        default:
          break;
      }
    },
    // 发送正在输入消息
    $sendTypingMessage(message) {
      wx.$TUIKit.sendMessage(message, {
        onlineUserOnly: true,
      });
    },

    $sendTIMMessage(message) {
      this.triggerEvent('sendMessage', {
        message,
      });
      wx.$TUIKit.sendMessage(message, {
        offlinePushInfo: {
          disablePush: true,
        },
      }).then(() => {
        const firstSendMessage = wx.getStorageSync('isFirstSendMessage');
        if (firstSendMessage) {
          wx.aegis.reportEvent({
            name: 'sendMessage',
            ext1: 'sendMessage-success',
            ext2: 'imTuikitExternal',
            ext3: wx.$chat_SDKAppID,
          });
        }
      })
        .catch((error) => {
          logger.log(`| TUI-chat | message-input | sendMessageError: ${error.code} `);
          wx.aegis.reportEvent({
            name: 'sendMessage',
            ext1: `sendMessage-failed#error: ${error}`,
            ext2: 'imTuikitExternal',
            ext3: wx.$chat_SDKAppID,
          });
          this.triggerEvent('showMessageErrorImage', {
            showErrorImageFlag: error.code,
            message,
          });
        });
      this.setData({
        displayFlag: '',
      });
    },

    handleClose() {
      this.setData({
        displayFlag: '',
      });
    },

    handleServiceEvaluation() {
      this.setData({
        displayServiceEvaluation: true,
      });
    },
  },
});
