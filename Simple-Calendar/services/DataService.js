import DataRepository from 'DataRepository';

/**
 * 数据业务类
 */
class DataSerivce {

    constructor( props ) {
        props = props || {};
        this.id = props[ '_id' ] || 0;
        this.content = props[ 'content' ] || '';
        this.date = props[ 'date' ] || '';
        this.level = props[ 'level' ] || '';
    }

    save() {
        if( this.checkProps() ) {
            DataRepository.addData( {
                content: this.content,
                date: this.date,
                level: this.level,
                addDate: new Date().getTime(),
                status: 1
            });
        }
    }

    static findAll() {
        return DataRepository.findAllData();
    }

    delete() {
        DataRepository.removeData( this.id );
    }

    static findByDate( date ) {
        if( !date ) return [];
        let data = DataRepository.findBy(( item ) => {
            console.log(item[ 'date' ], date.getTime());
            return item[ 'date' ] == date.getTime();
        });
        return data;
    }

    checkProps() {
        return this.content && this.level && this.date;
    }
}

module.exports = DataSerivce;