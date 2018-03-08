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
		playMode: null,	//+storage->once,loop,list,listLoop,random,randomInfinite
		timer: null,
		audioBackstage: null,
		modeIcon: {
			index: { 'once': 0, 'loop': 1, 'list': 2, 'listLoop': 3, 'randomList': 4, 'randomInfinite': 5, 'randomAll': 6 },
			list: ['sync_disabled', 'repeat_one', 'format_list_numbered', 'low_priority', 'wrap_text', 'format_line_spacing', 'crop_rotate'],
			mode: ['once', 'loop', 'list', 'listLoop', 'randomList', 'randomInfinite', 'randomAll'],
			name: ['单曲播放', '单曲循环', '列表顺序', '列表循环', '列表随机', '列表随机循环', '全部随机']
		},
		animation: null,
		turns: 1
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
	data.playMode = wx.getStorageSync('playMode') || 'once';
	data.audioBackstage = wx.getStorageSync('audioBackstage') || false;
	wx.setStorageSync('type', data.type);
	wx.setStorageSync('index', data.index);
	wx.setStorageSync('playMode', data.playMode);
	wx.setStorageSync('audioBackstage', data.audioBackstage);
	wx.getStorageSync('showAnchor') !== false && wx.setStorageSync('showAnchor', true);
	wx.getStorageSync('showZoom') !== false && wx.setStorageSync('showZoom', true);

	//+设置audioList
	data.audioList = getAudioList(data.type);

	data.currAudio = data.audioList[data.index];
	data.url = data.currAudio[0].url;
	//+audio
	if (data.audioBackstage) {
		data.Audio = data.Audio || wx.getBackgroundAudioManager();
	} else {
		data.Audio = data.Audio || wx.createInnerAudioContext();
	}
	if (data.Audio.src) {
		data.Audio.src == data.url || (data.url && (data.Audio.src = data.url));
	} else {
		if (!data.audioBackstage) {
			data.url && (data.Audio.src = data.url);
		}
	}
	data.Audio.title = data.currAudio[0].title;
	data.currAudio[0].author && (data.Audio.singer = data.currAudio[0].author);
	data.Audio.coverImgUrl = data.currAudio[0].image ? data.currAudio[0].image : 'https://lglong519.github.io/test/images/panda-music.jpg';
	wx.getSystemInfo({
		success: function (res) {
			data.windowHeight = res.windowHeight;
		}
	})
	if (!data.animation) {
		data.animation = wx.createAnimation({
			duration: 1000,
			timingFunction: 'linear',
			delay: 0,
			transformOrigin: '50% 50% 0',
			success: function (res) {
			}
		})
	}

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
	wx.setStorageSync('type', type);
	wx.setStorageSync('index', index);
	if (type === data.type && index === data.index) {
		data.onPlay = true;
		return;
	}
	data.Audio && data.Audio.stop();
	data.onPlay = true;
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
		data.audioBackstage && (data.Audio = wx.getBackgroundAudioManager());
		data.url && (data.Audio.src = data.url);
		data.Audio.title = data.currAudio[0].title;
		data.currAudio[0].author && (data.Audio.singer = data.currAudio[0].author);
		data.Audio.coverImgUrl = data.currAudio[0].image ? data.currAudio[0].image : 'https://lglong519.github.io/test/images/panda-music.jpg';

	}
}
const switchToPlay = e => {
	let dataset = e.currentTarget.dataset;
	let app = getApp();
	resetData(dataset.audioType, dataset.audioIndex);
	if (app.data.url) {
		app.data.Audio.play();
	}
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
		if (wx.getStorageSync('ended')) {
			app.data.Audio = wx.getBackgroundAudioManager();
			wx.removeStorageSync('ended')
			app.data.Audio.src = app.data.url;
			app.data.Audio.play()
		}
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
		}

		app.data.Audio.src && app.data.Audio.play();
	}
}
const keepPlay = app => {
	if (app.data.onPlay && app.data.url) {
		app.data.Audio.pause();
		app.data.Audio.play();
	} else {
		app.data.onPlay = false;
	}
}
const getAudioList = type => {
	switch (type) {
		case 'articleZH': return articleZH;
		case 'articleEN': return articleEN;
		case 'classical': return classical;
		default: return music
	}
}
const wxLogin = app => {
	return new Promise((resovle, reject) => {
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
										if (res.authSetting['scope.userInfo']) {
										} else {
										}
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
				if (app.data.userInfo) {
					resovle(app.data.userInfo);
				} else {
					resovle(false);
				}
			}
		})
	})

}

const showRedDot = (app) => {
	app.timer && clearInterval(app.timer);
	var i = 0, compare;
	app.timer = setInterval(() => {
		if (!app.data.url && !app.data.Audio.src) {
			app.data.Audio.pause();
			app.data.onPlay = false;
		}
		if (app.data.onPlay && app.data.url) {
			//检测播放状态下的实际播放状态，step=500ms
			if (++i % 5 == 0) {
				if (app.data.Audio.currentTime == compare) {
					app.data.Audio.play();
				} else {
					compare = app.data.Audio.currentTime;
				}
			}

			wx.showTabBarRedDot({
				index: 3
			})
		} else {
			app.data.onPlay = false;
			wx.hideTabBarRedDot({
				index: 3
			})
		}

	}, 100);
}

