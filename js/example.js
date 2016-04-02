/**
 * Created by jf on 2015/9/11.
 * Update by Michael Li on 2016/4/3
 */

//$(function () {
var pageManager = {
    pm: 'abc',
    $container: $('.js_container'),
    _pageStack: [],
    _configs: [],
    _defaultPage: null,
    _pageIndex: 1,
    setDefault: function (defaultPage) {
        this._defaultPage = this._find('name', defaultPage);
        return this;
    },
    init: function () {
        var self = this;

        $(window).on('hashchange', function () {
            var state = history.state || {};
            var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
            var page = self._find('url', url) || self._defaultPage;
            if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
                self._back(page);
            } else {
                self._go(page);
            }
        });

        if (history.state && history.state._pageIndex) {
            this._pageIndex = history.state._pageIndex;
        }

        this._pageIndex--;

        var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
        var page = self._find('url', url) || self._defaultPage;
        this._go(page);
        return this;
    },
    push: function (config) {
        this._configs.push(config);
        return this;
    },
    go: function (to) {
        var config = this._find('name', to);
        if (!config) {
            return;
        }
        location.hash = config.url;
    },
    _go: function (config) {
        this._pageIndex++;

        history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

        var html = $(config.template).html();
        var $html = $(html).addClass('slideIn').addClass(config.name);
        this.$container.append($html);
        this._pageStack.push({
            config: config,
            dom: $html
        });

        if (!config.isBind) {
            this._bind(config);
        }

        return this;
    },
    back: function () {
        history.back();
    },
    _back: function (config) {
        this._pageIndex--;

        var stack = this._pageStack.pop();
        if (!stack) {
            return;
        }

        var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
        var found = this._findInStack(url);
        if (!found) {
            var html = $(config.template).html();
            var $html = $(html).css('opacity', 1).addClass(config.name);
            $html.insertBefore(stack.dom);

            if (!config.isBind) {
                this._bind(config);
            }

            this._pageStack.push({
                config: config,
                dom: $html
            });
        }

        stack.dom.addClass('slideOut').on('animationend', function () {
            stack.dom.remove();
        }).on('webkitAnimationEnd', function () {
            stack.dom.remove();
        });

        return this;
    },
    _findInStack: function (url) {
        var found = null;
        for (var i = 0, len = this._pageStack.length; i < len; i++) {
            var stack = this._pageStack[i];
            if (stack.config.url === url) {
                found = stack;
                break;
            }
        }
        return found;
    },
    _find: function (key, value) {
        var page = null;
        for (var i = 0, len = this._configs.length; i < len; i++) {
            if (this._configs[i][key] === value) {
                page = this._configs[i];
                break;
            }
        }
        return page;
    },
    _bind: function (page) {
        var events = page.events || {};
        for (var t in events) {
            for (var type in events[t]) {
                this.$container.on(type, t, events[t][type]);
            }
        }
        page.isBind = true;
    }
};

