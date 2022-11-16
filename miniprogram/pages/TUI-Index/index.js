// eslint-disable-next-line no-undef
const app = getApp();
const { getTokenStorage } = require('../../utils/token');
// eslint-disable-next-line no-undef
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneList: [
      { id: 1, name: '在线客服', url: '../../TUI-CustomerService/pages/index', iconUrl: '../../static/online-service.svg' },
      { id: 2, name: '实时通话', url: '../../TUI-Call/pages/TUI-Call/callkit-index/index', iconUrl: '../../static/calling.svg' },
      { id: 3, name: '互动直播', url: '', iconUrl: '../../static/interactive-live.svg' },
    ],
    login: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
  },
  onShow() {
    getTokenStorage().then((data) => {
      const { expiresIn, userInfo } = data;
      app.globalData.userInfo = userInfo;
      if (userInfo.token && (expiresIn > Date.now())) {
        this.setData({
          login: true,
        });
      }
    });
  },
  handleOnPageNavigate(event) {
    const tab = event.currentTarget.dataset.item;
    switch (tab.id) {
      case 1:
        wx.aegis.reportEvent({
          name: 'chooseSence',
          ext1: 'sence-customerService',
          ext2: app.globalData.reportType,
          ext3: app.globalData.SDKAppID,
        });
        this.handleClickLogin(tab.url);
        break;
      case 2:
        wx.aegis.reportEvent({
          name: 'chooseSence',
          ext1: 'sence-calling',
          ext2: app.globalData.reportType,
          ext3: app.globalData.SDKAppID,
        });
        this.handleClickLogin(tab.url);
        break;
      default:
        wx.aegis.reportEvent({
          name: 'chooseSence',
          ext1: 'sence-live',
          ext2: app.globalData.reportType,
          ext3: app.globalData.SDKAppID,
        });
        wx.navigateToMiniProgram({
          appId: 'wx3b91b7aaa809ecf9',
        });
        break;
    }
  },
  // 处理点击跳转登录。第一种情况：首次登录则直接跳转到登录页面。第二种情况：已登录，切到首页后，或者直接杀死小程序后，如果SDK没有ready，则等待sdk Ready后再进行跳转，否则直接跳转。
  handleClickLogin(url) {
    if (app.globalData.userInfo) {
      if (app.globalData.isReady) {
        wx.navigateTo({
          url: url,
        });
      }
      if (!app.globalData.isReady && this.data.login) {
        wx.$TUIKit.login({
          userID: app.globalData.userInfo.userID,
          userSig: app.globalData.userInfo.userSig,
        }).then((imResponse) => {
          wx.setStorageSync('islogin', true);
          // 如果再次进入先点的个人中心，个人中心也需要登录一次，所以需要加一个是不是重复登录的判断。
          if (imResponse.data.repeatLogin === true) {
            wx.navigateTo({
              url: url,
            });
          } else {
            app.globalData.fromPage = url;
          }
        });
      }
    } else {
      app.globalData.fromPage = url,
      wx.navigateTo({
        url: '../TUI-Login/login',
      });
    }
  },

  learnMore() {
    wx.navigateTo({
      url: '../TUI-User-Center/webview/webview?url=https://cloud.tencent.com/product/im',
    });
  },
});
