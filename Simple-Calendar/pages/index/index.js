import DataService from  '../../services/DataService';
import {LEVEL} from '../../services/Config';

let t = DataService.findAll();
console.log(t);

Page({
  data: {
    showMonth: {},
    data: {},
    selectDateText: '',
    pickerDateValue: '',

    isSelectMode: false,
    isMaskShow: false,
    isEditMode: false,
    isSelectLevelASShow: false,

    // modal
    isModalShow: false,
    modalMsg: '',

    //事项等级数据
    levelSelectedValue: LEVEL.normal,
    levelSelectData: [LEVEL.normal, LEVEL.warning, LEVEL.danger],

    // updatePanel 数据
    updatePanelTop: 10000,
    updatePanelAnimationData: {},
    todoInputValue: '',
    todoTextAreaValue: '',

    // 事项列表
    itemList: [],
    editItemList: [] //编辑勾选中的事项id
  },

  onLoad() {
    let _this = this;
    wx.getSystemInfo({
      success: (data) => {
        _this.setData({
          updatePanelTop: data.windowHeight,
        });
      }
    });
    changeDate.call(this);
  },

  onReady() {
    loadItemListData.call(this);
  },

  datePickerChangeEvent(e) {
    let date = new Date(Date.parse(e.detail.value));
    changeDate.call(this, new Date(date.getFullYear(), date.getMonth(), 1));
  },

  changeDateEvent(e) {
    let year = e.currentTarget.dataset.year;
    let month = e.currentTarget.dataset.month;
    changeDate.call(this, new Date(year, parseInt(month) - 1, 1));
  },

  dateClickEvent(e) {
    let dataset = e.currentTarget.dataset;
    let year = dataset.year,
      month = dataset.month,
      date = dataset.date,
      data = this.data.data
      // dates,
      // tmp,
      // selectDateText
      ;

    // data[ 'selected' ][ 'year' ] = year;
    // data[ 'selected' ][ 'month' ] = month;
    // data[ 'selected' ][ 'date' ] = date;

    // selectDateText = year + '年' + month + '月' + date + '日';
    // this.setData( { data: data, selectDateText: selectDateText });

    if (!(data['currentYear'] == year && data['currentMonth'] == month && data['currentDate'] == date)) {
      changeDate.call(this, new Date(year, parseInt(month) - 1, date));
    }

  },

  showUpdatePanelEvent() {
    showUpdatePanel.call(this);
  },

  closeUpdatePanelEvent() {
    closeUpdatePanel.call(this);
  },

  editClickEvent() {
    this.setData({ isEditMode: true });
  },

  // action-sheet隐藏
  actionSheetChange() {
    this.setData({ isSelectLevelASShow: false });
  },

  // 事项列表项长按动作事件
  listItemLongTapEvent(e) {
    let {isEditMode} = this.data;
    let {id} = e.currentTarget.dataset;
    let _this = this;
    //如果不是编辑勾选模式下才生效
    if (!isEditMode) {
      //this.setData({ isSelectLevelASShow: true }); //旧版本的actionsheet
      let itemList = ['删除'];
      wx.showActionSheet({
        itemList: itemList,
        itemColor: '#2E2E3B',
        success: (res) => {
          if (!res.cancel) {
            switch (itemList[res.tapIndex]) {
              case '删除':
                new DataService({ _id: id}).delete();
                loadItemListData.call(_this);
                break;
            }
          }
        }
      });
    }
  },

  //取消编辑事件
  cancelEditClickEvent() {
    this.setData({ isEditMode: false });
    resetItemListDataCheck.call(this);
  },

  showSelectLevelEvent() {
    this.setData({ isSelectLevelASShow: true });
  },

  // 事项标题文本框变化事件
  todoInputChangeEvent(e) {
    let value = e.detail.value;
    this.setData({ todoInputValue: value });
  },

  //事项内容多行文本域变化事件
  todoTextAreaChangeEvent(e) {
    let value = e.detail.value;
    this.setData({ todoInputValue: value });
  },

  // 选择事项等级事件
  levelClickEvent(e) {
    let level = e.currentTarget.dataset.level;
    this.setData({ levelSelectedValue: level });
  },

  // 保存事项数据
  saveDataEvent() {
    let todoValue = this.data.todoInputValue;
    let todoTextAreaValue = this.data.todoTextAreaValue;
    let levelValue = this.data.levelSelectedValue;
    let showYear = this.data.data.showYear;
    let showMonth = parseInt(this.data.data.showMonth) - 1;
    let showDate = this.data.data.showDate;
    if (todoValue != '' && levelValue) {
      new DataService({
        title: todoValue,
        content: todoTextAreaValue,
        level: levelValue,
        year: showYear,
        month: showMonth,
        date: showDate
      }).save();
      closeUpdatePanel.call(this);
      loadItemListData.call(this);
    } else {
      showModal.call(this, '请填写事项内容');
    }
  },

  //批量删除事件
  removeRangeTapEvent() {
    let itemList = this.data.itemList;
    if (!itemList) return;

    wx.showModal({
      title: '提示',
      content: '确定要删除选定的事项？',
      success: (res) => {
        if (res.confirm) {

        }
      }
    });
  },

  listItemClickEvent(e) {
    let isEditMode = this.data.isEditMode;
    if (!isEditMode) return; //不是编辑勾选模式下，选择无效

    let id = e.currentTarget.dataset.id;
    let data = this.data.itemList || [];
    let editItemList = this.data.editItemList || [];
    let index = data.findIndex((item) => {
      return item['_id'] == id;
    });
    if (index >= 0) {
      data[index]['checked'] = !data[index]['checked'];
      this.setData({ itemList: data });
    }
  },

  //提示模态窗口关闭事件
  closeModalEvent() {
    closeModal.call(this);
  }
});






