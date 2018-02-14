// pages/articles.js
import articles from '../../libs/articles.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		articles: [],
		sectionTimes: [],
		audio: null,
		currArt: '',
		currUrl: '',
		currPart: '',
		currTime: '00:00',
		onPlay: false,
		timer: null,
		sec: 0,
		timeStamp: -1,
		duration:0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#9CE65F' })
		console.log('load');
		this.setData({
			audio: wx.createInnerAudioContext()
		});
	},
	playControl() {
		var audio = this.data.audio;
		if (!audio.src) {
			audio.src = this.data.articles[0].url;
		}
		if (this.data.onPlay) {
			clearTimeout(this.data.timer);
			this.setData({
				currArt: "",
				onPlay: false
			});
			audio.pause();
		} else {
			this.setData({
				currArt: this.data.articles[0].id,
				onPlay: true
			});
			audio.play();
			if (parseInt(audio.duration - audio.currentTime) == 0 && audio.duration != 0) {
				audio.seek(0);
			}
			audio.onPlay(() => {
				updatePlayTime(this)
			})
		}
	},
	openVoice(e) {
		var data = e.currentTarget.dataset;
		var audio = this.data.audio;
		audio.src = data.artUrl;
		console.log('e.currentTarget.dataset',data);
		var sec = 0;
		if (data.artTime) {
			sec = toSecond(data.artTime);
		}
		this.setData({
			currArt: data.artId,
			onPlay: true
		});
		audio.play();
		audio.seek(sec);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		var audio=this.data.audio;
		var index = wx.getStorageSync('artIndex') ;
		var sectionTimes = articles[index][0].sections.map(i => i.time);
		if (!this.data.currUrl || this.data.currUrl != articles[index][0].url){
			audio.stop();
			this.setData({
				onPlay: false
			});
			audio.src = this.data.currUrl;
		}
		this.setData({
			articles: articles[index],
			sectionTimes,
			currUrl: articles[index][0].url,
			duration: audio.duration
		});
		console.log(this.data.duration);
	},
	onHide: function () {
		wx.setStorageSync('onPlay', this.data.onPlay);
	},
	sliderChange(event) {
		var data = event.detail;
		var audio = this.data.audio;
		this.setData({
			currTime: toMinute(data.value),
			sec: data.value,
			timeStamp: data.value
		});
		if (this.data.onPlay) {
			audio.play();
			updatePlayTime(this);
		}
		audio.seek(data.value);
		// console.log('timeStamp', data.value);
	},
	sliderChanging(event) {
		var data = event.detail;
		clearTimeout(this.data.timer);
		this.setData({
			currTime: toMinute(data.value),
		});
	},//后退5s
	playBackward(){
		this.data.audio.seek(this.data.sec-5);
	},
	playForward(){
		this.data.audio.seek(this.data.sec +5);
	}
})

function updatePlayTime(that) {
	var data = that.data;
	// console.log('that', that);
	// console.log('currentTime', data.audio.currentTime);
	// console.log('duration', data.audio.duration);
	clearTimeout(data.timer);
	if (parseInt(data.audio.duration - data.audio.currentTime) > 0 || data.audio.currentTime == 0) {
		if (data.timeStamp != -1 && data.timeStamp == parseInt(data.audio.currentTime)) {
			data.timeStamp = -1;
		}
		if (data.timeStamp == -1) {
			// console.log('data.audio.currentTime',data.audio.currentTime)
			that.setData({
				currTime: toMinute(data.audio.currentTime),
				sec: data.audio.currentTime,
				duration: data.audio.duration,
				currPart: getCurrPart(data.sectionTimes, data.audio.currentTime)
			});
		}

		data.timer = setTimeout(function () {
			updatePlayTime(that)
		}, 1000)
	} else {
		data.audio.stop();
		that.setData({
			currTime: toMinute(data.audio.currentTime),
			sec: data.audio.currentTime,
			onPlay: false
		});
	}
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
function getCurrPart(sectionTime, currTime) {
	for (var j = 0; j < sectionTime.length; j++) {
		if (j == sectionTime.length - 1) {
			if (toSecond(currTime) >= toSecond(sectionTime[j])) {
				return sectionTime[j];
			}
		}
		if (toSecond(currTime) >= toSecond(sectionTime[j]) && toSecond(currTime) < toSecond(sectionTime[j + 1])) {
			return sectionTime[j];
		}
	}
	return '00:00'
}