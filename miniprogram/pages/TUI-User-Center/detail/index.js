// pages/TUI-User-Center/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userListInfo: [
      { extra: 1, name: '隐私条例', path: 'https://web.sdk.qcloud.com/document/Tencent-IM-Privacy-Protection-Guidelines.html', nav: 'Privacy-Protection', iconUrl: '../../../static/Privacyregulations.svg' },
      { extra: 1, name: '用户协议', path: 'https://web.sdk.qcloud.com/document/Tencent-IM-User-Agreement.html', nav: 'User-Agreement', iconUrl: '../../../static/Useragreement.svg' },
      { extra: 3, name: '免责声明', iconUrl: '../../../static/Disclaimers.svg' },
      { extra: 2, name: '关于', url: '../about/about', iconUrl: '../../../static/about.svg' },
      { extra: 1, name: '联系我们', path: 'https://cloud.tencent.com/document/product/269/20043', iconUrl: '../../../static/contact.svg' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  handleRouter(event) {
    const data = event.currentTarget.dataset.item;
    if (data.url) {
      wx.navigateTo({ url: `${data.url}` });
    } else if (data.name === '免责声明') {
      this.setData({
        popupToggle: true,
      });
    } else {
      wx.navigateTo({
        url: `../webview/webview?url=${data.path}&nav=${data.nav}`,
      });
    }
  },
  Agree() {
    this.setData({
      popupToggle: false,
    });
  },
});
