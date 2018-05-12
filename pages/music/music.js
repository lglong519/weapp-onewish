// pages/music/music.js
const app = getApp();
const PageSwiper = require('../../utils/pageSwiper');
const swiper = PageSwiper({
	prev: '/pages/index/index',
	next: '/pages/articles/articles',
	type: 'switchTab'
});

Page(Object.assign(swiper, {
	data: {
		audioType: null,
		timer: null
	},
	switchToPlay: app.Funs.switchToPlay,
	onShow () {
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
		});
		this.setData({
			audioList: wx.getStorageSync('audioType') == 'music' ? app.Funs.music : app.Funs.classical,
			type: app.data.type,
			index: app.data.index,
			onPlay: app.data.onPlay
		});
		clearInterval(this.data.timer);
		let timer = setInterval(() => {
			if (this.data.onPlay != app.data.onPlay || this.data.index != app.data.index) {
				this.setData({
					type: app.data.type,
					index: app.data.index,
					onPlay: app.data.onPlay,
					timer
				});
			}
		}, 1000);
	},
	onHide () {
		clearInterval(this.data.timer);
	},
	playControl (e) {
		let dataset = e.currentTarget.dataset;
		const initPlay = that => {
			let onPlay = that == app;
			if (that.data.onPlay) {
				app.data.Audio.pause();
				app.data.onPlay = false;
			} else {
				if (app.data.url && app.data.Audio.src != app.data.url) {
					app.data.Audio.src = app.data.url;
					app.Funs.updateAudioInfo(app.data);
				}
				app.data.Audio.play();
				onPlay = !onPlay;
			}
			this.setData({
				onPlay,
				index: app.data.index,
				type: app.data.type
			});
		};
		if (app.data.type == dataset.audioType && app.data.index == dataset.audioIndex) {
			initPlay(this);
			return;
		}
		app.Funs.resetData(dataset.audioType, dataset.audioIndex);
		initPlay(app);
	},
	onPullDownRefresh () {
		this.onShow();
		wx.stopPullDownRefresh();
	}
}));
