import articleZH from '../libs/articleZH';
import articleEN from '../libs/articleEN';
import classical from '../libs/classical';
import music from '../libs/music';
import lyric from '../libs/lyric';

/* eslint no-use-before-define:0 */
// 定义全局变量
const globalData = () => ({
	type: null,	// storage->articleZH/articleEN/classical/music
	index: null, //* storage
	audioList: null, //* *
	url: null, //* *
	Audio: null, //* *
	currAudio: null,
	onPlay: false, // 判断并设置audio状态，所有页面以app为准，page内onPlay自动跟随
	playMode: null,	// +storage->once,loop,list,listLoop,random,randomInfinite
	timer: null,
	audioBackstage: null,
	modeIcon: {
		index: { 'once': 0, 'loop': 1, 'list': 2, 'listLoop': 3, 'randomList': 4, 'randomInfinite': 5, 'randomAll': 6 },
		list: ['sync_disabled', 'repeat_one', 'format_list_numbered', 'low_priority', 'wrap_text', 'format_line_spacing', 'crop_rotate'],
		mode: ['once', 'loop', 'list', 'listLoop', 'randomList', 'randomInfinite', 'randomAll'],
		name: ['单曲播放', '单曲循环', '列表顺序', '列表循环', '列表随机', '列表随机循环', '全部随机']
	}
});

/**
 * @description initialize app.data
 * @param {Object} app main
 */
const init = app => {
	let data = app.data || (app.data = globalData());

	data.type = wx.getStorageSync('type') || 'articleZH';
	data.index = wx.getStorageSync('index') || 0;
	data.playMode = wx.getStorageSync('playMode') || 'once';
	data.audioBackstage = wx.getStorageSync('audioBackstage') !== false || true;
	wx.setStorageSync('type', data.type);
	wx.setStorageSync('index', data.index);
	wx.setStorageSync('playMode', data.playMode);
	wx.setStorageSync('audioBackstage', data.audioBackstage);
	wx.getStorageSync('showAnchor') !== false && wx.setStorageSync('showAnchor', true);
	wx.getStorageSync('showZoom') !== false && wx.setStorageSync('showZoom', true);
	wx.getStorageSync('hideRecentViews') !== true && wx.setStorageSync('hideRecentViews', false);
	wx.getStorageSync('recentViews') || wx.setStorageSync('recentViews', []);

	// +设置audioList
	data.audioList = getAudioList(data.type);

	data.currAudio = data.audioList[data.index];
	data.url = data.currAudio[0].url;
	// +audio
	if (data.audioBackstage) {
		data.Audio = data.Audio || wx.getBackgroundAudioManager();
	} else {
		data.Audio = data.Audio || wx.createInnerAudioContext();
	}
	if (data.Audio.src) {
		data.Audio.src == data.url || data.url && (data.Audio.src = data.url);
	} else
	// 避免第一次加载 audioBackstage 自动播放
	if (!data.audioBackstage) {
		data.url && (data.Audio.src = data.url);
	}

	updateAudioInfo(data);
	wx.getSystemInfo({
		success(res) {
			data.windowHeight = res.windowHeight;
		}
	});

	setAudioEvent(app);
	keepPlay(app);
	showRedDot(app);
	if (wx.getStorageSync('hideTabBar')) {
		wx.hideTabBar({
			aniamtion: true
		});
	} else {
		wx.showTabBar({
			aniamtion: true
		});
	}
	console.log('init');
};

