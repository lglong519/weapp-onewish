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
		let recentViews = wx.getStorageSync('recentViews').reverse().slice(0, 10);
		recentViews.forEach((item, i) => {
			recentViews[i] = JSON.parse(item);
		});
		let random=[];
		for(var i=0;i<10;i++){
			random.push(parseInt(Math.random()*10));
		}
		this.setData({
			recentViews,
			hideRecentViews: wx.getStorageSync('hideRecentViews'),
			visibility_off: wx.getStorageSync('hideRecentViews'),
			random
		});
	},
	onShareAppMessage() {

	},
	playControl(e) {
		let dataset = e.currentTarget.dataset;
		app.Funs.resetData(dataset.audioType, dataset.audioIndex);
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
			app.Funs.updateAudioInfo(app.data);
		}
		app.data.Audio.play();
		this.onShow();
	},
	onPullDownRefresh: function () {
		this.onShow();
		wx.stopPullDownRefresh()
	},
	hideRecentViews(){
		let that=this;
		that.setData({
			visibility_off: true
		});
		wx.showModal({
			title: '提示',
			content: '是否关闭最近浏览？',
			success: function (res) {
				if (res.confirm) {
					setTimeout(()=>{
						that.setData({
							hideRecentViews: true
						});
						wx.setStorageSync('hideRecentViews', true)
					},1200)
				} else if (res.cancel) {
					that.setData({
						visibility_off: false
					});
				}
			}
		})
		
	}
})