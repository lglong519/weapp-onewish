//index.js
//获取应用实例
const app = getApp();
import articles from '../../libs/articles.js'

Page({

	data: {
		articles: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#E7B68A' })
		this.setData({
			articles
		});
	},
	toArticle(event){
		var index = event.currentTarget.dataset.artIndex
		wx.setStorageSync('artIndex', index);
		wx.switchTab({
			url: '/pages/play/play',
		})
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
		if (wx.getStorageSync('onPlay')){
			this.setData({
				index: wx.getStorageSync('artIndex') || 0
			});
		}else{
			this.setData({
				index: ''
			});
		}
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
	openVoice() {

	}
})