// pages/play/play
const app = getApp();
const PageSwiper = require('../../utils/pageSwiper');
const swiper = PageSwiper({
	prev: '/pages/articles/articles',
	next: '/pages/account/account',
	type: 'switchTab'
});

let { data: appData, data: { Audio }, Funs: { toMinute, toSecond, getCurrPart } } = app;

Page(Object.assign(swiper, {
	data: {
		currAudio: [], // 页面数据
		type: null, // 判断页面类型
		onPlay: false, // 判断播放器和musice和article的状态
		// page data
		sectionTimes: [],
		currPart: '',
		currentTime: 0,
		currentTimeFormat: '00:00',
		timeStamp: 0,
		duration: Audio.duration,
		durationFormat: '00:00',
		windowHeight: 0,
		id: null,
		show: true,
		hideTabBar: false,
		showAnchor: true,
		showZoom: false,
		onshow: true,
		modeIcon: appData.modeIcon.list,
		modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')],
		modeName: appData.modeIcon.name,
		showToast: false,
		modeTimer: null,
		rollup: false,
		showTrans: null,
		showTransIndex: null,
		lyric: app.Funs.lyric,
		lyrics: null,
		currLyric: 0,
		lyricIndex: 'lyric0'
	},
	onLoad () {
		app.Funs.setAudioEvent(getApp(), this);
	},
	onReady () {
		console.log('ready');
		let that = this;
		let data = this.data;
		app.data.playOnload = this.onLoad;
		app.data.onShow = this.onShow;
		this.setData({
			windowHeight: appData.windowHeight
		});
		let i = 0;
		setInterval(() => {
			if (this.data.onPlay != app.data.onPlay) {
				this.setData({
					onPlay: app.data.onPlay
				});
			}
			if (!Audio.src || !appData.url) {
				return;
			}

			if (parseInt(data.duration) != parseInt(Audio.duration)) {
				that.setData({
					duration: Audio.duration,
					durationFormat: toMinute(Audio.duration)
				});
			}
			if (that.data.timeStamp) {
				return;
			}

			let currentTimeFormat = toMinute(Audio.currentTime);

			if (!appData.onPlay && data.onshow && i++ % 10 == 0) {
				if (toMinute(data.currentTime) != currentTimeFormat) {
					that.setData({
						currentTimeFormat,
						currentTime: Audio.currentTime
					});
				}
			}

			if (toMinute(data.currentTime) != currentTimeFormat) {
				if (appData.onPlay && data.onshow) {
					that.setData({
						currentTime: Audio.currentTime,
						currentTimeFormat
					});
				}
				let [currPart, eqIndex] = getCurrPart(that.data.sectionTimes, Audio.currentTime);
				let [currLyric] = getCurrPart(that.data.lyrics.lyricTimeTable, Audio.currentTime);
				currLyric == '00:00' && (currLyric = 0);
				if (currPart != that.data.currPart && currLyric != that.data.currLyric) {
					let index = that.data.lyrics.lyricTimeTable.indexOf(currLyric);
					let lyricIndex = 'lyric' + (index > 1 ? index - 2 : 0);
					that.setData({
						eqIndex,
						currPart,
						currLyric,
						lyricIndex
					});
					return;
				}
				if (currPart != that.data.currPart) {
					that.setData({
						eqIndex,
						currPart
					});
					return;
				}
				if (currLyric != that.data.currLyric) {
					let index = that.data.lyrics.lyricTimeTable.indexOf(currLyric);
					let lyricIndex = 'lyric' + (index > 1 ? index - 2 : 0);
					that.setData({
						currLyric,
						lyricIndex
					});
				}
			}
		}, 100);
	},
	playControl: app.Funs.playControl,
	playSection (e) {
		let dataset = e.currentTarget.dataset;
		if (dataset.artTime) {
			var sec = toSecond(dataset.artTime);
		}
		this.setData({
			currArt: dataset.artTime,
			onPlay: true
		});
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
			app.Funs.updateAudioInfo(app.data);
		}
		app.data.Audio.play();
		Audio.seek(sec || 0);
		// 背景播放等待300毫秒
		if (appData.audioBackstage) {
			wx.showLoading();
			setTimeout(() => {
				wx.hideLoading();
				Audio.seek(sec || 0);
			}, 300);
		}
	},
	toSection () {
		this.setData({
			id: 'currentPart'
		});
	},
	zoom () {
		if (this.data.hideTabBar) {
			wx.showTabBar({
				aniamtion: true
			});
			this.setData({
				hideTabBar: false
			});
		} else {
			wx.hideTabBar({
				aniamtion: true
			});
			this.setData({
				hideTabBar: true
			});
		}

	},
	onShow () {
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: appData.type == 'music' || appData.type == 'classical' ? '#514e5a' : '#9CE65F',
			animation: {
				duration: 400,
				timingFunc: 'easeIn'
			}
		});
		if (Audio !== getApp().data.Audio) {
			Audio = getApp().data.Audio;
		}
		if (wx.getStorageSync('hideTabBar')) {
			wx.hideTabBar({
				aniamtion: true
			});
			this.setData({
				hideTabBar: true
			});
		} else {
			wx.showTabBar({
				aniamtion: true
			});
			this.setData({
				hideTabBar: false
			});
		}
		wx.setTabBarStyle({
			selectedColor: '#83c44e',
			// backgroundColor: appData.url ? '#C6C6C6' : '',
			borderStyle: appData.url ? 'white' : ''
		});
		console.log('play onshow');
		// 如果是文章类型，设置章节时间列表
		if (appData.type.indexOf('article') > -1 && this.currAudio != appData.currAudio) {
			let sections = appData.currAudio[0].sections;
			if (sections) {
				var sectionTimes = sections.map(i => i.time);
			}
		}
		let lyrics = app.Funs.lyricFormat(this.data.lyric[appData.currAudio[0].id]);

		this.setData({
			currAudio: appData.currAudio,
			type: appData.type,
			onPlay: appData.onPlay,
			sectionTimes: sectionTimes || [],
			showAnchor: wx.getStorageSync('showAnchor') !== false,
			showZoom: wx.getStorageSync('showZoom'),
			modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')],
			onshow: true,
			lyrics
		});

	},
	onHide () {
		this.setData({
			onshow: false
		});
	},
	sliderChange (event) {
		let sliderValue = event.detail;
		this.setData({
			currentTimeFormat: toMinute(sliderValue.value),
			currentTime: sliderValue.value,
			timeStamp: 0
		});
		Audio.seek(sliderValue.value);
	},
	sliderChanging (event) {
		let sliderValue = event.detail;
		this.setData({
			currentTimeFormat: toMinute(sliderValue.value),
			currentTime: sliderValue.value,
			timeStamp: 1
		});
	}, // 后退5s
	playBackward () {
		Audio.seek(this.data.currentTime - 5);
	},
	playForward () {
		Audio.seek(this.data.currentTime + 5);
	},
	skip_previous () {
		app.Funs.skip_previous(this, app);
	},
	skip_next () {
		app.Funs.skip_next(this, app);
	},
	playModeChange () {
		this.data.modeTimer && clearTimeout(this.data.modeTimer);
		if (this.data.modeIndex < appData.modeIcon.list.length - 1) {
			this.data.modeIndex++;
		} else {
			this.data.modeIndex = 0;
		}
		this.setData({
			modeIndex: this.data.modeIndex,
			showToast: true
		});
		let that = this;
		this.data.modeTimer = setTimeout(() => {
			that.setData({
				showToast: false
			});
		}, 2000);
		wx.setStorageSync('playMode', appData.modeIcon.mode[this.data.modeIndex]);
		wx.removeStorageSync('randomList');
		if (this.data.onPlay) {
			app.Funs.createRandomIndex();
		}
	},
	rollup () {
		this.setData({
			rollup: !this.data.rollup
		});
	},
	showTrans (e) {
		let dataset = e.currentTarget.dataset;
		if (this.data.showTransIndex == dataset.showTransIndex) {
			this.setData({
				showTrans: this.data.currAudio[0].title,
				showTransIndex: -1
			});
		} else {
			this.setData({
				showTrans: this.data.currAudio[0].title,
				showTransIndex: dataset.showTransIndex
			});
		}

	},
	onShareAppMessage () {}
}));
