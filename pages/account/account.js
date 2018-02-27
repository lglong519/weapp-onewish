// pages/account/account.js
const app = getApp();
Page({
	data: {
		userInfo: null,
		playMode: app.data.modeIcon.mode,
		mode: app.data.modeIcon.name,
		modeIcon: app.data.modeIcon.list,
		index: 0,
		audioBackstage: wx.getStorageSync('audioBackstage'),
		hideTabBar: wx.getStorageSync('hideTabBar') || false,
		showAnchor: wx.getStorageSync('showAnchor'),
		showZoom: wx.getStorageSync('showZoom')
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
	hideTabBar(e) {
		this.setData({
			hideTabBar: e.detail.value
		})
		wx.setStorageSync('hideTabBar', e.detail.value);
	},
	showAnchor(e) {
		this.setData({
			showAnchor: e.detail.value
		})
		wx.setStorageSync('showAnchor', e.detail.value);
	},
	showZoom(e) {
		this.setData({
			showZoom: e.detail.value
		})
		wx.setStorageSync('showZoom', e.detail.value);
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
			audioBackstage: wx.getStorageSync('audioBackstage'),
			index: app.data.modeIcon.index[wx.getStorageSync('playMode')]
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