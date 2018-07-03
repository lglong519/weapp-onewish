import OLL from '../../libs/OLL.js';

Page({
	data: {
		isOLL: true,
		OLL
	},
	onLoad() {

	},
	onShow() {
		wx.setTabBarStyle({
			selectedColor: '#73A0C2',
		});
		let random = [];
		for (let i = 0; i < 60; i++) {
			random.push(parseInt(Math.random() * 10));
		}
		this.setData({
			random
		});
	},
	toggleOLL() {
		this.setData({
			isOLL: !this.data.isOLL,
		});
	}
});
