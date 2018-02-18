//index.js
//获取应用实例
import { switchToPlay } from '../../utils/funs.js';
import articles from '../../libs/articleZH.js'


Page({
	data: {},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			articles
		});
	},
	switchToPlay,
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (wx.getStorageSync('onPlay')) {
			this.setData({
				index: wx.getStorageSync('index') || 0
			});
		} else {
			this.setData({
				index: ''
			});
		}
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

})