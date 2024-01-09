import TUICore, { TUIConstants } from '@tencentcloud/tui-core';

export default class TUIChatServer {
  static instance;
  currentConversationID = '';

  constructor(TUIChat) {
    // register service
    TUICore.registerService(TUIConstants.TUIChat.SERVICE.NAME, this);
    this.TUIChat = TUIChat;
  }

  static getInstance(TUIChat) {
    if (!TUIChatServer.instance) {
      TUIChatServer.instance = new TUIChatServer(TUIChat);
    }
    return TUIChatServer.instance;
  }

  updateConversationID(conversationID) {
    this.currentConversationID = conversationID;
  }

  onCall(method, params = {}, callback) {
    if (method === TUIConstants.TUIChat.SERVICE.METHOD.UPDATE_MESSAGE_LIST) {
      const { message } = params;
      // 两种上屏情况
      // 1. 如果 call 消息 conversationID 为 currentConversation,
      //    需要借助 UPDATE_MESSAGE_LIST 更新 engine 中 TUIStore 的 messageList 进行上屏
      //    （因为此时无法获得自己发送的消息）
      // 2. 如果 call 消息 conversationID 不是 currentConversation,
      //    下次切换到 call 消息所在会话时， getMessageList 可以获得 所有自己发送的 call 消息
      //    无需此处处理
      if (message?.conversationID === this.currentConversationID) {
        this.TUIChat.sendMessage({
          detail: {
            message,
          },
        });
      }
    }
  }
}
