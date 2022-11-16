import { setTokenStorage } from '../../utils/token';
import logger from '../../utils/logger';
import { gslb, userVerifyByPicture, userLoginCode } from '../../utils/api';
// eslint-disable-next-line no-undef
const app = getApp();
// eslint-disable-next-line no-undef
Page({
  data: {
    userID: '',
    hidden: false,
    btnValue: '获取验证码',
    btnDisabled: false,
    privateAgree: false,
    phone: '',
    code: '',
    aPaas_sessionId: null,
    second: 60,
    path: '',
    lastTime: 0,
    countryIndicatorStatus: false,
    country: '86',
    indicatorValue: 46,
    headerHeight: app.globalData.headerHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    showlogin: false,
  },

  // 手机号输入
  bindPhoneInput(e) {
    const val = e.detail.value;
    this.setData({
      // 不加 86 会导致接口校验错误, 有国际化需求的时候这里要改动下
      phone: `86${val}`,
    });
    if (val !== '') {
      this.setData({
        hidden: false,
        btnValue: '获取验证码',
      });
    }
  },
  // 验证码输入
  bindCodeInput(e) {
    this.setData({
      code: e.detail.value,
    });
  },

  onAgreePrivateProtocol() {
    this.setData({
      privateAgree: !this.data.privateAgree,
    });
  },

  linkToPrivacyTreaty() {
    const url = 'https://web.sdk.qcloud.com/document/Tencent-IM-Privacy-Protection-Guidelines.html';
    wx.navigateTo({
      url: `../TUI-User-Center/webview/webview?url=${url}&nav=Privacy-Protection`,
    });
  },

  linkToUserAgreement() {
    const url = 'https://web.sdk.qcloud.com/document/Tencent-IM-User-Agreement.html';
    wx.navigateTo({
      url: `../TUI-User-Center/webview/webview?url=${url}&nav=User-Agreement`,
    });
  },

  // 获取验证码
  handlerVerify(ev) {
    if (ev.detail.ret === 0) {
      const ticket = `${ev.detail.ticket}`;
      const phone = `${this.data.phone}`;
      gslb()
        .then(res =>  userVerifyByPicture({
          ticket,
          phone,
          type: 'wxmini',
          appId: res.data.captcha_wxmini_appid,
        }))
        .then((res) => {
          switch (res.errorCode) {
            case 0:
              this.timer();
              this.setData({
                aPaas_sessionId: res.data.sessionId,
              });
              wx.showToast({
                title: '验证码已发送',
                icon: 'success',
                duration: 1000,
                mask: true,
              });
              break;
            case -1001:
            case -1002:
              wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 1000,
                mask: true,
              });
              break;
            case -1003:
              wx.showToast({
                title: '验证码发送失败',
                icon: 'none',
                duration: 1000,
                mask: true,
              });
              break;
            default:
              break;
          }
          this.data.lastTime = new Date().getTime();
        })
        .catch(() => {
          wx.showToast({ title: '发送验证码失败', icon: 'none', duration: 1000 });
        });
    }
  },

  handlerReady() {},

  handlerClose() {},

  handlerError() {
    logger.error('| TUI-login | captcha | error');
    this.selectComponent('#captcha').refresh();
  },

  getCode() {
    const now = new Date();
    const nowTime = now.getTime();
    if (this.data.phone !== '') {
      if (nowTime - this.data.lastTime > 10000) {
        this.selectComponent('#captcha').show();
      }
    } else {
      wx.showToast({
        title: '请输入手机号',
      });
    }
  },

  // 计时器
  timer() {
    const promise = new Promise((resolve) => {
      const setTimer = setInterval(() => {
        const second = this.data.second - 1;
        this.setData({
          second,
          btnValue: `${second}s`,
          btnDisabled: true,
        });
        if (this.data.second <= 0) {
          this.setData({
            second: 60,
            btnValue: '获取验证码',
            btnDisabled: false,
          });
          resolve(setTimer);
        }
      }, 1000);
    });
    promise.then((setTimer) => {
      clearInterval(setTimer);
    });
  },

  login() {
    userLoginCode({
      sessionId: this.data.aPaas_sessionId,
      phone: this.data.phone, // phone和email二选一
      code: this.data.code,
      apaasAppId: '1026227964'
    }).then((res) => {
      if (app.globalData.isFirstLogin) {
        wx.aegis.reportEvent({
          name: 'login',
          ext1: 'login-success',
          ext2: app.globalData.reportType,
          ext3: app.globalData.SDKAppID,
        });
        app.globalData.isFirstLogin = false;
      }
      const { userSig, userId: userID, phone, token } = res.data;
      logger.log(`|TUIKit | TUI-login | login | userSig:${userSig} userID:${userID} phone: ${phone}`);
      switch (res.errorCode) {
        case 0:
          app.globalData.userInfo = {
            userSig,
            userID,
            phone,
            token,
          };
          setTokenStorage({
            phone,
            token,
            userInfo: app.globalData.userInfo,
          });
          wx.setStorage({
            key: 'isFirstSendMessage',
            data: 'true',
          });
          wx.$TUIKit.login({
            userID,
            userSig,
          }).then(() => {
            wx.$chat_userID = userID;
            wx.$chat_userSig = userSig;
            wx.setStorageSync('islogin', true);
          });
          break;
        case -1001:
          wx.showToast({
            title: '请输入正确的手机号和验证码',
            icon: 'none',
            duration: 1000,
            mask: true,
          });
          break;
        case -1002:
          wx.showToast({
            title: '手机号格式不对',
            icon: 'none',
            duration: 1000,
            mask: true,
          });
          break;
        case -1100:
        case -1101:
          wx.showToast({
            title: '验证码已失效,请重新请求',
            icon: 'none',
            duration: 1000,
            mask: true,
          });
          break;
        case -1102:
          wx.showToast({
            title: '验证码错误',
            icon: 'none',
            duration: 1000,
            mask: true,
          });
          break;
        default:
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 1000,
            mask: true,
          });
      }
    });
  },


  // 国家区号选择组件开关
  onToggleCountryIndicator() {
    this.setData({
      countryIndicatorStatus: true,
    });
  },
  onCountryIndicatorClose(event) {
    this.setData({
      countryIndicatorStatus: event.detail.status,
    });
  },
  // 国家区号确定选择
  handleIndicator(event) {
    this.setData({
      country: event.detail.country,
      indicatorValue: event.detail.indicatorValue,
    });
  },
});
