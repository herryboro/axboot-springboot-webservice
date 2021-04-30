var fnObj = {};
var ACTIONS = axboot.actionExtend(fnObj, {
    PAGE_SEARCH: function (caller, act, data) {
        axboot.ajax({
            type: 'GET',
            url: '/api/v1/education/teachGridForm',
            data: caller.searchView.getData(),
            callback: function (res) {
                caller.gridView01.setData(res);
            },
            options: {
                // axboot.ajax 함수에 2번째 인자는 필수가 아닙니다. ajax의 옵션을 전달하고자 할때 사용합니다.
                onError: function (err) {
                    console.log(err);
                },
            },
        });

        return false;
    },
    PAGE_SAVE: function (caller, act, data) {
        // var item = {};
        // caller.formView01.target.find('input, select').each(function (i, element) {
        //     var $element = $(element);
        //     var name = $element.data('axPath');
        //     var value = $element.val() || '';
        //     console.log(name, value);
        //     item[name] = value;
        // });
        // console.log(item);
        var item = caller.formView01.getData();

        axboot.ajax({
            type: 'POST',
            url: '/api/v1/education/teachGridForm',
            data: JSON.stringify(item),
            callback: function (res) {
                ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
                axToast.push('저장 되었습니다');
            },
        });
    },
    ITEM_CLICK: function (caller, act, data) {},
    ITEM_ADD: function (caller, act, data) {
        caller.gridView01.addRow();
    },
    ITEM_DEL: function (caller, act, data) {
        caller.gridView01.delRow('selected');
    },
    dispatch: function (caller, act, data) {
        var result = ACTIONS.exec(caller, act, data);
        if (result != 'error') {
            return result;
        } else {
            // 직접코딩
            return false;
        }
    },
});

// fnObj 기본 함수 스타트와 리사이즈
fnObj.pageStart = function () {
    this.pageButtonView.initView();
    this.searchView.initView();
    this.gridView01.initView();
    this.formView01.initView();

    ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
};

fnObj.pageResize = function () {};

fnObj.pageButtonView = axboot.viewExtend({
    initView: function () {
        axboot.buttonClick(this, 'data-page-btn', {
            search: function () {
                ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);
            },
            save: function () {
                ACTIONS.dispatch(ACTIONS.PAGE_SAVE);
            },
            excel: function () {},
        });
    },
});

//== view 시작
/**
 * searchView
 */
fnObj.searchView = axboot.viewExtend(axboot.searchView, {
    initView: function () {
        this.target = $(document['searchView0']);
        this.target.attr('onsubmit', 'return ACTIONS.dispatch(ACTIONS.PAGE_SEARCH);');
        this.filter = $('#filter');
    },
    getData: function () {
        return {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            filter: this.filter.val(),
        };
    },
});

/**
 * gridView
 */
fnObj.gridView01 = axboot.viewExtend(axboot.gridView, {
    initView: function () {
        var _this = this;

        this.target = axboot.gridBuilder({
            onPageChange: function (pageNumber) {
                ACTIONS.dispatch(ACTIONS.PAGE_SEARCH, { pageNumber: pageNumber });
            },
            showRowSelector: true,
            frozenColumnIndex: 0,
            multipleSelect: true,
            target: $('[data-ax5grid="grid-view-01"]'),
            columns: [
                { key: 'companyNm', label: COL('company.name'), width: 120, align: 'left', editor: 'text' },
                { key: 'ceo', label: COL('company.ceo'), width: 80, align: 'center', editor: 'text' },
                { key: 'bizno', label: COL('company.bizno'), width: 100, align: 'center', editor: 'text' },
            ],
            body: {
                onClick: function () {
                    this.self.select(this.dindex, { selectedClear: true });
                    fnObj.formView01.setData(this.item);
                },
            },
        });

        axboot.buttonClick(this, 'data-grid-view-01-btn', {
            add: function () {
                ACTIONS.dispatch(ACTIONS.ITEM_ADD);
            },
            delete: function () {
                ACTIONS.dispatch(ACTIONS.ITEM_DEL);
            },
        });
    },
    getData: function (_type) {
        var list = [];
        var _list = this.target.getList(_type);

        if (_type == 'modified' || _type == 'deleted') {
            list = ax5.util.filter(_list, function () {
                //                delete this.deleted;
                //                return this.key;
                return this.id;
            });
        } else {
            list = _list;
        }
        return list;
    },
    addRow: function () {
        this.target.addRow({ __created__: true, useYn: 'Y' }, 'last');
    },
});

/*
    formView
*/
fnObj.formView01 = axboot.viewExtend(axboot.formView, {
    getData: function () {
        var item = {};
        this.target.find('input, select').each(function (i, elem) {
            //var $elem = $(elem);
            var $elem = $(this);
            var name = $elem.data('axPath');
            var value = $elem.val() || '';
            item[name] = value;
        });
        return item;
    },
    setData: function (item) {
        var value;
        for (var prop in item) {
            value = item[prop] || '';
            $('[data-ax-path="' + prop + '"]').val(value);
        }
    },
    initView: function () {
        var _this = this; // fnOjb.formview01

        _this.target = $('.js-form');
        // _this.model = new ax5.ui.binder();
        // _this.model.setModel({}, _this.target);

        // console.log(_this.model.get());
    },
});
