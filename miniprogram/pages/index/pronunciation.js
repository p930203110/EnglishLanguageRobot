// pages/index/pronunciation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    originData:['Hello, welcome to artificial intelligence world.','Have you ever been to China?','How are you this evening?','See you tomorrow.','Don’t jump to conclusions.'],
    index:0,
    score:0,
    result:'',
    loading:false,
    dialogShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onError(function () {
      // 录音失败的回调处理
    });
    this.recorderManager.onStop(function (res) {
      that.setData({
        loading:true
      })
      // 停止录音之后，把录取到的音频放在res.tempFilePath
      that.setData({
        src: res.tempFilePath
      })
      console.log(res.tempFilePath)
      // that.tip("录音完成！")
      that.getText();

    });
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      that.tip("播放录音失败！")
    })
    that.tip("Press start button to start reading the text out, release the button to end.\nIf you get 9 points or more, you can pass and go to the next one.");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  playRecord: function(){
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
   
    console.log(that.data.originData);
    wx.uploadFile({
          url: 'http://34.80.21.64:8091/audioToText?originText='+encodeURI(that.data.originData[that.data.index]), //仅为示例，非真实的接口地址
          filePath: this.data.src,
          name: "hello",
          header: {
          "Content-Type": "multipart/form-data"
          },
          formData: {
            "text": that.data.originData[that.data.index],
          },
          success: function (res) {
            var data = res.data
            console.log(data)
            var resArr = data.split('|');
            var pass = false;
            if(parseFloat(resArr[1])>9){
              pass=true;
            }
            that.setData({
              result: resArr[0],
              score:resArr[1],
              loading:false,
              dialogShow:true
            })
            
          }
        })
  }
  /**
   * 停止录音
   */
  ,stopRecord: function(){
    this.recorderManager.stop();

  }
  , tip: function (msg) {
    wx.showModal({
      title: '',
      content: msg,
      showCancel: false,
      confirmText:'OK'
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
  onClose:function(){
    this.setData({
      dialogShow:false
    })
  },
  goNext:function(){
     if(parseFloat(this.data.score)>9){
      this.setData({
        index:this.data.index+1
      })
      this.onClose()
     }else{
       this.tip('Need 9 points or more for next one.')
     }
  }
})