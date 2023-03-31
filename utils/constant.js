const constant = {
  FEAT_NATIVE_CODE: {
    NATIVE_VERSION: 1,
    ISTYPING_STATUS: 1,
    NOTTYPING_STATUS: 1,
    ISTYPING_ACTION: 14,
    NOTTYPING_ACTION: 0,
    FEAT_TYPING: 1
  },
  TYPE_INPUT_STATUS_ING: 'EIMAMSG_InputStatus_Ing',
  TYPE_INPUT_STATUS_END: 'EIMAMSG_InputStatus_End',
  MESSAGE_TYPE_TEXT: {
    TIM_CUSTOM_ELEM: 'TIMCustomElem',
  },
  BUSINESS_ID_TEXT: {
    USER_TYPING: 'user_typing_status',
    EVALUATION: 'evaluation',
    ORDER: 'order',
    LINK: 'text_link',
    CREATE_GROUP: 'group_create',
    CONSULTION: 'consultion',
  },

  STRING_TEXT: {
    TYPETYPING: '对方正在输入...',
    TYPETEXT: '对本次服务的评价',
  },
  MESSAGE_ERROR_CODE: {
    DIRTY_WORDS: 80001,
    UPLOAD_FAIL: 6008,
    REQUESTOR_TIME: 2081,
    DISCONNECT_NETWORK: 2800,
    DIRTY_MEDIA: 80004,
    UNUPLOADED_PICTURE: 2040,
    UNUPLOADED_MEDIA: 2350,
    BLACKLIST_MEMBER: 20007,
    NOT_GROUP_MEMBER: 10007
  },
  TOAST_TITLE_TEXT: {
    DIRTY_WORDS: '您发送的消息包含违禁词汇!',
    UPLOAD_FAIL: '文件上传失败!',
    CONNECT_ERROR: '网络已断开',
    DIRTY_MEDIA: '您发送的消息包含违禁内容!',
    RESEND_SUCCESS: '重发成功',
    UNUPLOADED_PICTURE: '上传图片失败，请检查您是否未注册上传插件',
    UNUPLOADED_MEDIA: '上传视频失败，请检查您是否未注册上传插件',
    BLACKLIST_MEMBER: '您已被拉黑，无法对此人发送信息！',
    NOT_GROUP_MEMBER: '您已不在此群组中！'
  },

  OPERATING_ENVIRONMENT: 'imWxTuikit'
};


export default constant
