import articleZH from '../libs/articleZH.js';
import articleEN from '../libs/articleEN.js';
import classical from '../libs/classical.js';
import music from '../libs/music.js';

//定义全局变量
const globalData = () => {
	return {
		type: null,	//*storage->articleZH/articleEN/classical/music
		index: null,//*storage
		audioList: null,//*
		url: null,//*
		Audio: null,//*
		currAudio: null,
		onPlay: false,//判断并设置audio状态，所有页面以app为准，page内onPlay自动跟随
		playMode: wx.getStorageSync('playMode') || 'once',	//+storage->once,loop,list,listLoop,random,randomInfinite
		timer: null
	}
}

/**
 * @description initialize app.data
 * @param {*} app 
 */
const init = (app) => {
	let data = app.data || (app.data = globalData());

	data.type = wx.getStorageSync('type') || 'articleZH';
	data.index = wx.getStorageSync('index') || 0;
	wx.setStorageSync('type', data.type);
	wx.setStorageSync('index', data.index);

	//+设置audioList
	data.audioList = getAudioList(data.type);
	// console.log('list', data.audioList);

	data.currAudio = data.audioList[data.index];
	data.url = data.currAudio[0].url;
	//+audio
	data.Audio = data.Audio || wx.createInnerAudioContext();
	if (data.Audio.src) {
		data.Audio.src == data.url || (data.Audio.src = data.url);
	} else {
		data.Audio.src = data.url
	}
	wx.getSystemInfo({
		success: function (res) {
			data.windowHeight = res.windowHeight;
		}
	})
	setAudioEvent(app);
	wxLogin(app);
	keepPlay(app);
	showRedDot(app);
	console.log('init');
}

//重置所有数据
const resetData = (type, index) => {
	const app = getApp();
	let data = app.data;
	data.Audio && data.Audio.stop();
	wx.setStorageSync('type', type);
	wx.setStorageSync('index', index);
	data.onPlay = true;

	if (type === data.type && index === data.index) {
		return;
	}
	if (type !== data.type) {
		// clearData(app);
		data.type = type;
		data.audioList = getAudioList(type);
		_();
	} else {
		//如果只是索引改了
		if (index !== data.index) {
			_();
		}
	}
	function _() {
		data.index = index;
		data.currAudio = data.audioList[index];
		data.url = data.currAudio[0].url;
		data.Audio.src != data.url && (data.Audio.src = data.url);
	}
}
const switchToPlay = e => {
	let dataset = e.currentTarget.dataset;
	let app = getApp();
	resetData(dataset.audioType, dataset.audioIndex);
	app.data.Audio.play();
	wx.switchTab({
		url: '/pages/play/play',
	})
}
const playControl = () => {
	let app = getApp();
	if (app.data.onPlay) {
		app.data.Audio.pause();
		app.data.onPlay = false;
	} else {
		wx.showLoading({
			title: '音频加载中...'
		});
		app.data.Audio.play();
	}
}

const keepPlay = (app) => {
	if (app.data.onPlay) {
		app.data.Audio.pause();
		app.data.Audio.play();
	}
}
const getAudioList = (type) => {
	switch (type) {
		case 'articleZH': return articleZH;
		case 'articleEN': return articleEN;
		case 'classical': return classical;
		default: return music
	}
}
const wxLogin = app => {
	wx.getUserInfo({
		success: res => {
			app.data.userInfo = res.userInfo
			if (app.userInfoReadyCallback) {
				app.userInfoReadyCallback(res)
			}
		},
		complete(res) {
			if (/deny|fail/g.test(res.errMsg)) {
				wx.removeStorageSync('userInfo');
				wx.showModal({
					content: '当前帐号未登录，\n为了更好的使用体验请登录，\n是否使用微信登录？',
					complete(res) {
						if (res.confirm) {
							wx.openSetting({
								complete(res) {
									console.log(res);
								}
							});
						}
						if (res.cancel) {
							wx.showToast({
								title: '再会',
								icon: 'success',
								duration: 600
							})
						}
					}
				});
			} else {
				wx.setStorageSync('userInfo', true);
			}
		}
	})
}
const showRedDot = (app) => {
	app.timer && clearInterval(app.timer);
	app.timer = setInterval(() => {
		if (app.data.onPlay) {
			wx.showTabBarRedDot({
				index: 3
			})
		} else {
			wx.hideTabBarRedDot({
				index: 3
			})
		}
	}, 1000);
}

const setAudioEvent = (app, that) => {
	let data;
	if (that) {
		data = that.data
	}
	let appData = app.data;
	let Audio = app.data.Audio;
	let pause = () => {
		wx.hideLoading();
		if (!data) { return }
		that.setData({
			onPlay: false
		});
	}
	Audio.onPlay(() => {
		console.log('onPlay');
		appData.onPlay = true;
		wx.hideLoading();
		if (!data) { return }
		that.setData({
			onPlay: true
		});
	});

	if (!data) {
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
			} else {
				Audio.play();
			}
		});
		Audio.onError((err) => {
			console.log('onError', err);
			Audio.pause();
			wx.showModal({
				content: err.errMsg,
				showCancel: false
			});
		});
	}

	Audio.onPause(() => {
		wx.hideLoading();
		if (!data) { return }
		that.setData({
			onPlay: false
		});
	});
	Audio.onStop(pause);
	Audio.onEnded(pause);

	if (data) {
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
						currPart
					});
				}
			}
		});
	}
}
const toMinute = myTime => {
	var minutes = parseInt(myTime / 60);
	var seconds = parseInt(myTime - 60 * minutes);
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;
	return minutes + ':' + seconds;
}
const toSecond = myTime => {
	var reg = /[:：]/;
	if (!reg.test(myTime)) {
		return myTime;
	}
	var arr = myTime.split(reg);
	return arr[0] * 60 + arr[1] * 1;
}
const getCurrPart = (sectionTime, currentTime) => {
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
module.exports = {
	articleZH,
	articleEN,
	classical,
	music,
	init,
	keepPlay,
	switchToPlay,
	wxLogin,
	playControl,
	resetData,
	setAudioEvent,
	toMinute,
	toSecond,
	getCurrPart
}