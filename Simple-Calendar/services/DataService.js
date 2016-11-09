import DataRepository from 'DataRepository';

/**
 * 数据业务类
 */
class DataSerivce {

    constructor(props) {
        props = props || {};
        this.id = props['_id'] || 0;
        this.content = props['content'] || '';
        this.date = props['date'] || '';
        this.month = props['month'] || '';
        this.year = props['year'] || '';
        this.level = props['level'] || '';
        this.title = props['title'] || '';
    }

    /**
     * 保存当前对象数据
     */
    save() {
        if (this._checkProps()) {
            DataRepository.addData({
                title: this.title,
                content: this.content,
                year: this.year,
                month: this.month,
                date: this.date,
                level: this.level,
                addDate: new Date().getTime(),
                status: 1
            });
        }
    }

    /**
     * 获取所有事项数据
     */
    static findAll() {
        return DataRepository.findAllData();
    }

    /**
     * 根据id删除事项数据
     */
    delete() {
        DataRepository.removeData(this.id);
    }

    /**
     * 批量删除数据
     * @param {Array} ids 事项Id集合
     */
    static deleteRange(...ids) {
        DataRepository.removeRange(ids);
    }

    /**
     * 根据日期查找所有符合条件的事项记录
     * @param {Date} date 日期对象
     * @returns {Array} 事项集合
     */
    static findByDate(date) {
        if (!date) return [];
        let data = DataRepository.findBy((item) => {
            return item['date'] == date.getDate() && 
                item['month'] == date.getMonth() && 
                item['year'] == date.getFullYear();
        });
        return data;
    }

    _checkProps() {
        return this.title && this.level && this.date && this.year && this.month;
    }
}

module.exports = DataSerivce;