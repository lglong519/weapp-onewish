// pages/music/music.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
	type:null
  },
  onShow: function () {
	  this.setData({
		  type: wx.getStorageSync('audioType')
	  });
    wx.setTabBarStyle({
		selectedColor: '#8a635c',
    });
	wx.setNavigationBarColor({
		frontColor: '#ffffff',
		backgroundColor: this.data.type == 'classical' ? '#8a635c' :'#514e5a',
		animation: {
			duration: 400,
			timingFunc: 'easeIn'
		}
	})
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

  }
})