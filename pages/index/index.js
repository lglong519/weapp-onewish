// index.js
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
		recentViews: [],
		itemList: [
			[
				{
					bindtap: 'toArticles',
					dataType: 'articleZH',
					className: 'text-orange-3',
					icon: 'import_contacts',
					text: '文章'
				},
				{
					bindtap: 'toMusic',
					dataType: 'music',
					className: 'text-green-0',
					icon: 'audiotrack',
					text: '歌单'
				},
				{
					bindtap: 'toMusic',
					dataType: 'classical',
					className: 'text-blue-1',
					icon: 'straighten',
					text: '轻音乐'
				},
				{
					bindtap: 'toArticles',
					dataType: 'articleEN',
					className: 'text-red-0',
					icon: 'sort_by_alpha',
					text: 'Articles'
				}
			]
		]
	},
	onLoad () {
		updateItems.bind(this)(0);
	},
	toArticles (e) {
		let dataset = e.currentTarget.dataset;
		wx.setStorageSync('audioType', dataset.type);
		wx.switchTab({
			url: '/pages/articles/articles',
		});
	},
	toMusic (e) {
		let dataset = e.currentTarget.dataset;
		wx.setStorageSync('audioType', dataset.type);
		wx.switchTab({
			url: '/pages/music/music',
		});
	},
	onShow () {
		wx.setTabBarStyle({
			selectedColor: '#73A0C2',
		});
		let recentViews = wx.getStorageSync('recentViews').reverse().slice(0, 10);
		recentViews.forEach((item, i) => {
			recentViews[i] = JSON.parse(item);
		});
		let random = [];
		for (let i = 0; i < 10; i++) {
			random.push(parseInt(Math.random() * 10));
		}
		this.setData({
			recentViews,
			hideRecentViews: wx.getStorageSync('hideRecentViews'),
			visibility_off: wx.getStorageSync('hideRecentViews'),
			random
		});
	},
	onShareAppMessage () {

	},
	playControl (e) {
		let dataset = e.currentTarget.dataset;
		app.Funs.resetData(dataset.audioType, dataset.audioIndex);
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
			app.Funs.updateAudioInfo(app.data);
		}
		app.data.Audio.play();
		this.onShow();
	},
	onPullDownRefresh () {
		this.onShow();
		wx.stopPullDownRefresh();
	},
	hideRecentViews () {
		let that = this;
		that.setData({
			visibility_off: true
		});
		wx.showModal({
			title: '提示',
			content: '是否关闭最近浏览？',
			success (res) {
				if (res.confirm) {
					setTimeout(() => {
						that.setData({
							hideRecentViews: true
						});
						wx.setStorageSync('hideRecentViews', true);
					}, 1200);
				} else if (res.cancel) {
					that.setData({
						visibility_off: false
					});
				}
			}
		});
	},
	swiperChange (e) {
		let { current } = e.detail;
		updateItems.bind(this)(current);
	}
});

function updateItems (index) {
	let pre = index - 1;
	let next = index + 1;
	if (pre < 0) {
		pre = 2;
	}
	if (next > 2) {
		pre = 0;
	}
	let { itemList } = this.data;
	itemList[next] = itemList[index].slice(1);
	itemList[next].push(itemList[index][0]);
	itemList[pre] = itemList[index].slice(0, -1);
	itemList[pre].unshift(itemList[index].slice(-1)[0]);
	this.setData({
		itemList
	});
}
