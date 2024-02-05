import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';


Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    contactList: [],
    showContactInfo: false,
    contactInfo: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack() {
      this.triggerEvent('showConversation');
    },
    onCustomerServiceCommercialPluginUpdated(isEnabled) {
      if (!isEnabled) {
        console.warn('使用客服插件功能,' + '\n'
        + '需要您购买客服插件：https://console.cloud.tencent.com/im/plugin/DesKKi ;');
        wx.showToast({
          title: '请先购买客服插件',
          icon: 'none',
          duration: 1000,
          mask: true,
        });
        this.goBack();
        return;
      }
      const contactListExtensionID = TUIConstants.TUIContact.EXTENSION.CONTACT_LIST.EXT_ID;
      const tuiContactExtensionList = TUICore.getExtensionList(contactListExtensionID);

      const customerExtension = tuiContactExtensionList.find((extension) => {
        const { name, accountList = [] } = extension.data || {};
        return name === 'customer' && accountList.length > 0;
      });
      if (customerExtension) {
        const { data } = customerExtension;
        const { accountList } = (data || {}) ;
        wx.$TUIKit.getUserProfile({ userIDList: accountList })
          .then((res) => {
            if (res.data.length > 0) {
              this.setData({
                contactList: res.data,
              });
            }
          });
      }
    },
    chooseContact(event) {
      const currentContactInfo = event.currentTarget.dataset.value;
      this.setData({
        showContactInfo: true,
        contactInfo: currentContactInfo,
      });
    },
    handleShowContact() {
      this.setData({
        showContactInfo: false,
      });
    },
    getCurrentConversationID(event) {
      this.triggerEvent('createConversation', { currentConversationID: event.detail.currentConversationID });
    },
  },

  lifetimes: {
    attached() {
      TUIStore.watch(StoreName.APP, {
        enabledCustomerServicePlugin: this.onCustomerServiceCommercialPluginUpdated.bind(this),
      });
    },

    detached() {
      TUIStore.unwatch(StoreName.APP, {
        enabledCustomerServicePlugin: this.onCustomerServiceCommercialPluginUpdated.bind(this),
      });
    },
  },
});
