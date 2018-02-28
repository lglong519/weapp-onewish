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
		duration: 0,
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
		modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')]
	},
	onLoad() {
		app.Funs.setAudioEvent(app, this);
		
	},
	onReady() {
		console.log('ready');
		app.data.playOnload = this.onLoad;
		this.setData({
			windowHeight: appData.windowHeight
		});
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
			var sectionTimes = appData.currAudio[0].sections.map(i => i.time);
		}
		this.setData({
			currAudio: appData.currAudio,
			type: appData.type,
			onPlay: appData.onPlay,
			sectionTimes: sectionTimes || [],
			showAnchor: wx.getStorageSync('showAnchor') === false ? false : true,
			showZoom: wx.getStorageSync('showZoom'),
			modeIndex: appData.modeIcon.index[wx.getStorageSync('playMode')],
			onshow: true
		});
		this.setData({
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
	playModeChange(){
		if (this.data.modeIndex < appData.modeIcon.list.length-1){
			this.data.modeIndex++;
		}else{
			this.data.modeIndex=0;
		}
		this.setData({
			modeIndex: this.data.modeIndex
		});
		wx.hideToast();
		wx.showToast({
			title: appData.modeIcon.name[this.data.modeIndex],
			icon: 'none',
			duration: 2000
		})
		wx.setStorageSync('playMode', appData.modeIcon.mode[this.data.modeIndex]);
	}
})
