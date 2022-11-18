// eslint-disable-next-line no-undef
// Component Object
Component({
  properties: {
    myProperty: {
      type: String,
      value: '',
      observer() {},
    },

  },
  data: {
    userID: '',
    searchUser: {},
    myID: '',
  },
  methods: {
    goBack() {
      this.triggerEvent('showConversation');
    },
    // 获取输入的 UserID
    userIDInput(e) {
      this.setData({
        userID: e.detail.value,
        searchUser: {},
      });
    },
    // 获取该 UserID 对应的个人资料
    getuserProfile() {
      wx.$TUIKit.getUserProfile({
        userIDList: [this.data.userID],
      }).then((imRes) => {
        if (imRes.data.length > 0) {
          this.setData({
            searchUser: imRes.data[0],
          });
        } else {
          wx.showToast({
            title: '用户不存在',
            icon: 'error',
          });
          this.setData({
            userID: '',
          });
        }
      });
    },
    // 选择发起会话
    handleChoose() {
      this.data.searchUser.isChoose = !this.data.searchUser.isChoose;
      this.setData({
        searchUser: this.data.searchUser,
      });
    },
    // 确认邀请
    bindConfirmInvite() {
      if (this.data.searchUser.isChoose) {
        wx.aegis.reportEvent({
          name: 'conversationType',
          ext1: 'conversationType-c2c',
          ext2: wx.$chat_reportType,
          ext3: wx.$chat_SDKAppID,
        });
        this.triggerEvent('searchUserID', { searchUserID: `C2C${this.data.searchUser.userID}` });
      } else {
        wx.showToast({
          title: '请选择相关用户',
          icon: 'none',
        });
      }
    },
  },
  created() {
  },
  attached() {
    this.setData({
      myID: wx.$chat_userID,
    });
  },
  ready() {

  },
  moved() {

  },
  detached() {

  },
});
