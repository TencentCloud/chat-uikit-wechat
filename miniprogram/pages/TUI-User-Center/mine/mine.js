import logger from '../../../utils/logger';

// eslint-disable-next-line no-undef
const app = getApp();
// eslint-disable-next-line no-undef
Page({
  data: {
    // 页面初始信息
    listInfo: [
      { id: 1, name: '显示在线状态',  textForShow: '开启后，您将可以在会话列表中看到好友在线或离线的状态提示', textForHide: '关闭后，您将不可以在会话列表中看到好友在线或离线的状态提示' },
      { id: 2, name: '关于腾讯云IM', src: '../../../static/detail.svg' },
    ],
    config: {
      nick: '',
      userID: '',

    },
    hasname: true,
    showQuit: false,
    open: true,
    clearList: ['expiresIn', 'token', 'userProfile', 'islogin'],
  },
  onLoad() {
    if (!app.globalData.isReady && app.globalData.userInfo) {
      const loginInfo = wx.getStorageSync('token');
      wx.$TUIKit.login({
        userID: loginInfo.userInfo.userID,
        userSig: loginInfo.userInfo.userSig,
      }).then(() => {
        wx.setStorageSync('islogin', true);
      });
    }
  },
  onShow() {
    if (!wx.getStorageSync('islogin')) {
      this.setData({
        showQuit: false
      });
    }
    // 不是首次登陆。如果先从Index页面进入，则app.globalData.userProfile有值，若是直接进入个人中心页面则app.globalData.userProfile没值，这时候需要渲染缓存里面的profile。如果更新了个人信息的话，则以globaldata里面的值为最新的。
    const profile = wx.getStorageSync('userProfile');
    if (!app.globalData.userProfile && profile === '') return;
    const userInfo = app.globalData.userProfile?.userID ? app.globalData.userProfile : profile;
    this.setData({
      config: userInfo,
      showQuit: true,
      hasname: !userInfo.nick,
    });
    const currentUserID = wx.getStorageSync('currentUserID');
    const showOpen = app?.globalData?.userInfo && currentUserID?.includes(app.globalData.userInfo.userID) ? wx.getStorageSync(app?.globalData?.userInfo?.userID) : true;
    this.setData({
      open: showOpen,
    });
  },
  personal() {
    wx.navigateTo({
      url: '../personal/personal',
    });
  },
  // 退出登陆
  quit() {
    logger.log('| TUI-User-Center | mine | quit-logout ');
    wx.$TUIKit.logout().then(() => {
      this.clear(),
      app.resetLoginData();
      app.globalData.isReady = false;
      this.setData({
        showQuit: false,
      });
      wx.switchTab({ url: '../../TUI-Index/index',
        success: () => {
          wx.showToast({
            title: '退出成功',
            icon: 'none',
          });
        },
      });
    });
    this.setData({
      open: true,
    });
  },
  // 登陆
  login() {
    app.globalData.fromPage = '../TUI-Index/index',
    wx.navigateTo({
      url: '../../TUI-Login/login',
    });
  },
  handleJump(event) {
    const data = event.currentTarget.dataset.item;
    if (data.id === 2) {
      wx.navigateTo({
        url: '../detail/index',
      });
    }
  },
  handleOpen() {
    const login = wx.getStorageSync('islogin');
    if (login) {
      this.setData({
        open: !this.data.open,
      }, () => {
        wx.setStorage({
          key: 'showOnlineStatus',
          data: this.data.open,
        });
      });
      // 获取当前缓存里的userID，如果当前的List为空或者List里不存在当前登录的userID就将当前的userID存到缓存里。
      const currentID = this.data.config.userID;
      const cacheList = wx.getStorageSync('currentUserID');
      const nowList = [];
      nowList.push(this.data.config.userID);
      if (cacheList.length === 0 || !cacheList.includes(this.data.config.userID)) {
        wx.setStorage({
          key: 'currentUserID',
          data: wx.getStorageSync('currentUserID').concat(nowList),
        });
      }
      wx.setStorage({
        key: currentID,
        data: this.data.open,
      });
    } else {
      app.globalData.fromPage = '../TUI-Index/index',
      wx.navigateTo({
        url: '../../TUI-Login/login',
      });
    }
  },
  // 退出登陆只清部分缓存
  clear() {
    this.data.clearList.forEach((element) => {
      wx.removeStorage({
        key: element,
      });
    });
  },
});
