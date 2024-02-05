import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
export default class TUIChatServer {
  static instance;
  currentConversation = {};
  TUIChat = undefined;

  constructor() {
    // register service
    TUICore.registerService(TUIConstants.TUIChat.SERVICE.NAME, this);
  }

  static getInstance(TUIChat) {
    if (!TUIChatServer.instance) {
      TUIChatServer.instance = new TUIChatServer();
    }
    TUIChatServer.instance.updateChat(TUIChat);
    return TUIChatServer.instance;
  }

  updateChat(chat) {
    this.TUIChat = chat;
  }

  updateConversation(conversation) {
    this.currentConversation = conversation;
  }

  onCall(method, params = {}, callback) {
    let customMessage;
    let textMessage;
    const currentMessage = {
      to: this.currentConversation.conversationID.replace(this.currentConversation.type, ''),
      conversationType: this.currentConversation.type,
      payload: params?.payload,
    };
    switch (method) {
      case TUIConstants.TUIChat.SERVICE.METHOD.UPDATE_MESSAGE_LIST:
        if (params?.message?.conversationID === this.currentConversation.conversationID) {
          this.TUIChat.updateMessageList({
            detail: {
              message: params.message,
            },
          });
        }
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SEND_CUSTOM_MESSAGE:
        customMessage = wx.$TUIKit.createCustomMessage(currentMessage);
        this.TUIChat.updateMessageList({
          detail: {
            message: customMessage,
          },
        });
        wx.$TUIKit.sendMessage(customMessage).then((res) => {
          callback && callback(res);
        });
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SEND_TEXT_MESSAGE:
        textMessage = wx.$TUIKit.createTextMessage(currentMessage);
        this.TUIChat.updateMessageList({
          detail: {
            message: textMessage,
          },
        });
        wx.$TUIKit.sendMessage(textMessage).then((res) => {
          callback && callback(res);
        });
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SET_CHAT_TYPE:
        this.TUIChat.setChatType(params?.chatType);
        break;
      default:
        break;
    }
  }
}
