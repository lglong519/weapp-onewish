// pages/play/play
const app = getApp();
let appData = app.data;
let Audio = appData.Audio;
let toMinute = app.Funs.toMinute;
let toSecond = app.Funs.toSecond;
let getCurrPart = app.Funs.getCurrPart;

Page({
	data: {
		currAudio: [],//页面数据
		type: null,//判断页面类型
		onPlay: false,//判断播放器和musice和article的状态
		//page data
		sectionTimes: [],
		currPart: '',
		currentTime: 0,
		currentTimeFormat: '00:00',
		timeStamp: 0,
		duration: Audio.duration,
		durationFormat: '00:00',
		windowHeight: 0,
		id: null,
		show: false,
		hideTabBar: false,
		showAnchor: true,
		showZoom: false,
		animation: {},
		onshow: true,
		modeIcon: appData.modeIcon.list,
		modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')],
		modeName: appData.modeIcon.name,
		showToast: false,
		modeTimer: null,
		rollup: false,
		showTrans: null,
		showTransIndex: null
	},
	onLoad() {
		app.Funs.setAudioEvent(getApp(), this);
	},
	onReady() {
		console.log('ready');
		var that = this;
		var data = this.data;
		app.data.playOnload = this.onLoad;
		app.data.onShow = this.onShow;
		this.setData({
			windowHeight: appData.windowHeight
		});
		var i = 0;
		setInterval(() => {
			if (!Audio.src || !appData.url) { return }

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
					appData.animation.rotate(40 * appData.turns++).step();
					that.setData({
						animation: appData.animation.export(),
						currentTime: Audio.currentTime,
						currentTimeFormat
					})
				}
				let currPart = getCurrPart(that.data.sectionTimes, Audio.currentTime);
				if (currPart != that.data.currPart) {
					that.setData({
						currPart
					});
				}
			}
		}, 100);
	},
	playControl: app.Funs.playControl,
	playSection(e) {
		var dataset = e.currentTarget.dataset;
		if (dataset.artTime) {
			var sec = toSecond(dataset.artTime);
		}
		this.setData({
			currArt: dataset.artTime,
			onPlay: true
		});
		Audio.seek(sec || 0);
	},
	toSection() {
		this.setData({
			id: "currentPart"
		});
	},
	zoom() {
		if (this.data.hideTabBar) {
			wx.showTabBar({
				aniamtion: true
			})
			this.setData({
				hideTabBar: false
			});
		} else {
			wx.hideTabBar({
				aniamtion: true
			})
			this.setData({
				hideTabBar: true
			});
		}

	},
	onShow: function () {
		if (Audio !== getApp().data.Audio) {
			Audio = getApp().data.Audio;
		}
		if (wx.getStorageSync('hideTabBar')) {
			wx.hideTabBar({
				aniamtion: true
			})
			this.setData({
				hideTabBar: true
			});
		} else {
			wx.showTabBar({
				aniamtion: true
			})
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
		//如果是文章类型，设置章节时间列表
		if (appData.type.indexOf('article') > -1 && this.currAudio != appData.currAudio) {
			let sections = appData.currAudio[0].sections;
			if (sections) {
				var sectionTimes = sections.map(i => i.time);
			}
		}
		this.setData({
			currAudio: appData.currAudio,
			type: appData.type,
			onPlay: appData.onPlay,
			sectionTimes: sectionTimes || [],
			showAnchor: wx.getStorageSync('showAnchor') === false ? false : true,
			showZoom: wx.getStorageSync('showZoom'),
			modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')],
			onshow: true,
			hide: false
		});

		setTimeout(() => {
			this.setData({
				show: true
			});
		}, 100);
	},
	onHide() {
		this.setData({
			show: false,
			hide: true,
			onshow: false
		});
	},
	sliderChange(event) {
		var sliderValue = event.detail;
		this.setData({
			currentTimeFormat: toMinute(sliderValue.value),
			currentTime: sliderValue.value,
			timeStamp: 0
		});
		Audio.seek(sliderValue.value);
	},
	sliderChanging(event) {
		let sliderValue = event.detail;
		this.setData({
			currentTimeFormat: toMinute(sliderValue.value),
			currentTime: sliderValue.value,
			timeStamp: 1
		});
	},//后退5s
	playBackward() {
		Audio.seek(this.data.currentTime - 5);
	},
	playForward() {
		Audio.seek(this.data.currentTime + 5);
	},
	skip_previous() {
		app.Funs.skip_previous(this, app);
	},
	skip_next() {
		app.Funs.skip_next(this, app);
	},
	playModeChange() {
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
		var that = this;
		this.data.modeTimer = setTimeout(() => {
			that.setData({
				showToast: false
			});
		}, 2000);
		wx.setStorageSync('playMode', appData.modeIcon.mode[this.data.modeIndex]);
		wx.removeStorageSync('randomList');
		if (this.data.onPlay){
			app.Funs.createRandomIndex();
		}
	},
	rollup() {
		this.setData({
			rollup: !this.data.rollup
		});
	},
	showTrans(e) {
		var dataset = e.currentTarget.dataset;
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

	}
})

