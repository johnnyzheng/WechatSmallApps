import {log} from 'utils/util';

App({
  getUserInfo(cb) {
    if (typeof cb !== "function") return;
    let that = this;
    return new Promise((resolve, reject) => {
      if (that.globalData.userInfo) {
        cb(that.globalData.userInfo);
      } else {
        wx.login({
          success: () => {
            wx.getUserInfo({
              success: resolve,
              fail: reject
            });
          }
        });
      }
    }).then((res) => {
      that.globalData.userInfo = res.userInfo;
      cb(that.globalData.userInfo);
    }).catch((err) => {
      log(err);
    });
  },

  globalData: {
    userInfo: null
  },

  //自定义配置
  settings: {
    debug: true //是否调试模式
  }
});