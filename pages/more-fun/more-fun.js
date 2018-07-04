import OLL from '../../libs/OLL.js';
import PLL from '../../libs/PLL.js';

Page({
	data: {
		isOLL: false,
		OLL,
		isPLL: false,
		PLL,
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
	},
	togglePLL() {
		this.setData({
			isPLL: !this.data.isPLL,
		});
	}
});
