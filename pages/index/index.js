//index.js
const app = getApp();

Page({
	data: {
		articles: [],
		libs: {
			articleEN: app.Funs.articleEN,
			articleZH: app.Funs.articleZH,
			classical: app.Funs.classical,
			music: app.Funs.music
		},
		recentViews: []
	},
	toArticles(e) {
		let dataset = e.currentTarget.dataset;
		wx.setStorageSync('audioType', dataset.type);
		wx.switchTab({
			url: '/pages/articles/articles',
		})
	},
	toMusic(e) {
		let dataset = e.currentTarget.dataset;
		wx.setStorageSync('audioType', dataset.type);
		wx.switchTab({
			url: '/pages/music/music',
		})
	},
	onShow: function () {
		wx.setTabBarStyle({
			selectedColor: '#73A0C2',
		});
		let recentViews = wx.getStorageSync('recentViews').reverse();
		recentViews.forEach((item, i) => {
			recentViews[i] = JSON.parse(item);
		})
		this.setData({
			recentViews
		});
	},
	onShareAppMessage() {

	},
	playControl(e) {
		let dataset = e.currentTarget.dataset;
		app.Funs.resetData(dataset.audioType, dataset.audioIndex);
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
		}
		app.data.Audio.play();
		this.onShow();
	}
})