var home = {
    name: 'home',
    url: '#',
    template: '#tpl_home',
    events: {
        '.js_grid': {
            click: function (e) {
                var id = $(this).data('id');
                pageManager.go(id);
            }
        }
    }
};
var panel = {
    name: 'panel',
    url: '#panel',
    template: '#tpl_panel'
};
var button = {
    name: 'button',
    url: '#button',
    template: '#tpl_button'
};
var cell = {
    name: 'cell',
    url: '#cell',
    template: '#tpl_cell',
    events: {
        '#showTooltips': {
            click: function () {
                var $tooltips = $('.js_tooltips');
                if ($tooltips.css('display') != 'none') {
                    return;
                }

                // 如果有`animation`, `position: fixed`不生效
                $('.page.cell').removeClass('slideIn');
                $tooltips.show();
                setTimeout(function () {
                    $tooltips.hide();
                }, 2000);
            }
        }
    }
};
var toast = {
    name: 'toast',
    url: '#toast',
    template: '#tpl_toast',
    events: {
        '#showToast': {
            click: function (e) {
                var $toast = $('#toast');
                if ($toast.css('display') != 'none') {
                    return;
                }

                $toast.show();
                setTimeout(function () {
                    $toast.hide();
                }, 2000);
            }
        },
        '#showLoadingToast': {
            click: function (e) {
                var $loadingToast = $('#loadingToast');
                if ($loadingToast.css('display') != 'none') {
                    return;
                }

                $loadingToast.show();
                setTimeout(function () {
                    $loadingToast.hide();
                }, 2000);
            }
        }
    }
};
var dialog = {
    name: 'dialog',
    url: '#dialog',
    template: '#tpl_dialog',
    events: {
        '#showDialog1': {
            click: function (e) {
                var $dialog = $('#dialog1');
                $dialog.show();
                $dialog.find('.weui_btn_dialog').one('click', function () {
                    $dialog.hide();
                });
            }
        },
        '#showDialog2': {
            click: function (e) {
                var $dialog = $('#dialog2');
                $dialog.show();
                $dialog.find('.weui_btn_dialog').one('click', function () {
                    $dialog.hide();
                });
            }
        }
    }
};
var progress = {
    name: 'progress',
    url: '#progress',
    template: '#tpl_progress',
    events: {
        '#btnStartProgress': {
            click: function () {

                if ($(this).hasClass('weui_btn_disabled')) {
                    return;
                }

                $(this).addClass('weui_btn_disabled');

                var progress = 0;
                var $progress = $('.js_progress');

                function next() {
                    $progress.css({width: progress + '%'});
                    progress = ++progress % 100;
                    setTimeout(next, 30);
                }

                next();
            }
        }
    }
};
var msg = {
    name: 'msg',
    url: '#msg',
    template: '#tpl_msg',
    events: {}
};
var article = {
    name: 'article',
    url: '#article',
    template: '#tpl_article',
    events: {}
};
var tab = {
    name: 'tab',
    url: '#tab',
    template: '#tpl_tab',
    events: {
        '.js_tab': {
            click: function () {
                var id = $(this).data('id');
                pageManager.go(id);
            }
        }
    }
};
var navbar = {
    name: 'navbar',
    url: '#navbar',
    template: '#tpl_navbar',
    events: {}
};
var tabbar = {
    name: 'tabbar',
    url: '#tabbar',
    template: '#tpl_tabbar',
    events: {}
};
var actionSheet = {
    name: 'actionsheet',
    url: '#actionsheet',
    template: '#tpl_actionsheet',
    events: {
        '#showActionSheet': {
            click: function () {
                var mask = $('#mask');
                var weuiActionsheet = $('#weui_actionsheet');
                weuiActionsheet.addClass('weui_actionsheet_toggle');
                mask.show().addClass('weui_fade_toggle').one('click', function () {
                    hideActionSheet(weuiActionsheet, mask);
                });
                $('#actionsheet_cancel').one('click', function () {
                    hideActionSheet(weuiActionsheet, mask);
                });
                weuiActionsheet.unbind('transitionend').unbind('webkitTransitionEnd');

                function hideActionSheet(weuiActionsheet, mask) {
                    weuiActionsheet.removeClass('weui_actionsheet_toggle');
                    mask.removeClass('weui_fade_toggle');
                    weuiActionsheet.on('transitionend', function () {
                        mask.hide();
                    }).on('webkitTransitionEnd', function () {
                        mask.hide();
                    })
                }
            }
        }
    }
};
var searchbar = {
    name: "searchbar",
    url: "#searchbar",
    template: '#tpl_searchbar',
    events: {
        '#search_input': {
            focus: function () {
                //searchBar
                var $weuiSearchBar = $('#search_bar');
                $weuiSearchBar.addClass('weui_search_focusing');
            },
            blur: function () {
                var $weuiSearchBar = $('#search_bar');
                $weuiSearchBar.removeClass('weui_search_focusing');
                if ($(this).val()) {
                    $('#search_text').hide();
                } else {
                    $('#search_text').show();
                }
            },
            input: function () {
                var $searchShow = $("#search_show");
                if ($(this).val()) {
                    $searchShow.show();
                } else {
                    $searchShow.hide();
                }
            }
        },
        "#search_cancel": {
            touchend: function () {
                $("#search_show").hide();
                $('#search_input').val('');
            }
        },
        "#search_clear": {
            touchend: function () {
                $("#search_show").hide();
                $('#search_input').val('');
            }
        }
    }
};
var icons = {
    name: 'icons',
    url: '#icons',
    template: '#tpl_icons',
    events: {}
};
var publish = {
    name: 'publish',
    url: '#publish',
    template: '#tpl_publish',
    events: {
        '#confirm': {
            click: function () {
                // var id = $(this).data('id');
                // pageManager.go(id);

                displayPublishList();
            }
        }
    }
};
var publishList = {
    name: 'publishList',
    url: '#publishList',
    template: '#tpl_publishList',
    events: {
        '#confirm': {
            click: function () {
                var id = $(this).data('id');
                pageManager.go(id);
            }
        }
    }
};
var search = {
    name: 'search',
    url: '#search',
    template: '#tpl_search',
    events: {
        '#confirm': {
            click: function () {
                var id = $(this).data('id');
                pageManager.go(id);
            }
        }
    }
};
var searchList = {
    name: 'searchList',
    url: '#searchList',
    template: '#tpl_searchList',
    events: {
        '#confirm': {
            click: function () {
                var id = $(this).data('id');
                pageManager.go(id);
            }
        }
    }
};


