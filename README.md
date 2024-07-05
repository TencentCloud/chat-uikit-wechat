## 关于腾讯云即时通信 IM

腾讯云即时通信（Instant Messaging，IM）基于 QQ 底层 IM 能力开发，仅需植入 SDK 即可轻松集成聊天、会话、群组、资料管理能力，帮助您实现文字、图片、短语音、短视频等富媒体消息收发，全面满足通信需要。


## 关于 chat-uikit-wechat

chat-uikit-wechat 是基于腾讯云 IM SDK 的一款 小程序 UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、群组、音视频通话等功能。基于 UI 组件您可以像搭积木一样快速搭建起自己的业务逻辑。
chat-uikit-wechat 中的组件在实现 UI 功能的同时，会调用 IM SDK 相应的接口实现 IM 相关逻辑和数据的处理，因而开发者在使用 chat-uikit-wechat 时只需关注自身业务或个性化扩展即可。
chat-uikit-wechat 效果如下图所示：
<img width="1015" src="https://user-images.githubusercontent.com/40623255/202661227-d4227dcc-bada-42a6-a57b-0d0c0abc098b.png" />

> 为尊重表情设计版权，TUIKit 工程中不包含大表情元素切图，正式上线商用前请您替换为自己设计或拥有版权的其他表情包。默认的QQ表情版权归腾讯所有且不支持授权，请您谅解并知悉。
>
> 点击👉: [提交工单](https://console.cloud.tencent.com/workorder/category?level1_id=29&level2_id=40&source=14&data_title=%E5%8D%B3%E6%97%B6%E9%80%9A%E4%BF%A1%20IM&step=1)

## 发送您的第一条消息

### 开发环境要求

-  微信开发者工具
-  JavaScript
-  node（12.13.0 <= node版本 <= 17.0.0, 推荐使用 Node.js 官方 LTS 版本 16.17.0）
-  npm（版本请与 node 版本匹配）

### TUIKit 源码集成

#### 步骤1：创建项目

在微信开发者工具上创建一个小程序项目，选择不使用模版。

<img  src="https://user-images.githubusercontent.com/40623255/202665077-b4f01580-69f2-493c-9fab-4f4ef8e5021a.png"/>

#### 步骤2：下载 TUIKit 组件

微信开发者工具创建的小程序不会默认创建 package.json 文件，因此您需要先创建 package.json 文件。新建终端，如下:

<img  src="https://qcloudimg.tencent-cloud.cn/raw/6735b8ead18ffa7c80f2e16cebbdc9d1.png"/>

输入:

```shell
npm init
```
然后通过 npm 方式下载 TUIKit 组件， 为了方便您后续的拓展，建议您将 TUIKit 组件复制到自己的小程序目录下:

macOS端
```shell
npm i @tencentcloud/chat-uikit-wechat
```
```shell
mkdir -p ./TUIKit && cp -r node_modules/@tencentcloud/chat-uikit-wechat/ ./TUIKit
```
Windows端
```shell
npm i @tencentcloud/chat-uikit-wechat
```
```shell
xcopy node_modules\@tencentcloud\chat-uikit-wechat .\TUIKit /i /e
```
成功后目录结构如图所示： 

<img width="300" src="https://qcloudimg.tencent-cloud.cn/raw/e4510d5500e6b34309bd6fb138dc30cd.png"/>

构建 npm，微信开发者工具-工具 > 构建 npm:

<img width="300" src="https://qcloudimg.tencent-cloud.cn/raw/0a028bb1ebe42ed3f0d020728677e28c.png" class="zoom-img-hover">

构建 npm 后目录如下（新增 miniprogram_npm 文件夹）：

<img width="300" src="https://qcloudimg.tencent-cloud.cn/raw/185bc6a4b2b57df64f297e5bc253d685.png" class="zoom-img-hover">

>! 您构建 npm 时，若出现如下图所示提示，请点击【确定】按钮，该提示信息不会影响到组件的正常使用。
>
><img width="300" src="https://qcloudimg.tencent-cloud.cn/raw/c28d2bdc58e09a642a6b6ac71467953a.png" class="zoom-img-hover">

#### 步骤3：引入 TUIKit 组件

##### 方式一： 主包引入 （适用于业务逻辑简单的小程序）
在 page 页面引用 TUIKit 组件，为此您需要分别修改 index.wxml 、index.js 和 index.json。

wxml 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/9816f2a2141357fbaced7e77929392f8.png"/>

```html
 <view>
    <TUIKit config="{{config}}" id="TUIKit"></TUIKit>
</view>
```
config 的参数如下表所示：

| 参数 | 类型 | 是否必填 | 含义
| ------ | ------ | ------ | ------ |
| userID | String | 是 | 当前用户的 ID，字符串类型，只允许包含英文字母（a-z 和 A-Z）、数字（0-9）、连词符（-）和下划线（_） |
| SDKAPPID | Number | 是 | 云通信应用的 SDKAppID |
| SECRETKEY | String | 是 | 密钥信息，详情可参考<a href="#append">步骤4</a> |
| EXPIRETIME | Number | 否 | userSig 过期时间 |

js 文件 

<img  src="https://qcloudimg.tencent-cloud.cn/raw/b9c02ec038b4b397f175591c7b5ef876.png"/>

```javascript
import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
import TIMProfanityFilterPlugin from 'tim-profanity-filter-plugin';
import { genTestUserSig }  from '../../TUIKit/debug/GenerateTestUserSig';

Page({
    data: {
        config: {
            userID: '', //User ID
            SDKAPPID: 0, // Your SDKAppID
            SECRETKEY: '', // Your secretKey
            EXPIRETIME: 604800,
        }
    },

    onLoad() {
        const userSig = genTestUserSig(this.data.config).userSig 
        wx.$TUIKit = TencentCloudChat.create({
            SDKAppID: this.data.config.SDKAPPID
        })
        wx.$chat_SDKAppID = this.data.config.SDKAPPID;
        wx.$chat_userID = this.data.config.userID;
        wx.$chat_userSig = userSig;
        wx.TencentCloudChat = TencentCloudChat;
        wx.$TUIKit.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
        wx.$TUIKit.registerPlugin({ 'tim-profanity-filter-plugin': TIMProfanityFilterPlugin });
        wx.$TUIKit.login({
            userID: this.data.config.userID,
            userSig
        });
        wx.setStorage({
            key: 'currentUserID',
            data: [],
        });
        wx.$TUIKit.on(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
    },
    onUnload() {
        wx.$TUIKit.off(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
    },
    onSDKReady() {
        const TUIKit = this.selectComponent('#TUIKit');
        TUIKit.init();
    }
});
```
 json 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/866e12c4bf19e08c71c233158cc19106.png"/>

```json
{
  "usingComponents": {
    "TUIKit": "../../TUIKit/index"
  },
	"navigationStyle": "custom"
}
```

##### 方式二：分包引入 （适用于业务逻辑复杂，按需载入的小程序）
小程序分包有如下好处：
- 规避所有逻辑代码放主包，导致主包文件体积超限问题
- 支持按需载入，降低小程序载入耗时和页面渲染耗时
- 支持更加复杂的功能
分包流程：
1.在自己项目里创建分包，本文以 TUI—CustomerService 为例。和 pages 同级创建 TUI—CustomerService 文件夹，并在文件夹内部创建 pages 文件夹并且其下创建 index 页面。
创建后的目录结构：

<img  src="https://qcloudimg.tencent-cloud.cn/raw/abaeb327a9f007c79f55695b3835ced9.png"/>

2.在 app.json 文件注册分包。

```json
{
  "pages": [
    "pages/index/index"
  ],
  "subPackages": [
    {
      "root": "TUI-CustomerService",
      "name": "TUI-CustomerService",
      "pages": [
        "pages/index"
      ],
      "independent": false
    }
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "Weixin",
    "navigationBarTextStyle": "black"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```
3.将 TUIKit 文件夹复制到分包目录下。

成功后的目录结构:

<img  src="https://qcloudimg.tencent-cloud.cn/raw/5abd5dc90d2e5d53b3ed1a264e0398f8.png"/>

4.将 TUIKit 文件夹下的 debug 文件夹复制到主包。

<img  src="https://qcloudimg.tencent-cloud.cn/raw/b6a8236cce4a2143f886fa141ee106a5.png"/>

5. 在分包内引用 TUIKit组件，为此需要分别修改分包内部 index.wxml 、index.js 、index.json 文件，以及 app.js 文件。

wxml 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/072f4f8f78d512f28ac8e82ed9925055.png"/>

```html
 <view>
    <TUIKit config="{{config}}" id="TUIKit"></TUIKit>
</view>
```
config 的参数如下表所示：

| 参数 | 类型 | 是否必填 | 含义
| ------ | ------ | ------ | ------ |
| userID | String | 是 | 当前用户的 ID，字符串类型，只允许包含英文字母（a-z 和 A-Z）、数字（0-9）、连词符（-）和下划线（_） |
| SDKAPPID | Number | 是 | 云通信应用的 SDKAppID |
| SECRETKEY | String | 是 | 密钥信息，详情可参考<a href="#append">步骤4</a> |
| EXPIRETIME | Number | 否 | userSig 过期时间 |

 js 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/d36a0543c7fe94def0fc36042eddc28c.png"/>

```javascript
Page({

// 其他代码

  onLoad() {
    const TUIKit = this.selectComponent('#TUIKit');
    TUIKit.init();
  },
});
```

 json 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/4499096c37b9b29abffa21b71fb90e9e.png"/>

```json
  {
  "usingComponents": {
    "TUIKit": "../TUIKit/index"
  },
  "navigationStyle": "custom"
  }
```
app.js 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/170aa919af6db0e7b32ace5da9d417f1.png"/>

```javascript
import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
import TIMProfanityFilterPlugin from 'tim-profanity-filter-plugin';
import { genTestUserSig } from './debug/GenerateTestUserSig';
App({
  onLaunch: function () {
    wx.$TUIKit = TencentCloudChat.create({
      SDKAppID: this.globalData.config.SDKAPPID,
    });
    const userSig = genTestUserSig(this.globalData.config).userSig 
    wx.$chat_SDKAppID = this.globalData.config.SDKAPPID;
    wx.TencentCloudChat = TencentCloudChat;
    wx.$chat_userID = this.globalData.config.userID;
    wx.$chat_userSig = userSig;
    wx.$TUIKit.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
    wx.$TUIKit.registerPlugin({ 'tim-profanity-filter-plugin': TIMProfanityFilterPlugin });
    wx.$TUIKit.login({
      userID: this.globalData.config.userID,
      userSig
  });
    // 监听系统级事件
    wx.$TUIKit.on(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
  },
  onUnload() {
    wx.$TUIKit.off(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
  },
  globalData: {
    config: {
      userID: '', // User ID
      SECRETKEY: '', // Your secretKey
      SDKAPPID: 0, // Your SDKAppID
      EXPIRETIME: 604800,
    },
  },
  onSDKReady(event) {
    // 监听到此事件后可调用 SDK 发送消息等 API，使用 SDK 的各项功能。
  }
});
```
6. 按需载入分包，您需要修改主包 pages 下的 index.wxml 、index.js。

wxml 文件 

<img  src="https://qcloudimg.tencent-cloud.cn/raw/86f2698910c2e255727f419625441ed9.png"/>

```html
<view class="container" bindtap="handleJump">
  载入腾讯云 IM 分包
</view>
```

js 文件

<img  src="https://qcloudimg.tencent-cloud.cn/raw/5c41dff77345aa364bde46039f84ffd7.png"/>

```javascript
Page({
  handleJump() {
    wx.navigateTo({
      url: '../../TUI-CustomerService/pages/index',
    })
  }
})
```

#### <p id="append">步骤4： 获取 SDKAppID 、SECRETKEY 与 userID</p>

设置步骤3示例代码中的相关参数 SDKAPPID、SECRETKEY 以及 userID ，其中  SDKAppID 和密钥等信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im)  获取，单击目标应用卡片，进入应用的基础配置页面。例如：
<img style="width:600px; max-width: inherit;" src="https://qcloudimg.tencent-cloud.cn/raw/44a331ce39f05f7080cf33ca9bc8e5dd.png"/>
userID 信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im)  进行创建和获取，单击目标应用卡片，进入应用的账号管理页面，即可创建账号并获取 userID。例如：
<img style="width:870px; max-width: inherit;" src="https://qcloudimg.tencent-cloud.cn/raw/94c801b7258612f8a4018728d862252f.png"/>

