//index.js
//获取应用实例
import { switchToPlay } from '../../utils/funs.js';
const app=getApp();


Page({
	data: {},
	switchToPlay,
	onShow: function () {
		this.setData({
			articles: app.data.type == 'articleEN' ? app.Funs.articleEN : app.Funs.articleZH,
			index: app.data.index,
			onPlay: app.data.onPlay
		});
	},
	onPullDownRefresh: function () {

	},

})