// 重置所有数据
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
		_recentView(type, index);
		_();
	} else
	// 如果只是索引改了
	if (index !== data.index) {
		_recentView(type, index);
		_();
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
};
function _recentView(type, index) {
	let views = 1;
	let record = JSON.stringify({ type, index });
	let recentViews = JSON.parse(JSON.stringify(wx.getStorageSync('recentViews')).replace(/,\\"views\\":\d+/g, ''));
	let ifRecord = recentViews.indexOf(record);
	recentViews = wx.getStorageSync('recentViews');
	if (ifRecord > -1) {
		let item = JSON.parse(recentViews.splice(ifRecord, 1));
		views = ++item.views || 1;
	}
	record = JSON.stringify({ type, index, views });
	recentViews.push(record);
	wx.setStorageSync('recentViews', recentViews);
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
	});
};
// const playControl = () => {
// 箭头函数 上下文 根据定义环境而定，与执行环境无关
function playControl() {
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
			wx.removeStorageSync('ended');
			app.data.Audio.src = app.data.url;
			updateAudioInfo(app.data);
			app.data.Audio.play();
		}
		if (app.data.url && app.data.Audio.src != app.data.url) {
			app.data.Audio.src = app.data.url;
			updateAudioInfo(app.data);
		}
		app.data.Audio.src && app.data.Audio.play();
	}
	if (this.data.onPlay != app.data.onPlay) {
		this.setData({
			onPlay: app.data.onPlay
		});
	}
}
const keepPlay = app => {
	if (app.data.onPlay && app.data.url) {
		app.data.Audio.pause();
		app.data.Audio.play();
	} else {
		app.data.onPlay = false;
	}
};
const getAudioList = type => {
	switch (type) {
		case 'articleZH': return articleZH;
		case 'articleEN': return articleEN;
		case 'classical': return classical;
		default: return music;
	}
};
const wxLogin = app => new Promise((resovle, reject) => {
	wx.showLoading({
		title: '正在登录',
	});
	wx.getUserInfo({
		success: res => {
			app.data.userInfo = res.userInfo;
			if (app.userInfoReadyCallback) {
				app.userInfoReadyCallback(res);
			}
		},
		complete(res) {
			wx.hideLoading();
			if (/deny|fail/g.test(res.errMsg)) {
				wx.removeStorageSync('userInfo');
				wx.showModal({
					content: '当前帐号未登录，\n为了更好的使用体验请登录，\n是否使用微信登录？',
					complete(res) {
						if (res.confirm) {
							wx.openSetting({
								complete(res) {
									if (res.authSetting['scope.userInfo']) {
										//
									} else {
										//
									}
								}
							});
						}
						if (res.cancel) {
							wx.showToast({
								title: '再会',
								icon: 'success',
								duration: 600
							});
						}
					}
				});
			} else {
				wx.setStorageSync('userInfo', true);
			}
			if (app.data.userInfo) {
				wx.showToast({
					title: '登录成功',
					icon: 'success',
					duaration: 1500
				});
				resovle(app.data.userInfo);
			} else {
				reject(false);
			}
		}
	});
});

const showRedDot = app => {
	app.timer && clearInterval(app.timer);
	let i = 0,
		compare;
	app.timer = setInterval(() => {
		if (!app.data.url && !app.data.Audio.src) {
			app.data.Audio.pause();
			app.data.onPlay = false;
		}
		if (app.data.onPlay && app.data.url) {
			// 检测播放状态下的实际播放状态，step=500ms
			if (++i % 5 == 0) {
				if (app.data.Audio.currentTime == compare) {
					app.data.Audio.play();
				} else {
					compare = app.data.Audio.currentTime;
				}
			}

			wx.showTabBarRedDot({
				index: 3
			});
		} else {
			app.data.onPlay = false;
			wx.hideTabBarRedDot({
				index: 3
			});
		}

	}, 100);
};