//});

var pincar = {
    webChatMenuId: '',
    webChatUserId: '',
    webChatType: '',
    webChatCard: '',
    webChatPhone: '',
    webChatSeat: '',
    webChatStartPoint: '',
    webChatDestination: '',
    webChatTime: '',
    webChatDetail: ''
};
function urlArgs() {

    var args = {};                             // Start with an empty object
    var query = window.location.hash;          //
    var pairs = query.split("&");              // Split at ampersands
    for (var i = 0; i < pairs.length; i++) {    // For each fragment
        var pos = pairs[i].indexOf('=');       // Look for "name=value"
        if (pos == -1) continue;               // If not found, skip it
        var name = pairs[i].substring(0, pos);  // Extract the name
        var value = pairs[i].substring(pos + 1); // Extract the value
        value = decodeURIComponent(value);     // Decode the value
        args[name] = value;                    // Store as a property
        //console.log('name='+name+',value='+value);
    }

    return args;                               // Return the parsed arguments

}

function displayPublishList() {

    var $loadingToast = $('#loadingToast');
    if ($loadingToast.css('display') != 'none') {
        return;
    }
    $loadingToast.show();

    var url = 'http://120.25.196.109/zhaoRen/123';
    var time = '04/04/2016 07:30';
    var data = {
        userId: $("#userId")[0].value,
        type: $("#type")[0].value,
        card: $("#card")[0].value,
        phone: $("#phone")[0].value,
        seat: $("#seat")[0].value,
        startPoint: $("#startPoint")[0].value,
        destination: $("#destination")[0].value,
        detail: $("#detail")[0].value
    };

    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        dataType: 'JSON',
        //jsonp:'callback',
        timeout: 5000,
        context: $('body'),
        //headers: {'access-control-allow-origin':'*'},
        success: function (data) {
            // Supposing this JSON payload was received:
            //   {"project": {"id": 42, "html": "<div>..." }}
            // append the HTML to context object.
            //this.append(data.project.html)
            console.log(JSON.stringify(data));
            //for(var i=1;i<5;i++){console.log(i);};
            var line = "";
            var line1 = "";
            var listHtmlTxt = [];
          //line=line+"<script type='text/html' id='tpl_publishList'>\n";
          //line=line+"<div class='page' >\n";
          //line=line+    "<div class='hd'><h1 class='page_title'>????</h1></div>\n";
            line = line + "<div class='weui_cells weui_cells_access'>\n";
            line = line + " <a class='weui_cell' href='javascript:alert(13761838982);'>\n";
            line = line + "<div class='weui_cell_bd weui_cell_primary'>\n";
            line = line + "<p>03/30/16 7:30</p>\n";
            line = line + "<p>丽都-张江地铁</p>\n";
            line = line + "<p>13761838982</p>\n";
            line = line + "</div>\n";
            line = line + "<div class='weui_cell_ft'>途经高科路地铁站，剩余2个位子</div>\n";
            line = line + "</a>\n";
            line = line + "<a class='weui_cell' href='javascript:alert(\"thanks\");'>\n";
            line = line + " <div class='weui_cell_bd weui_cell_primary'>\n";
            line = line + "<p>03/30/16 18:25</p>\n";
            line = line + "<p>张江高科-丽都</p>\n";
            line = line + "<p>18917285035</p>\n";
            line = line + " </div>\n";
            line = line + " <div class='weui_cell_bd weui_cell_primary'>\n";
            line = line + "<p>途经高科路地铁站，丽都华庭，还剩2个位置</p>\n";
            line = line + " </div>\n";
            line = line + "</a>\n";
            line = line + "</div>  \n";
          //line=line+     "<div class='bd spacing'>\n";
          //line=line+        "<div class='button_sp_area'> \n";
          //line=line+            "<a href='javascript:;' class='weui_btn weui_btn_plain_primary' id='confirm' data-id='publish' >??</a>\n";
          //line=line+       " </div>\n";
          //line=line+    "</div>\n";
          //line=line+"</div>\n";
          //line=line+"</script>\n";

            var carList = {
                data: [
                    {
                        userId: 111,
                        nickname: '小王',
                        mobileNo: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
                    {
                        userId: 222,
                        nickname: '小王',
                        mobileNo: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    }
                ]
            };
            console.log(carList.data.length);
            for (var i = 0; i < carList.data.length; i++) {

                var m = carList.data[i];
                line1 = line1 + "<div class='weui_cells weui_cells_access'>\n";
                line1 = line1 + " <a class='weui_cell' href='javascript:alert(13761838982);'>\n";
                line1 = line1 + "<div class='weui_cell_bd weui_cell_primary'>\n";
                line1 = line1 + "<p>" + m.nickname + " " + m.startPoint + " " + m.destination + " ";
                line1 = line1 + m.time + " " + m.mobileNo + " ";
                line1 = line1 + m.carInfo.brand + " " + m.carInfo.verticallicense + " " + m.carInfo.color + " "
                line1 = line1 + m.carInfo.totalSeatNum + " " + m.carInfo.remainderSeatNum + " ";
                line1 = line1 + "</p>\n";
                line1 = line1 + "</div>\n";
                line1 = line1 + "<div class='weui_cell_ft'>余2个位子</div>\n";
                line1 = line1 + "</a>\n";
                line1 = line1 + "</div>  \n";
            }

            listHtmlTxt.push(line1);
            //console.log(line1);

            $("#publishListResult").html(listHtmlTxt.join("\n"));
            $loadingToast.hide();

        },
        error: function (xhr, type) {
            $loadingToast.hide();
            console.log('error');
            var $tooltips = $('.js_tooltips');
            if ($tooltips.css('display') != 'none') {
                return;
            }

            // 如果有`animation`, `position: fixed`不生效
            //$('.page.cell').removeClass('slideIn');
            $tooltips.show();
            setTimeout(function () {
                $tooltips.hide();
            }, 2000);
        }
    })

}

