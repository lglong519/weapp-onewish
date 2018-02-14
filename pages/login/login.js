//index.js
//获取应用实例
const app = getApp()

Page({
	data: {
		logining: false,
		login: '',
		password: ''
	},
	onLoad() {
		wx.setTabBarBadge({
			index: 1,
			text: '2'
		})
		wx.hideTabBar({
			complete(err) {
				console.log(err)
			}
		})
	},
	userInput: function (e) {
		this.setData({
			login: e.detail.value
		})
	},
	pwdInput: function (e) {
		this.setData({
			password: e.detail.value
		})
	},
	validUserInfo() {
		//return /\w+/.test(this.data.login) && /\w{6,}/.test(this.data.password)
		return this.data.login && this.data.password
	},
	pwdError() {
		wx.showToast({
			title: '账户或密码不对',
			icon: 'loading',
			duration: 1500,
			success: function () {
				console.log('账户或密码不对')
			}
		})
	},
	//登录函数
	loginEvent() {
		var me = this;
		if (this.validUserInfo()) {
			wx.request({
				url: 'https://master-dev.guzzu.cn/suapi/2/Auth.signin',
				method: 'POST',
				data: {
					login: me.data.login,
					password: me.data.password,
					clientType: "master.guzzu.cn"
				},
				success: function (res) {
					if (!res.data.error) {
						wx.setStorage({
							key: 'userInfo',
							data: {
								user: res.data.clientType,
								pwd: res.data.user.email,
								client: res.data.user.password
							}
						})
						wx.showToast({
							title: '登录成功',
							icon: 'success',
							duration: 1000,
							success: function () {
								setTimeout(() => {
									wx.navigateTo({
										url: '../userCenter/userCenter'
									})
								}, 1200)
							},
							fail: function (res) {
								console.log(res);
							}
						})
					} else {
						me.pwdError();
					}
				},
				fail: function (res) {
					me.pwdError();
				}
			})
		} else {
			this.pwdError();
		}
	},
	onShow: function () {
		console.log('进入登录页')
		wx.getStorage({
			key: 'userInfo',
			success: function (res) {
				wx.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 1000,
					success: function () {
						setTimeout(() => {
							wx.navigateTo({
								url: '../userCenter/userCenter'
							})
						}, 1200)
					}
				})
			},
			fail() {
				console.log('reload')
			}
		})
	},
	onShareAppMessage: function () {
		return {
			title: 'GUZZU登录',
			desc: 'GUZZU管理员登录!',
			path: '/pages/index/index'
		}
	},
	shareBtn() {
		wx.showTabBar({
			complete(err) {
				console.log(1, err)
			}
		})
		wx.setTabBarBadge({
			index: 1,
			text: new Date().getSeconds().toString()
		})
		let pic = '/pages/images/catalog.png';
		new Date().getSeconds().toString() % 2 == 0 && (pic = '/pages/images/home.png');
		wx.setTabBarItem({
			index: 0,
			text: 'text',
			iconPath: pic,
			selectedIconPath: pic,
			success(res) {
				console.log(2, res);
			}
		})
	}
})
