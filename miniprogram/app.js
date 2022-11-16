import TIM from './lib/tim-wx-sdk';
import TIMUploadPlugin from './lib/tim-upload-plugin';
import Aegis from './lib/aegis';
import TIMProfanityFilterPlugin from './lib/tim-profanity-filter-plugin';
App({
  onLaunch() {
    this.aegisInit();
    wx.aegis.reportEvent({
      name: 'onLaunch',
      ext1: 'onLaunch-success',
      ext2: this.globalData.reportType,
      ext3: this.globalData.SDKAppID,
    });
    wx.$TUIKit = TIM.create({
      SDKAppID: this.globalData.config.SDKAPPID
    });
    const loginInfo = wx.getStorageSync('token');
    if (loginInfo) {
      wx.$chat_userID = loginInfo.userInfo.userID;
      wx.$chat_userSig = loginInfo.userInfo.userSig;
    }
    wx.$chat_SDKAppID = this.globalData.config.SDKAPPID;
    wx.$TUIKitTIM = TIM;
    wx.$TUIKit.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
    wx.$TUIKit.registerPlugin({ 'tim-profanity-filter-plugin': TIMProfanityFilterPlugin });
    wx.$TUIKit.setLogLevel(0);
    wx.setStorageSync('islogin', false);
    // 监听系统级事件
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.SDK_READY, this.onSDKReady);
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.SDK_NOT_READY, this.onSdkNotReady);
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.KICKED_OUT, this.onKickedOut);
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.ERROR, this.onTIMError);
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.NET_STATE_CHANGE, this.onNetStateChange);
    wx.$TUIKit.on(wx.$TUIKitTIM.EVENT.SDK_READY, this.onSDKReady);
  },


  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },
  aegisInit() {
    wx.aegis = new Aegis({
      id: 'iHWefAYqpBnuWWFSzs', // 项目key
      reportApiSpeed: true, // 接口测速
      reportAssetSpeed: true, // 静态资源测速
      pagePerformance: true, // 开启页面测速
    });
  },
  // TODO:
  resetLoginData() {
    this.globalData.userInfo = null;
    this.globalData.userProfile = null;
    // logger.log(`| app | resetLoginData | globalData: ${this.globalData}`);
  },
  globalData: {
    config: {
      SDKAPPID: 1400187352,
      EXPIRETIME: 604800,
    },
    // userInfo: userID userSig token phone
    userInfo: null,
    // 个人信息
    userProfile: null,
    headerHeight: 0,
    statusBarHeight: 0,
    isFirstLogin: true,
    reportType: 'imWxTuikit',
    isReady: false,
    fromPage: '',
  },

  onSDKReady(event) {
    const fromPageIndex = this.globalData.fromPage.indexOf('TUI-Index');
    if (this.globalData.fromPage === '') return;
    wx.showLoading();
    if (event.name) {
      wx.hideLoading();
      wx.$TUIKit.getMyProfile()
        .then((imResponse) => {
          this.globalData.userProfile = imResponse.data;
          wx.setStorage({
            key: 'userProfile',
            data: imResponse.data,
          });
        });
      this.globalData.isReady = true;
      let routeName = 'navigateTo';
      if (fromPageIndex > 1) {
        routeName = 'switchTab';
      }
      if (!this.globalData.userInfo) {
        routeName = fromPageIndex > 1 ? 'switchTab' : 'redirectTo';
      }
      wx[routeName]({
        url: this.globalData.fromPage,
      });
    }
    this.globalData.fromPage = '';
  },
  onSdkNotReady() {
  },
  onKickedOut() {
    wx.showToast({
      title: '您被踢下线',
      icon: 'error',
    });
    wx.navigateTo({
      url: './pages/TUI-Login/login',
    });
  },

  onTIMError() {

  },

  onNetStateChange() {

  },

});