$(function () {
    console.log('enter-->main');

    var args = {};
    args = urlArgs();
    pincar.webChatMenuId = args.menuId;
    pincar.webChatUserId = args.userId;
    pincar.webChatType = args.type;
    pincar.webChatCard = args.card;
    pincar.webChatPhone = args.phone;
    pincar.webChatSeat = args.seat;
    pincar.webChatStartPoint = args.startPoint;
    pincar.webChatDestination = args.destination;
    pincar.webChatDetail = args.detail;
    pageManager.push(publish)
        .push(publishList)
        .push(search)
        .push(searchList)
        .push(home);
    if (pincar.webChatMenuId == 'zhaoRen') {

        pageManager.setDefault('publish').init();
    }
    else if (pincar.webChatMenuId == 'zhaoChe') {

        pageManager.setDefault('search').init();

    } else {

        pageManager.setDefault('home').init();

    }

    $("#userId")[0].value = pincar.webChatUserId;
    $("#type")[0].value = pincar.webChatType;
    $("#card")[0].value = pincar.webChatCard;
    $("#phone")[0].value = pincar.webChatPhone;
    $("#seat")[0].value = pincar.webChatSeat;
    $("#startPoint")[0].value = pincar.webChatStartPoint;
    $("#destination")[0].value = pincar.webChatDestination;
    $("#detail")[0].value = pincar.webChatDetail;

    console.log('outer-->main');

})

$(document).on('ajaxBeforeSend', function (e, xhr, options) {
    // This gets fired for every Ajax request performed on the page.
    // The xhr object and $.ajax() options are available for editing.
    // Return false to cancel this request.
    console.log('before ajax');
})
$(document).on('ajaxComplete', function (e, xhr, options) {
    // This gets fired for every Ajax request performed on the page.
    // The xhr object and $.ajax() options are available for editing.
    // Return false to cancel this request.
    console.log('after ajax');
})
