// pages/account/account.js
const app = getApp();
Page({
	data: {
		userInfo: null,
		playMode: ['once', 'loop', 'list', 'listLoop', 'randomList', 'randomInfinite', 'randomAll'],
		mode: ['单曲播放', '单曲循环', '列表顺序', '列表循环', '列表随机', '列表随机循环', '全部随机'],
		modeIcon: ['sync_disabled', 'sync', 'format_list_numbered', 'low_priority', 'wrap_text', 'format_line_spacing', 'crop_rotate'],
		index: 0,
		audioBackstage: wx.getStorageSync('audioBackstage')
	},
	audioBackstageChange(e) {
		this.setData({
			audioBackstage: e.detail.value
		})
		wx.setStorageSync('audioBackstage', e.detail.value);
		try {
			app.data.Audio.destroy();
		} catch (err) {
			app.data.Audio.stop();
			app.data.Audio = null;
		}
		if (this.data.audioBackstage) {
			app.data.Audio = wx.getBackgroundAudioManager();
		} else {
			app.data.Audio = wx.createInnerAudioContext();
		}
		app.Funs.init(app);
		app.data.playOnload && app.data.playOnload();
	},
	previewImage() {
		wx.previewImage({
			urls: ['https://lglong519.github.io/test/images/qrcode.jpg']
		})
	},
	tapPlayMode(e) {
		this.setData({
			index: e.detail.value
		})
		var that = this;
		wx.setStorageSync('playMode', that.data.playMode[that.data.index])
	},
	logoutEvent() {
		var that = this;
		wx.showModal({
			content: '是否退出当前帐号？',
			complete(res) {
				if (res.confirm) {
					wx.openSetting({
						complete(res) {
							if (res.authSetting['scope.userInfo']) {
							} else {
								wx.removeStorageSync('userInfo')
								app.data.userInfo = null;
								that.setData({
									userInfo: null
								})
							}
						}
					});
				}
			}
		});
	},
	loginEvent() {
		app.Funs.wxLogin(app);
		this.onShow();
	},
	onShow: function () {
		var that = this;
		wx.setTabBarStyle({
			selectedColor: '#5287E9',
		});
		this.setData({
			audioBackstage: wx.getStorageSync('audioBackstage')
		})
		if (app.data.userInfo) {
			this.setData({
				userInfo: app.data.userInfo
			})
		} else {
			app.Funs.wxLogin(app).then(res => {
				that.setData({
					userInfo: res
				})
			});
		}
	},
})