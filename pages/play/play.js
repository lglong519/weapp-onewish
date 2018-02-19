// pages/play/play
const app = getApp();
const appData = app.data;
const Audio = appData.Audio;

Page({

	/**
	 * 页面的初始数据
	 */
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
		durationFormat: '00:00'
	},
	onLoad() {
		setAudioEvent(this);
	},
	playControl() {
		if (appData.onPlay) {
			Audio.pause();
			appData.onPlay = false;
		} else {
			wx.showLoading({
				title: '音频加载中...'
			});
			Audio.play();
		}
	},
	playSection(e) {
		var dataset = e.currentTarget.dataset;
		if (dataset.artTime) {
			var sec = toSecond(dataset.artTime);
		}
		this.setData({
			currArt: dataset.artTime,
			onPlay: true
		});
		if (sec) {
			Audio.seek(sec);
		}
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		console.log('play onshow');
		//如果是文章类型，设置章节时间列表
		if (appData.type.indexOf('article') > -1 && this.currAudio != appData.currAudio) {
			var sectionTimes = appData.currAudio[0].sections.map(i => i.time);
		}
		app.Funs.keepPlay(app);
		this.setData({
			currAudio: appData.currAudio,
			type: appData.type,
			onPlay: appData.onPlay,
			sectionTimes: sectionTimes || []
		});
	},
	onHide: function () {
		appData.onPlay = this.data.onPlay;
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
	}
})
//
function setAudioEvent(that) {
	let data = that.data;
	let pause = () => {
		appData.onPlay = false;
		wx.hideLoading();
		that.setData({
			onPlay: false
		});
	}
	Audio.onTimeUpdate(() => {
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
		if (toMinute(data.currentTime) != currentTimeFormat) {
			that.setData({
				currentTime: Audio.currentTime,
				currentTimeFormat
			});
			let currPart = getCurrPart(that.data.sectionTimes, Audio.currentTime);
			if (currPart != that.data.currPart) {
				that.setData({
					currPart,
				});
			}
		}
	});
	Audio.onPlay(() => {
		console.log('onPlay');
		appData.onPlay = true;
		that.setData({
			onPlay: true
		});
		wx.hideLoading();
	});
	Audio.onSeeking(() => {
		console.log('onSeeking');
		wx.showLoading();
	});
	Audio.onSeeked(() => {
		console.log('onSeeked');
		wx.hideLoading();
		if (appData.onPlay) {
			Audio.pause();
			Audio.play();
		}
	});
	Audio.onError((err) => {
		console.log('onError', err);
		pause();
		wx.showModal({
			content: err.errMsg,
			showCancel: false
		});
	});
	Audio.onPause(() => {
		wx.hideLoading();
		that.setData({
			onPlay: false
		});
	});
	Audio.onStop(pause);
	Audio.onEnded(pause);
}
function toMinute(myTime) {
	var minutes = parseInt(myTime / 60);
	var seconds = parseInt(myTime - 60 * minutes);
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;
	return minutes + ':' + seconds;
}
function toSecond(myTime) {
	var reg = /[:：]/;
	if (!reg.test(myTime)) {
		return myTime;
	}
	var arr = myTime.split(reg);
	return arr[0] * 60 + arr[1] * 1;
}
function getCurrPart(sectionTime, currentTime) {
	for (var j = 0; j < sectionTime.length; j++) {
		if (j == sectionTime.length - 1) {
			if (toSecond(currentTime) >= toSecond(sectionTime[j])) {
				return sectionTime[j];
			}
		}
		if (toSecond(currentTime) >= toSecond(sectionTime[j]) && toSecond(currentTime) < toSecond(sectionTime[j + 1])) {
			return sectionTime[j];
		}
	}
	return '00:00'
}
function playAudio() {
	if (appData.onPlay) {
		if (Audio.paused) {
			wx.showLoading({
				title: '音频加载中...'
			});
		}
		Audio.play();
	}
}