const setAudioEvent = (app, that) => {
	let data;
	if (that) {
		data = that.data
	}
	let appData = app.data;
	let Audio = app.data.Audio;
	Audio.onPlay(() => {
		console.log('onPlay');
		wx.hideLoading();
		wx.removeStorageSync('ended');
		if (!appData.url) { return }
		createRandomIndex();
		appData.onPlay = true;
		if (!data) { return }
		that.setData({
			onPlay: true
		});
	});

	if (!data) {
		if (!appData.audioBackstage) {
			Audio.onSeeking(() => {
				console.log('onSeeking');
				wx.showLoading();
			});
			Audio.onSeeked(() => {
				console.log('onSeeked');
				wx.hideLoading();
				if (appData.onPlay) {
					Audio.pause();
				}
				if (appData.url) {
					Audio.play();
				}
			});
		}
		Audio.onError((err) => {
			console.log('onError', err);
			Audio.pause();
		});
	}

	Audio.onPause(() => {
		console.log('onPause');
		wx.hideLoading();
		if (appData.audioBackstage) {
			appData.onPlay = false;
		}
		if (!data) { return }
		that.setData({
			onPlay: false
		});
	});
	Audio.onStop(() => {
		console.log('onStop');
		wx.hideLoading();
		wx.setStorageSync('ended', true);
		/*
		appData.onPlay = false;
		if (!data) { return }
		that.setData({
			onPlay: false
		});
		*/
	});
	Audio.onEnded(() => {
		console.log('ended');
		wx.hideLoading();
		if (data) {
			that.setData({
				onPlay: false
			});
		}
		var bool = false;
		if (appData.audioBackstage) {
			wx.setStorageSync('ended', true);
			bool = true;
		} else {
			if (data) {
				bool = false;
			} else {
				bool = true;
			}
		}
		if (bool) {
			appData.onPlay = false;
			let playMode = wx.getStorageSync('playMode');
			if (playMode == 'loop') {
				if (appData.url) {
					appData.Audio.src = appData.url;
					appData.Audio.play();
				}
			}

			if (playMode == 'list') {
				if (appData.index < appData.audioList.length - 1) {
					let newIndex = appData.index + 1;
					resetData(appData.type, newIndex);
					appData.onPlay = true;
					if (appData.url) {
						appData.Audio.play();
					}
					app.data.onShow();
				}
			}

			if (playMode == 'listLoop') {
				let newIndex
				if (appData.index < appData.audioList.length - 1) {
					newIndex = appData.index + 1;
				} else {
					newIndex = 0;
				}
				resetData(appData.type, newIndex);
				if (appData.url) {
					appData.Audio.play();
				}
				app.data.onShow();
			}

			if (playMode == 'randomList') {
				let list = wx.getStorageSync('randomList') || [];;
				list && list.shift();
				if (list.length) {
					wx.setStorageSync('randomList', list);
					resetData(appData.type, list[0]);
					if (appData.url) {
						appData.Audio.play();
					}
					app.data.onShow();
				} else {
					wx.removeStorageSync('randomList');
				}
			}

			if (playMode == 'randomInfinite') {
				let newIndex = parseInt(Math.random() * appData.audioList.length);
				resetData(appData.type, newIndex);
				if (appData.url) {
					appData.Audio.play();
				}
				app.data.onShow();
			}
			if (playMode == 'randomAll') {
				let types = ['articleZH', 'articleEN', 'classical', 'music'];
				let typeIndex = parseInt(Math.random() * types.length);
				appData.audioList = getAudioList(types[typeIndex]);
				let newIndex = parseInt(Math.random() * appData.audioList.length);
				resetData(types[typeIndex], newIndex);
				if (appData.url) {
					appData.Audio.play();
				}
				app.data.onShow();
			}
		}
	});
	if (appData.audioBackstage) {
		Audio.onPrev(() => {
			skip_previous(that, app);
		});
		Audio.onNext(() => {
			skip_next(that, app);
		});
	}
}
const skip_previous = (that, app) => {
	var newIndex;
	let appData = app.data;
	if (appData.index > 0) {
		newIndex = appData.index - 1;
	} else {
		newIndex = appData.audioList.length - 1;
	}
	_prevOrNext(that, app, newIndex);
}

const skip_next = (that, app) => {
	var newIndex;
	let appData = app.data;
	if (appData.index < appData.audioList.length - 1) {
		newIndex = appData.index + 1;
	} else {
		newIndex = 0;
	}
	_prevOrNext(that, app, newIndex);
}

function _prevOrNext(that, app, newIndex) {
	resetData(app.data.type, newIndex);
	if (app.data.url) {
		app.data.Audio.play();
	}
	if (that) {
		if (app.data.type.indexOf('article') > -1 && that.currAudio != app.data.currAudio) {
			var sectionTimes = app.data.currAudio[0].sections.map(i => i.time);
		}
		that.setData({
			currAudio: app.data.currAudio,
			type: app.data.type,
			onPlay: app.data.onPlay,
			sectionTimes: sectionTimes || [],
		});
	} else {
		app.data.onShow();
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
const createRandomIndex = () => {
	let appData = getApp().data
	if (wx.getStorageSync('playMode') == 'randomList') {
		if (!wx.getStorageSync('randomList')) {
			let count = appData.audioList.length - 1;
			let initNo = [];
			while (count >= 0) {
				initNo.unshift(count--);
			}
			initNo.splice(appData.index, 1);
			let randomList = [];
			(function getRandomNo() {
				if (initNo.length > 0) {
					randomList = randomList.concat(initNo.splice(parseInt(Math.random() * initNo.length), 1));
					getRandomNo();
				}
			})();
			randomList.unshift(appData.index);
			wx.setStorageSync('randomList', randomList);
		}
	}
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
	getCurrPart,
	skip_previous,
	skip_next,
	createRandomIndex
}