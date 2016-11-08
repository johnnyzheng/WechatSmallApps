Page({
    data: {
        avatar: ''
    },

    onLoad() {
        let app = getApp(),
            _this = this;
        app.getUserInfo((userData) => {
            _this.setData({ 'avatar': userData['avatarUrl'] });
        });
    },

    onReady() {
        setTimeout(() => {
            wx.navigateTo({
              url: '../index/index'
            })
        }, 2500);
    }
});