
//初始化全局变量
const init = () => {
	// 设置voice/mp3默认的index
	if (!wx.getStorageSync('artIndex')) {
		wx.setStorageSync('artIndex', 0);
	}
	//设置导航栏文字选中颜色
	wx.setTabBarStyle({
		selectedColor: '#5287E9',
	})
}

module.exports = {
	init
}