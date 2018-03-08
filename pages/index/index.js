//index.js
const app = getApp();

Page({
	data: {
		articles: []
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
	},
	onShareAppMessage(){
		
	}
})