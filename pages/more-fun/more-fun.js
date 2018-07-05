import OLL from '../../libs/OLL.js';
import PLL from '../../libs/PLL.js';

Page({
	data: {
		isOLL: false,
		OLL,
		isPLL: false,
		PLL,
		favorite: {
			OLLs: [],
			PLLs: []
		}
	},
	onLoad(options) {
		let { tab } = options;
		this.setData({
			[tab]: true
		});
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
			random,
			favorite: calc(wx.getStorageSync('favorite'))
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
	},
	favor(e) {
		let { index, type } = e.currentTarget.dataset;
		this.data.favorite[type][index] = !this.data.favorite[type][index];
		calc(this.data.favorite);
		wx.setStorageSync('favorite', this.data.favorite);
		this.setData({
			favorite: this.data.favorite
		});
	}
});

function calc(favorite) {
	['OLLs', 'PLLs'].forEach(item => {
		let num = 0;
		favorite[item].forEach(bool => {
			if (bool) {
				num++;
			}
		});
		favorite[item.slice(0, -1)] = num + ' / ' + favorite[item].length;
	});
	return favorite;
}
