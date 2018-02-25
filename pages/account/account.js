// pages/userCenter/userCenter.js
const app = getApp();
Page({
    data: {
        userInfo: null
    },
    logoutEvent() {
        wx.removeStorage({
            key: 'userInfo',
            success: function (res) { },
        })
        wx.showToast({
            title: '退出成功',
            icon: 'success',
            duration: 1500,
            success: function () {
                setTimeout(() => {
                    wx.redirectTo({
                        url: '../index/index'
                    })
                }, 1500)
            }
        })
    },
    onShow: function () {
		var that=this;
        wx.setTabBarStyle({
            selectedColor: '#5287E9',
        });
		if (!this.data.userInfo){
			wx.getStorage({
				key: 'userInfo',
				success: function (res) {
					that.setData({
						userInfo: app.data.userInfo
					});
				},
				fail() {
					app.Funs.wxLogin(app);
				}
			})
		}
    },
})