const setAudioEvent = (app, that) => {
	let data;
	if (that) {
		data = that.data;
	}
	let appData = app.data;
	let Audio = app.data.Audio;
	Audio.onPlay(() => {
		console.log('onPlay');
		wx.hideLoading();
		wx.removeStorageSync('ended');
		if (!appData.url) {
			return;
		}
		createRandomIndex();
		appData.onPlay = true;
		if (!data) {
			return;
		}
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
		Audio.onError(err => {
			console.log('onError', err);
			app.data.onPlay = false;
			Audio.pause();
		});
	}

	Audio.onPause(() => {
		console.log('onPause');
		wx.hideLoading();
		if (appData.audioBackstage) {
			appData.onPlay = false;
		}
		if (!data) {
			return;
		}
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
		let bool = false;
		if (appData.audioBackstage) {
			wx.setStorageSync('ended', true);
			bool = true;
		} else if (data) {
			bool = false;
		} else {
			bool = true;
		}
		if (bool) {
			appData.onPlay = false;
			let playMode = wx.getStorageSync('playMode');
			if (playMode == 'loop') {
				if (appData.url) {
					appData.Audio.src = appData.url;
					appData.Audio.play();
					_recentView(appData.type, appData.index);
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
				let newIndex;
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
				let list = wx.getStorageSync('randomList') || [];
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
};
const skip_previous = (that, app) => {
	let newIndex;
	let appData = app.data;
	if (appData.index > 0) {
		newIndex = appData.index - 1;
	} else {
		newIndex = appData.audioList.length - 1;
	}
	_prevOrNext(that, app, newIndex);
};

const skip_next = (that, app) => {
	let newIndex;
	let appData = app.data;
	if (appData.index < appData.audioList.length - 1) {
		newIndex = appData.index + 1;
	} else {
		newIndex = 0;
	}
	_prevOrNext(that, app, newIndex);
};

function _prevOrNext(that, app, newIndex) {
	resetData(app.data.type, newIndex);
	if (app.data.url) {
		app.data.Audio.play();
	}
	if (that) {
		if (app.data.type.indexOf('article') > -1 && that.currAudio != app.data.currAudio) {
			var sectionTimes = app.data.currAudio[0].sections.map(i => i.time);
		}
		let lyrics = lyricFormat(that.data.lyric[app.data.currAudio[0].id]);
		that.setData({
			currAudio: app.data.currAudio,
			type: app.data.type,
			onPlay: app.data.onPlay,
			sectionTimes: sectionTimes || [],
			lyrics
		});
	} else {
		app.data.onShow();
	}
}

const toMinute = myTime => {
	let minutes = parseInt(myTime / 60);
	let seconds = parseInt(myTime - 60 * minutes);
	minutes = minutes < 10 ? `0${minutes}` : minutes;
	seconds = seconds < 10 ? `0${seconds}` : seconds;
	return `${minutes}:${seconds}`;
};
const toSecond = myTime => {
	if (typeof myTime === 'number') {
		return myTime;
	}
	let reg = /[:：]/;
	myTime = myTime.replace(/[[\]\s]/g, '');
	if (!reg.test(myTime)) {
		return myTime;
	}
	let arr = myTime.split(reg);
	return arr[0] * 60 + arr[1] * 1;
};

/**
 *@description eqIndex 为了当前元素后面是否紧邻着 time 为空的元素
 *如果兄弟元素一个或者连续多个的 time 为空，则只有当前元素会显示播放图标，
 *且当前元素和兄弟元素不管是否正在播放，只点亮图标不点亮背景色
 */
const getCurrPart = (sectionTimes, currentTime) => {
	let i = sectionTimes.length - 1;
	if (typeof i !== 'number' || isNaN(i)) {
		throw new TypeError('i is not a Number');
	}
	let eqIndex = true;
	while (i >= 0) {
		if (!sectionTimes[i]) {
			eqIndex = false;
		}
		let eqCurrentTime = toSecond(currentTime) >= toSecond(sectionTimes[i]);
		if (!eqCurrentTime) {
			eqIndex = true;
		} else if (sectionTimes[i]) {
			return [sectionTimes[i], eqIndex];
		}
		i--;
	}
	return '00:00';
};
const createRandomIndex = () => {
	let appData = getApp().data;
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
			}());
			randomList.unshift(appData.index);
			wx.setStorageSync('randomList', randomList);
		}
	}
};

const lyricFormat = lyric => {
	if (!lyric) {
		return {
			lyricTimeTable: [],
			lyricJson: {},
			lyricList: []
		};
	}
	let arr = lyric.split('\n');
	let lyricJson = {};
	let lyricTimeTable = [];
	arr.forEach(item => {
		let text = item.replace(/\[\d+([^\]]*)?\d+\]/g, '');
		if (!text) {
			return;
		}
		let time = item.replace(text, '').replace(/\s/g, '');
		let timeTable = time.match(/\[([^\]]*)?\]/g);
		if (timeTable) {
			timeTable.forEach(val => {
				let seconds = toSecond(val);
				lyricJson[seconds] = {};
				lyricJson[seconds].text = text;
				lyricJson[seconds].time = seconds;
				lyricTimeTable.push(seconds);
			});
		} else if (lyricJson[0]) {
			lyricJson[0].text = `${lyricJson[0].text}\n${text}`;
		} else {
			lyricTimeTable.push(0);
			lyricJson[0] = {};
			lyricJson[0].text = text;
			lyricJson[0].time = 0;
		}
	});
	lyricTimeTable.sort((a, b) => a - b);
	return {
		lyricTimeTable,
		lyricJson,
		lyricList: Object.values(lyricJson).sort((a, b) => a.time - b.time)
	};
};
const updateAudioInfo = data => {
	data.Audio.title = data.currAudio[0].title;
	data.currAudio[0].author && (data.Audio.singer = data.currAudio[0].author);
	data.Audio.coverImgUrl = data.currAudio[0].image ? data.currAudio[0].image : 'https://lglong519.github.io/test/images/panda-music.jpg';
};
module.exports = {
	articleZH,
	articleEN,
	classical,
	music,
	lyric,
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
	createRandomIndex,
	lyricFormat,
	updateAudioInfo
};