### 步骤5：编译小程序

- 请在本地设置里面勾选上“不校验合法域名、web-view (业务域名)、 TLS 版本以及 HTTPS 证书”。

<img  src="https://qcloudimg.tencent-cloud.cn/raw/e32530c238362d5bb597c1171f6646ff.png"/>

- 点击【清缓存】->【全部清除】，避免开发者工具的缓存造成渲染异常。

<img  src="https://qcloudimg.tencent-cloud.cn/raw/2c68432c6e3399df21517e521c356299.png"/>

- 点击【编译】。

<img src="https://qcloudimg.tencent-cloud.cn/raw/b98aebdadf932e036e9900aea5651c1e.png"/>

### 步骤6：发送您的第一条消息
<img style="width:1000" src="https://qcloudimg.tencent-cloud.cn/raw/4673f24d0fc8319c4788d505d9fde774.png" />     
 <img style="width:1000" src="https://qcloudimg.tencent-cloud.cn/raw/02eb06fbc13cdf27664fe55eb2e10b49.png"  />  

### 常见问题
#### 1. 什么是 UserSig？

UserSig 是用户登录即时通信 IM 的密码，其本质是对 UserID 等信息加密后得到的密文。 

#### 2. 如何生成 UserSig？

 UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向项目的接口，在需要 UserSig 时由您的项目向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/269/32688#GeneratingdynamicUserSig)。

