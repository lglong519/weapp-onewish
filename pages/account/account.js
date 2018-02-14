// pages/userCenter/userCenter.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
		userInfo:null
    },
    logoutEvent() {
        wx.removeStorage({
            key: 'userInfo',
            success: function(res) {},
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('页面加载');
		this.setData({
			userInfo: app.globalData.userInfo
			
		});
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log('ready');
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log('页面显示')
        wx.getStorage({
            key: 'userInfo',
            success: function(res) {
                console.log('enter userCenter success')
            },
            fail(){
                wx.redirectTo({
                    url: '../index/index'
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})