/**
 * 显示事项数据添加更新面板
 */
function showUpdatePanel() {
  let animation = wx.createAnimation({
    duration: 600
  });
  animation.translateY('-100%').step();
  this.setData({
    updatePanelAnimationData: animation.export()
  });
}

/**
 * 显示模态窗口
 * @param {String} msg 显示消息
 */
function showModal(msg) {
  this.setData({
    isModalShow: true,
    isMaskShow: true,
    modalMsg: msg
  });
}

/**
 * 关闭模态窗口
 */
function closeModal() {
  this.setData({
    isModalShow: false,
    isMaskShow: false,
    modalMsg: ''
  });
}

/**
 * 关闭事项数据添加更新面板
 */
function closeUpdatePanel() {
  let animation = wx.createAnimation({
    duration: 600
  });
  animation.translateY('100%').step();
  this.setData({
    updatePanelAnimationData: animation.export()
  });
}

/**
 * 加载事项列表数据
 */
function loadItemListData() {
  let year = this.data.data.showYear;
  let month = this.data.data.showMonth;
  let date = this.data.data.showDate;
  let data = DataService.findByDate(new Date(Date.parse([year, month, date].join('-'))));
  console.log(data);
  this.setData({ itemList: data });
}

/**
 * 重置是项列表勾选记录
 */
function resetItemListDataCheck() {
  let data = this.data.itemList || [];
  for (let i = 0, len = data.length; i < len; i++) {
    data[i]['checked'] = false;
  }
  this.setData({ itemList: data });
}

/**
 * 变更日期数据
 * @param {Date} targetDate 当前日期对象
 */
function changeDate(targetDate) {
  let date = targetDate || new Date();
  let currentDateObj = new Date();

  let showMonth, //当天显示月份
    showYear, //当前显示年份
    showDay, //当前显示星期
    showDate, //当前显示第几天
    showMonthFirstDateDay, //当前显示月份第一天的星期
    showMonthLastDateDay, //当前显示月份最后一天的星期
    showMonthDateCount; //当前月份的总天数

  let data = [];

  showDate = date.getDate();
  showMonth = date.getMonth() + 1;
  showYear = date.getFullYear();
  showDay = date.getDay();

  showMonthDateCount = new Date(showDate, showMonth, 0).getDate();
  date.setDate(1);
  showMonthFirstDateDay = date.getDay();
  date.setDate(showMonthDateCount);
  showMonthLastDateDay = date.getDay();

  let beforeDayCount = 0,
    beforeYear, //上页月年份
    beforMonth, //上页月份
    afterYear, //下页年份
    afterMonth, //下页月份
    afterDayCount = 0, //上页显示天数
    beforeMonthDayCount = 0; //上页月份总天数

  //上一个月月份
  beforMonth = showMonth == 1 ? 12 : showMonth - 1;
  //上一个月年份
  beforeYear = showMonth == 1 ? showYear - 1 : showYear;
  //下个月月份
  afterMonth = showMonth == 12 ? 1 : showMonth + 1;
  //下个月年份
  afterYear = showMonth == 12 ? showYear + 1 : showYear;

  //获取上一页的显示天数
  if (showMonthFirstDateDay != 0)
    beforeDayCount = showMonthFirstDateDay - 1;
  else
    beforeDayCount = 6;

  //获取下页的显示天数
  if (showMonthLastDateDay != 0)
    afterDayCount = 7 - showMonthLastDateDay;
  else
    showMonthLastDateDay = 0;

  //如果天数不够6行，则补充完整
  let tDay = showMonthDateCount + beforeDayCount + afterDayCount;
  if (tDay <= 35)
    afterDayCount += (42 - tDay);

  let selected = this.data.data['selected'] || {};

  data = {
    currentDate: currentDateObj.getDate(), //当天日期第几天
    currentYear: currentDateObj.getFullYear(), //当天年份
    currentDay: currentDateObj.getDay(), //当天星期
    currentMonth: currentDateObj.getMonth() + 1, //当天月份
    showMonth: showMonth, //当前显示月份
    showDate: showDate, //当前显示月份的第几天 
    showYear: showYear, //当前显示月份的年份
    beforeYear: beforeYear, //当前页上一页的年份
    beforMonth: beforMonth, //当前页上一页的月份
    afterYear: afterYear, //当前页下一页的年份
    afterMonth: afterMonth, //当前页下一页的月份
    selected: selected //当前被选择的日期信息
  };

  let dates = [];
  let _id = 0; //为wx:key指定

  if (beforeDayCount > 0) {
    beforeMonthDayCount = new Date(beforeYear, beforMonth, 0).getDate();
    for (let fIdx = 0; fIdx < beforeDayCount; fIdx++) {
      dates.unshift({
        _id: _id,
        year: beforeYear,
        month: beforMonth,
        date: beforeMonthDayCount - fIdx
      });
      _id++;
    }
  }

  for (let cIdx = 1; cIdx <= showMonthDateCount; cIdx++) {
    dates.push({
      _id: _id,
      active: showDate == cIdx,
      //active: ( selected[ 'year' ] == showYear && selected[ 'month' ] == showMonth && selected[ 'date' ] == cIdx ), //选中状态判断
      year: showYear,
      month: showMonth,
      date: cIdx
    });
    _id++;
  }

  if (afterDayCount > 0) {
    for (let lIdx = 1; lIdx <= afterDayCount; lIdx++) {
      dates.push({
        _id: _id,
        year: afterYear,
        month: afterMonth,
        date: lIdx
      });
      _id++;
    }
  }

  data.dates = dates;
  this.setData({ data: data, pickerDateValue: showYear + '-' + showMonth });
}