> !
>
> 本文示例代码采用的获取 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此**该方法仅适合本地跑通功能调试**。 正确的 UserSig 签发方式请参见上文。

### 3. 小程序如果需要上线或者部署正式环境怎么办？
请在**微信公众平台**>**开发**>**开发管理**>**开发设置**>**服务器域名**中进行域名配置：

从v2.11.2起 SDK 支持了 WebSocket，WebSocket 版本须添加以下域名到 **socket 合法域名**：

| 域名 | 说明 |  是否必须 |
|-------|---------|----|
|`wss://wss.im.qcloud.com`| Web IM 业务域名 | 必须|
|`wss://wss.tim.qq.com`| Web IM 业务域名 | 必须|

将以下域名添加到 **request 合法域名**：

| 域名 | 说明 |  是否必须 |
|-------|---------|----|
|`https://web.sdk.qcloud.com`| Web IM 业务域名 | 必须|
|`https://webim.tim.qq.com` | Web IM 业务域名 | 必须|
|`https://api.im.qcloud.com` | Web IM 业务域名 | 必须|


| 域名 | 说明 |  是否必须 |
|-------|---------|----|
|`https://cos.ap-shanghai.myqcloud.com` | 文件上传域名 | 必须|
|`https://cos.ap-shanghai.tencentcos.cn` | 文件上传域名 | 必须|
|`https://cos.ap-guangzhou.myqcloud.com` | 文件上传域名 | 必须|


将以下域名添加到 **downloadFile 合法域名**：

| 域名 | 说明 |  是否必须 |
|-------|---------|----|
|`https://cos.ap-shanghai.myqcloud.com` | 文件下载域名 | 必须|
|`https://cos.ap-shanghai.tencentcos.cn` | 文件下载域名 | 必须|
|`https://cos.ap-guangzhou.myqcloud.com` | 文件下载域名 | 必须|
