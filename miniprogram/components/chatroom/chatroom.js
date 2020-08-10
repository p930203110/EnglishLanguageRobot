const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 100000,
  scrollWithAnimation: true,
}

Component({
  properties: {
    envId: String,
    collection: String,
    groupId: String,
    groupName: String,
    userInfo: Object,
    topic:String,
    onGetUserInfo: {
      type: Function,
    },
    getOpenID: {
      type: Function,
    },
  },

  data: {
    chats: [],
    textInputValue: '',
    openId: '',
    scrollTop: 0,
    scrollToMessage: '',
    hasKeyboard: false,
    src:'',
    audioId:'',
    audioMap:{},
    index:0,
    initHistory:''
  },
  methods: {
    startRecordMp3: function () {
      console.log('-trigger record-');
      const options = {
          duration: 20000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 64000,
          format: 'mp3',
          frameSize: 50
      }
      console.log(this.recorderManager);
      this.recorderManager.start(options);
    },
    stopRecord: function(){
      console.log(this.recorderManager);
      this.recorderManager.stop();
      
      
  
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
              var text = res.data
              const doc = {
                _id: that.data.audioId,
                groupId: that.data.groupId,
                avatar: that.data.userInfo.avatarUrl,
                nickName: that.data.userInfo.nickName,
                msgType: 'text',
                textContent: text,
                sendTime: new Date(),
                sendTimeTS: Date.now(), // fallback
              }
              
              
              that.setData({
                textInputValue: '',
                chats: [
                  ...that.data.chats,
                  {
                    ...doc,
                    _openid: that.data.openId,
                    writeStatus: 'written',
                  },
                ],
              })
              if(that.data.initHistory!=''&&that.data.index==0){
                text=that.data.initHistory+text;
              }
              wx.request({
                url: 'http://34.96.218.200:8099/nextSentence?text='+text+'|'+that.data.index, //仅为示例，并非真实的接口地址
                data: {
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success (res) {
                  const doc2 = {
                    _id: `${Math.random()}_${Date.now()}`,
                    groupId: that.data.groupId,
                    avatar: '/images/AI.jpg',
                    nickName: 'AITutor',
                    msgType: 'text',
                    textContent: res.data,
                    sendTime: new Date(),
                    sendTimeTS: Date.now(), // fallback
                  }
                  
                  
          
                  that.setData({
                    textInputValue: '',
                    index:that.data.index+1,
                    chats: [
                      ...that.data.chats,
                      {
                        ...doc2,
                        _openid: "123456",
                        writeStatus: 'written',
                      },
                    ],
                  })
                  that.scrollToBottom(true)
                }
              })
              that.scrollToBottom(true)

              
              
            }
          })
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
    playRecordById: function(id){
      var that = this;
      var src = this.data.audioMap[id];
      console.log(src);
      if (src == '') {
        console.log('语音丢失');
        return;
      }
      this.innerAudioContext.src = src;
      this.innerAudioContext.play()
       
    },
    onGetUserInfo(e) {
      this.properties.onGetUserInfo(e)
    },

    getOpenID() { 
      return this.properties.getOpenID() 
    },
    initRecordManager(){
        var that = this;
        this.setData({
          index: 0
        })
        this.recorderManager = wx.getRecorderManager();
        this.recorderManager.onError(function () {
          // 录音失败的回调处理
        });
        this.recorderManager.onStart(function (res) {
          console.log('-onStart trigger-');
          that.data.audioId=`${Math.random()}_${Date.now()}`;
          that.data.audioMap[that.data.audioId]='';
        });
        this.recorderManager.onStop(function (res) {
          console.log('-onStop trigger-');
          console.log(res);
          // 停止录音之后，把录取到的音频放在res.tempFilePath
          that.setData({
            src: res.tempFilePath
          })
          console.log(res.tempFilePath)
          //that.tip("录音完成！")
          that.data.audioMap[that.data.audioId]=res.tempFilePath;

          that.getText();
        });
        this.innerAudioContext = wx.createInnerAudioContext();
        this.innerAudioContext.onError((res) => {
          that.tip("播放录音失败！")
        })
        
        
    },
    mergeCommonCriteria(criteria) {
      return {
        groupId: this.data.groupId,
        ...criteria,
      }
    },
     tip: function (msg) {
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false
      })
    },
    async initRoom() {
      this.try(async () => {
        await this.initRecordManager()
        await this.initOpenID()
        
        
        // const { envId, collection } = this.properties
        // const db = this.db = wx.cloud.database({
        //   env: envId,
        // })
        // const _ = db.command

        // const { data: initList } = await db.collection(collection).where(this.mergeCommonCriteria()).orderBy('sendTimeTS', 'desc').get()

        // console.log('init query chats', initList)

        // this.setData({
        //   chats: initList.reverse(),
        //   scrollTop: 10000,
        // })
      

        // this.initWatch(initList.length ? {
        //   sendTimeTS: _.gt(initList[initList.length - 1].sendTimeTS),
        // } : {})
        

      }, '初始化失败')

      if(this.data.topic!=''){
        var initText="Let's talk about "+this.data.topic;
        if(this.data.topic=='weather'){
          initText+=", what's the weather in your place?";
        }else if(this.data.topic=='books'){
          initText+=", what's your favourite book?";
        }else if(this.data.topic=='movie'){
          initText+=", what's your favourite movie?";
        }else if(this.data.topic=='sports'){
          initText+=", what's your favourite sport?";
        }else if(this.data.topic=='music'){
          initText+=", do you often listen music?";
        }
          const docInit = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: '/images/AI.jpg',
            nickName: 'AITutor',
            msgType: 'text',
            textContent: initText,
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }
          this.setData({
            textInputValue: '',
            initHistory:initText,
            chats: [
              ...this.data.chats,
              {
                ...docInit,
                _openid: "123456",
                writeStatus: 'written',
              },
            ],
          })
      }
    },

    async initOpenID() {
      return this.try(async () => {
        const openId = await this.getOpenID()

        this.setData({
          openId,
        })
      }, '初始化 openId 失败')
    },

    async initWatch(criteria) {
      this.try(() => {
        const { collection } = this.properties
        const db = this.db
        const _ = db.command

        console.warn(`开始监听`, criteria)
        this.messageListener = db.collection(collection).where(this.mergeCommonCriteria(criteria)).watch({
          onChange: this.onRealtimeMessageSnapshot.bind(this),
          onError: e => {
            if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
              this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
                this.initWatch(this.data.chats.length ? {
                  sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                } : {})
              })
            } else {
              this.initWatch(this.data.chats.length ? {
                sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
              } : {})
            }
          },
        })
      }, '初始化监听失败')
    },

    onRealtimeMessageSnapshot(snapshot) {
      console.warn(`收到消息`, snapshot)

      if (snapshot.type === 'init') {
        this.setData({
          chats: [
            ...this.data.chats,
            ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS),
          ],
        })
        this.scrollToBottom()
        this.inited = true
      } else {
        let hasNewMessage = false
        let hasOthersMessage = false
        const chats = [...this.data.chats]
        for (const docChange of snapshot.docChanges) {
          switch (docChange.queueType) {
            case 'enqueue': {
              hasOthersMessage = docChange.doc._openid !== this.data.openId
              const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
              if (ind > -1) {
                if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                  chats.splice(ind, 1, {
                    ...docChange.doc,
                    tempFilePath: chats[ind].tempFilePath,
                  })
                } else chats.splice(ind, 1, docChange.doc)
              } else {
                hasNewMessage = true
                chats.push(docChange.doc)
              }
              break
            }
          }
        }
        this.setData({
          chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
        })
        if (hasOthersMessage || hasNewMessage) {
          this.scrollToBottom()
        }
      }
    },

    async onConfirmSendText(e) {
      this.try(async () => {
        if (!e.detail.value) {
          return
        }

        const { collection } = this.properties
        const db = this.db
        const _ = db.command

        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'text',
          textContent: e.detail.value,
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }
        

        this.setData({
          textInputValue: '',
          chats: [
            ...this.data.chats,
            {
              ...doc,
              _openid: this.data.openId,
              writeStatus: 'pending',
            },
          ],
        })
        var that =this;
        wx.request({
          url: 'http://34.80.21.64:8091/chatbot/listen', 
          data: {
             text: e.detail.value
          },
          header: {
              'content-type': 'application/json'
          },
          method: 'GET',
          success: function(res) {
            console.log(res.data)
            const doc2 = {
              _id: `${Math.random()}_${Date.now()}`,
              groupId: that.data.groupId,
              avatar: that.data.userInfo.avatarUrl,
              nickName: 'AITutor',
              msgType: 'text',
              textContent: res.data,
              sendTime: new Date(),
              sendTimeTS: Date.now(), // fallback
            }
            that.setData({
              textInputValue: '',
              chats: [
                ...that.data.chats,
                {
                  ...doc2,
                  _openid: '123',
                  writeStatus: 'pending',
                },
              ],
            })
          }
        })
        
        this.scrollToBottom(true)

        await db.collection(collection).add({
          data: doc,
        })

        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
      }, '发送文字失败')
    },

    async onChooseImage(e) {
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async res => {
          const { envId, collection } = this.properties
          const doc = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: this.data.userInfo.avatarUrl,
            nickName: this.data.userInfo.nickName,
            msgType: 'image',
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }

          this.setData({
            chats: [
              ...this.data.chats,
              {
                ...doc,
                _openid: this.data.openId,
                tempFilePath: res.tempFilePaths[0],
                writeStatus: 0,
              },
            ]
          })
          this.scrollToBottom(true)

          const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
            filePath: res.tempFilePaths[0],
            config: {
              env: envId,
            },
            success: res => {
              this.try(async () => {
                await this.db.collection(collection).add({
                  data: {
                    ...doc,
                    imgFileID: res.fileID,
                  },
                })
              }, '发送图片失败')
            },
            fail: e => {
              this.showError('发送图片失败', e)
            },
          })

          uploadTask.onProgressUpdate(({ progress }) => {
            this.setData({
              chats: this.data.chats.map(chat => {
                if (chat._id === doc._id) {
                  return {
                    ...chat,
                    writeStatus: progress,
                  }
                } else return chat
              })
            })
          })
        },
      })
    },

    onMessageImageTap(e) {
      wx.previewImage({
        urls: [e.target.dataset.fileid],
      })
    },

    scrollToBottom(force) {
      if (force) {
        console.log('force scroll to bottom')
        this.setData(SETDATA_SCROLL_TO_BOTTOM)
        return
      }

      this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
        this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
          if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
            console.log('should scroll to bottom')
            this.setData(SETDATA_SCROLL_TO_BOTTOM)
          }
        }).exec()
      }).exec()
    },

    async onScrollToUpper() {
      if (this.db && this.data.chats.length) {
        const { collection } = this.properties
        const _ = this.db.command
        const { data } = await this.db.collection(collection).where(this.mergeCommonCriteria({
          sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
        })).orderBy('sendTimeTS', 'desc').get()
        this.data.chats.unshift(...data.reverse())
        this.setData({
          chats: this.data.chats,
          scrollToMessage: `item-${data.length}`,
          scrollWithAnimation: false,
        })
      }
    },

    async try(fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e)
      }
    },

    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: res => {
          res.confirm && confirmCallback()
        },
      })
    },
  },

  ready() {
    global.chatroom = this
    this.initRoom()
    this.fatalRebuildCount = 0
  },
})
