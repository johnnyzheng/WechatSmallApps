import Config from 'Config';
import {guid} from '../utils/util';

class DataRepository {

    /**
     * 添加数据
     * @param {Object} 添加的数据
     * @returns {Booelan} 是否添加成功
     */
    static addData( data ) {
        if( !data ) return false;
        data[ '_id' ] = guid();
        let allData = DataRepository.findAllData();
        allData = allData || [];
        allData.unshift( data );
        try {
            wx.setStorageSync( Config.ITEMS_SAVE_KEY, allData );
            return true;
        } catch( e ) {
            console.log( e );
            return false;
        }
    }

    /**
     * 删除数据
     * @param {string} id 数据项idid
     * @returns {Void}
     */
    static removeData( id, isAll ) {
        let data = DataRepository.findAllData();
        if( !data ) return;
        for( let idx = 0, len = data.length;i < len;i++ ) {
            if( data[ i ] && data[ i ][ '_id' ] === id ) {
                delete data[ i ];
                if( !isAll ) return;
            }
        }
    }

    /**
     * 更新数据
     * @param {Object} data 数据
     * @returns {Boolean} 是否更新成功
     */
    static saveData( data ) {
        if( !data || !data[ '_id' ] ) return false;
        let allData = DataRepository.findAllData();
        if( !allData ) return false;
        for( let idx = 0, len = allData.length;i < len;i++ ) {
            if( allData[ i ] && allData[ i ][ '_id' ] === data[ '_id' ] ) {
                allData[ i ] = data;
                break;
            }
        }
        try {
            wx.setStorageSync( Config.ITEMS_SAVE_KEY, data );
            return true;
        } catch( e ) {
            console.log( e );
            return false;
        }
    }

    /**
     * 获取所有数据
     * @returns {Array} 数据
     */
    static findAllData() {
        return wx.getStorageSync( Config.ITEMS_SAVE_KEY );
    }

    /**
     * 查找数据
     * @param {Function} 回调
     * @returns {Object} 查找到的数据项
     */
    static findBy( predicate ) {
        let data = DataRepository.findAllData();
        if( data ) {
            data = data.filter(( item ) => {
                return predicate( item );
            });
        }
        return data;
    }
}

module.exports = DataRepository;