// pages/play/play
const app = getApp();
const appData = app.data;
const Audio = appData.Audio;

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currAudio: [],
		sectionTimes: [],
		type: null,
		currArt: '',
		url: '',
		currPart: '',
		currentTime: '00:00',
		currentTimeFormat: '00:00',
		onPlay: false,
		timer: null,
		sec: 0,
		timeStamp: -1,
		duration: 0,
		durationFormat: '00:00'
	},
	onLoad() {
		console.log('play onLoad');
		setAudioEvent(this);
	},
	playControl() {
		if (this.data.onPlay) {
			clearTimeout(this.data.timer);
			this.setData({
				onPlay: false
			});
			Audio.pause();
		} else {
			this.setData({
				onPlay: true
			});
			Audio.play();
			if (parseInt(Audio.duration - Audio.currentTime) == 0 && Audio.duration != 0) {
				Audio.seek(0);
			}

		}
	},
	openVoice(e) {
		var dataset = e.currentTarget.dataset;
		Audio.src = dataset.artUrl;
		console.log('e.currentTarget.dataset', dataset);
		var sec = 0;
		if (dataset.artTime) {
			sec = toSecond(dataset.artTime);
		}
		this.setData({
			currArt: dataset.artId,
			onPlay: true
		});
		Audio.play();
		Audio.seek(sec);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (appData.type.indexOf('article') > -1) {
			var sectionTimes = appData.currAudio[0].sections.map(i => i.time);
		}
		if (appData.onPlay) {
			playAudio(this)
		}
		this.setData({
			currAudio: appData.currAudio,
			type: appData.type,
			onPlay: appData.onPlay,
			sectionTimes: sectionTimes || [],
			url: appData.url
		});

		console.log(this.data.duration);
	},
	onHide: function () {
		wx.setStorageSync('onPlay', this.data.onPlay);
	},
	sliderChange(event) {
		var sliderValue = event.detail;
		this.setData({
			currentTime: toMinute(sliderValue.value),
			sec: sliderValue.value,
			timeStamp: sliderValue.value
		});
		if (this.data.onPlay) {
			Audio.play();
			// updatePlayTime(this);
		}
		Audio.seek(sliderValue.value);
		// console.log('timeStamp', data.value);
	},
	sliderChanging(event) {
		var sliderValue = event.detail;
		clearTimeout(this.data.timer);
		this.setData({
			currentTime: toMinute(sliderValue.value),
		});
	},//后退5s
	playBackward() {
		Audio.seek(this.data.sec - 5);
	},
	playForward() {
		Audio.seek(this.data.sec + 5);
	}
})
//
function setAudioEvent(that) {
	let data = that.data;
	let pause = () => {
		console.log('onPause');

		that.setData({
			onPlay: false
		});
	}

	Audio.onTimeUpdate(() => {
		let currentTimeFormat = toMinute(Audio.currentTime);
		if (toMinute(data.currentTime) != currentTimeFormat) {
			that.setData({
				currentTime: Audio.currentTime,
				currentTimeFormat
			});
		}
		if (parseInt(data.duration) != parseInt(Audio.duration)) {
			that.setData({
				duration: Audio.duration,
				durationFormat: toMinute(Audio.duration)
			});
		}
	});
	Audio.onPlay(() => {
		console.log('onPlay');
		wx.hideLoading();
	});
	Audio.onWaiting(() => {
		console.log('onWaiting');
		wx.showLoading();
	});
	Audio.onSeeking(() => {
		console.log('onSeeking');
		wx.showLoading();
	});
	Audio.onSeeked(() => {
		console.log('onSeeked');
		wx.hideLoading();
	});
	Audio.onError((err) => {
		console.log('onError', err);
		wx.showLoading({
			title: err.errMsg
		});
	});
	Audio.onPause(pause);
	Audio.onStop(pause);
	Audio.onEnded(pause);


	/*
	clearTimeout(appData.timer);
	if (parseInt(Audio.duration - Audio.currentTime) > 0 || Audio.currentTime == 0) {
		if (data.timeStamp != -1 && data.timeStamp == parseInt(Audio.currentTime)) {
			data.timeStamp = -1;
		}
		if (data.timeStamp == -1) {
			// console.log('Audio.currentTime',Audio.currentTime)
			that.setData({
				currentTime: toMinute(Audio.currentTime),
				sec: Audio.currentTime,
				duration: Audio.duration,
				currPart: getCurrPart(data.sectionTimes, Audio.currentTime)
			});
		}

		data.timer = setTimeout(function () {
			// updatePlayTime(that)
		}, 1000)
	} else {
		Audio.stop();
		that.setData({
			currentTime: toMinute(Audio.currentTime),
			sec: Audio.currentTime,
			onPlay: false
		});
	}
	*/
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
	// console.log('arr',arr);
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
function playAudio(self) {
	wx.showLoading({
		title: '音频加载中...'
	});
	Audio.play();
	if (parseInt(Audio.duration - Audio.currentTime) == 0 && Audio.duration != 0) {
		Audio.seek(0);
	}
}
function pauseAudio() {
	Audio.pause();
}