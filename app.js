// app.js
import Funs from './utils/funs';
App({
	onLaunch () {
		console.log(1, 'onLaunch');
		wx.removeStorageSync('randomList');
	},
	onShow () {
		Funs.init(this);
		console.log(2, 'onShow');
	},
	onHide () {
		console.log(3, 'onHide');
	},
	onUnlaunch () {
		console.log(4, 'onUnlaunch');
	},
	Funs
});
