//index.js
import { switchToPlay } from '../../utils/funs.js';
const app = getApp();

Page({
	data: {},
	switchToPlay,
	onShow: function () {
		wx.setTabBarStyle({
			selectedColor: '#FFB13F',
			backgroundColor: '#EBE1D5',
			borderStyle: 'white'
		})
		this.setData({
			articles: wx.getStorageSync('audioType') == 'articleEN' ? app.Funs.articleEN : app.Funs.articleZH,
			type: app.data.type,
			index: app.data.index,
			onPlay: app.data.onPlay
		});
	},
	onPullDownRefresh: function () {
		this.onShow();
		wx.stopPullDownRefresh()
	}

})