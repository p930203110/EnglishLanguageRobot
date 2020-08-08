//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '@/AI.jpg',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    result:'',
    plain: false,
    loading: false
  },

  onLoad: function() {
    
    // var that = this;
    // this.recorderManager = wx.getRecorderManager();
    // this.recorderManager.onError(function () {
    //   // 录音失败的回调处理
    // });
    // this.recorderManager.onStop(function (res) {
    //   // 停止录音之后，把录取到的音频放在res.tempFilePath
    //   that.setData({
    //     src: res.tempFilePath
    //   })
    //   console.log(res.tempFilePath)
    //   that.tip("录音完成！")
     

    // });
    // this.innerAudioContext = wx.createInnerAudioContext();
    // this.innerAudioContext.onError((res) => {
    //   that.tip("播放录音失败！")
    // })

   
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  }/**
   * 播放录音
   */
  , playRecord: function(){
    var that = this;
    var src = this.data.src;
    console.log(src);
    if (src == '') {
      this.tip("请先录音！")
      return;
    }
    this.innerAudioContext.src = this.data.src;
    this.innerAudioContext.play()
     
  },
  getText:function(){
    var that=this;
    wx.uploadFile({
          url: 'http://34.80.21.64:8091/upload/fileUpload' , //仅为示例，非真实的接口地址
          filePath: this.data.src,
          name: "hello",
          header: {
          "Content-Type": "multipart/form-data"
          },
          formData: {
            "user": "test",
          },
          success: function (res) {
            var data = res.data
            console.log(data)
            that.setData({
              result: res.data
            })
          }
        })
  }
  /**
   * 停止录音
   */
  ,stopRecord: function(){
    this.recorderManager.stop();
    this.playRecord();
    this.getText();

  }
  , tip: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  }
  /**
   * 录制mp3音频
  */
  , startRecordMp3: function () {
    console.log('-trigger record-');
    const options = {
        duration: 20000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 64000,
        format: 'mp3',
        frameSize: 50
    }
    this.recorderManager.start(options);
  },
  /**
   * 录制aac音频
   */
  startRecordAac: function(){
    const options = {
        duration: 10000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 64000,
        format: 'acc',
        frameSize: 50
    }
    this.recorderManager.start(options);
  },
  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  toIm:function(){
    console.log('-trigger-toIm-');
    wx.navigateTo({
      url: '../im/room/room'
    })
  },
  toTopics:function(){
    console.log('-trigger-toTopics-');
    wx.navigateTo({
      url: '../topics/topics'
    })
  },
  toPronunciation:function(){
    console.log('-trigger-toPronunciation-');
    wx.navigateTo({
      url: '../index/pronunciation'
    })
  }

})
