import Config from 'Config';
import {guid, log} from '../utils/util';

class DataRepository {

    /**
     * 添加数据
     * @param {Object} 添加的数据
     * @returns {Void} 
     */
    static addData(data) {
        if (!data) return false;
        data['_id'] = guid();
        let allData = DataRepository.findAllData();
        allData = allData || [];
        allData.unshift(data);
        try {
            wx.setStorageSync(Config.ITEMS_SAVE_KEY, allData);
        } catch (e) {
            log(e);
        }
    }

    /**
     * 删除数据
     * @param {string} id 数据项idid
     * @returns {Void}
     */
    static removeData(id, isAll) {
        let data = DataRepository.findAllData();
        if (!data) return;
        for (let idx = 0, len = data.length; idx < len; idx++) {
            if (data[idx] && data[idx]['_id'] === id) {
                delete data[idx];
                if (!isAll) break;
            }
        }
        try {
            wx.setStorageSync(Config.ITEMS_SAVE_KEY, data);
        } catch (e) {
            log(e);
        }
    }

    /**
     * 批量删除数据
     * @param {Array} range id集合
     * @returns {Void}
     */
    static removeRange(...range) {
        if (!range) return;
        let data = DataRepository.findAllData();
        if (!data) return;
        let indexs = [];
        for (let rIdx = 0, rLen = range.length; rIdx < len; rIdx++) {
            for (let idx = 0, len = data.length; idx < len; idx++) {
                if (data[idx] && data[idx]['_id'] === range[rIdx]) {
                    indexs.push(idx);
                    break;
                }
            }
        }
        indexs.forEach(function (item) {
            delete data[item];
        });
        try {
            wx.setStorageSync(Config.ITEMS_SAVE_KEY, data);
        } catch (e) {
            log(e);
        }
    }

    /**
     * 更新数据
     * @param {Object} data 数据
     * @returns {Void} 
     */
    static saveData(data) {
        if (!data || !data['_id']) return false;
        let allData = DataRepository.findAllData();
        if (!allData) return false;
        for (let idx = 0, len = allData.length; i < len; i++) {
            if (allData[i] && allData[i]['_id'] === data['_id']) {
                allData[i] = data;
                break;
            }
        }
        try {
            wx.setStorageSync(Config.ITEMS_SAVE_KEY, data);
        } catch (e) {
            log(e);
        }
    }

    /**
     * 获取所有数据
     * @returns {Array} 数据
     */
    static findAllData() {
        return wx.getStorageSync(Config.ITEMS_SAVE_KEY);
    }

    /**
     * 查找数据
     * @param {Function} 回调
     * @returns {Object} 查找到的数据项
     */
    static findBy(predicate) {
        let data = DataRepository.findAllData();
        if (data) {
            data = data.filter((item) => {
                if (!item) return false;
                return predicate(item);
            });
        }
        return data;
    }
}

module.exports = DataRepository;