import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

export default function useChatEngine() {
  const isReady = TUIChatEngine.isReady();
  if(isReady) {
    return
  }
  TUIChatEngine.login({
    chat: wx.$TUIKit,
    sdkAppID: wx.$chat_SDKAppID,
    userID: wx.$chat_userID,
    userSig: wx.$chat_userSig,
  })
}