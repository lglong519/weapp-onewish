//app.js
import Funs from './utils/funs'
App({
    onLaunch: function () {
		console.log(1, 'onLaunch');
		console.log(5, Funs);
    },
    onShow() {
        Funs.init(this);
        console.log(2, 'onShow');
        // Funs.clearData(this,{ index: 3 })
    },
    onHide() {
        console.log(3, 'onHide');
    },
    onUnlaunch() {
        console.log(4, 'onUnlaunch');
    },
	Funs

})
