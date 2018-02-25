// pages/music/music.js
const app = getApp();

Page({
  data: {
    audioType: null
  },
  switchToPlay: app.Funs.switchToPlay,
  onShow: function () {
    this.setData({
      audioType: wx.getStorageSync('audioType') == 'music' && 'music' || 'classical'
    });
    wx.setTabBarStyle({
      selectedColor: '#8a635c',
    });
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: wx.getStorageSync('audioType') == 'music' ? '#514e5a' : '#8a635c',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
    this.setData({
      audioList: wx.getStorageSync('audioType') == 'music' ? app.Funs.music : app.Funs.classical,
      type: app.data.type,
      index: app.data.index,
      onPlay: app.data.onPlay
    });
  },
  playControl(e) {
    console.log('playControl-1');

    let dataset = e.currentTarget.dataset;
    if (app.data.type == dataset.audioType && app.data.index == dataset.audioIndex) {
      if (this.data.onPlay) {
        app.data.Audio.pause();
        app.data.onPlay = false;
        this.setData({
          onPlay: false,
        });
      } else {
        app.data.Audio.play();
        this.setData({
          onPlay: true,
        });
      }
      return;
    }
    console.log('playControl-2');

    app.Funs.resetData(dataset.audioType, dataset.audioIndex);
    if (app.data.onPlay) {
      app.data.Audio.play();
      this.setData({
        onPlay: true,
        index: app.data.index
      });
    } else {
      app.data.Audio.pause();
      app.data.onPlay = false;
      this.setData({
        onPlay: false,
        index: app.data.index
      });
    }

  }
})