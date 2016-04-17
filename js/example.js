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
			initial(page);
        });

        if (history.state && history.state._pageIndex) {
            this._pageIndex = history.state._pageIndex;
        }

        this._pageIndex--;

        var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
        var page = self._find('url', url) || self._defaultPage;
        this._go(page);
		initial(page);
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

var search = {
    name: 'search',
    url: '#search',
    template: '#tpl_search',
    events: {
        '#confirm': {
            click: function () {
                //var id = $(this).data('id');
                //pageManager.go(id);
				displaySearchList();
            }
        }
    }
};

var orderList = {
    name: 'orderList',
    url: '#orderList',
    template: '#tpl_orderList',
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
    webChatDetail: '',
	webChatId:''
};
function initial(page){

	if (pincar.webChatMenuId == 'zhaoRen') {

    if($("#userId")[0]!=undefined)
    $("#userId")[0].value = pincar.webChatUserId;
	if($("#type")[0]!=undefined)
    $("#type")[0].value = pincar.webChatType;
	if($("#card")[0]!=undefined)
    $("#card")[0].value = pincar.webChatCard;
	if($("#phone")[0]!=undefined)
    $("#phone")[0].value = pincar.webChatPhone;
	if($("#seat")[0]!=undefined)
    $("#seat")[0].value = pincar.webChatSeat;
	if($("#startPoint")[0]!=undefined)
    $("#startPoint")[0].value = pincar.webChatStartPoint;
	if($("#destination")[0]!=undefined)
    $("#destination")[0].value = pincar.webChatDestination;
	if($("#detail")[0]!=undefined)
    $("#detail")[0].value = pincar.webChatDetail;
	if($("#time")[0]!=undefined)
    $("#time")[0].value = pincar.webChatTime;
    }
    else if (pincar.webChatMenuId == 'zhaoChe') {

    if($("#userIdZhaoChe")[0]!=undefined)
    $("#userIdZhaoChe")[0].value = pincar.webChatUserId;
	if($("#typeZhaoChe")[0]!=undefined)
    $("#typeZhaoChe")[0].value = pincar.webChatType;
	if($("#cardZhaoChe")[0]!=undefined)
    $("#cardZhaoChe")[0].value = pincar.webChatCard;
	if($("#phoneZhaoChe")[0]!=undefined)
    $("#phoneZhaoChe")[0].value = pincar.webChatPhone;
	if($("#seatZhaoChe")[0]!=undefined)
    $("#seatZhaoChe")[0].value = pincar.webChatSeat;
	if($("#startPointZhaoChe")[0]!=undefined)
    $("#startPointZhaoChe")[0].value = pincar.webChatStartPoint;
	if($("#destinationZhaoChe")[0]!=undefined)
    $("#destinationZhaoChe")[0].value = pincar.webChatDestination;
	if($("#detailZhaoChe")[0]!=undefined)
    $("#detailZhaoChe")[0].value = pincar.webChatDetail;
	if($("#timeZhaoChe")[0]!=undefined)
    $("#timeZhaoChe")[0].value = pincar.webChatTime;

    } else if (pincar.webChatMenuId == 'mine') {
	
    if($("#userIdMine")[0]!=undefined)
    $("#userIdMine")[0].value = pincar.webChatUserId;
	if($("#typeMine")[0]!=undefined)
    $("#typeMine")[0].value = pincar.webChatType;
	if($("#cardMine")[0]!=undefined)
    $("#cardMine")[0].value = pincar.webChatCard;
	if($("#phoneMine")[0]!=undefined)
    $("#phoneMine")[0].value = pincar.webChatPhone;
	if($("#seatMine")[0]!=undefined)
    $("#seatMine")[0].value = pincar.webChatSeat;
	if($("#startPointMine")[0]!=undefined)
    $("#startPointMine")[0].value = pincar.webChatStartPoint;
	if($("#destinationMine")[0]!=undefined)
    $("#destinationMine")[0].value = pincar.webChatDestination;
	if($("#detailMine")[0]!=undefined)
    $("#detailMine")[0].value = pincar.webChatDetail;
	if($("#timeMine")[0]!=undefined)
    $("#timeMine")[0].value = pincar.webChatTime;

    } else {

       null;

    }
}
function urlArgs() {

    var args = {};                             // Start with an empty object
    var query = window.location.hash;          //
    var pairs = query.split("#");              // Split at ampersands
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

function goto(page,userId,phone,startPoint,destination,time) {

   if(page.name=='publish'){
    pincar.webChatMenuId = 'zhaoRen';
    pincar.webChatUserId = userId;
    //pincar.webChatType = args.type;
    //pincar.webChatCard = args.card;
    pincar.webChatPhone = phone;
    //pincar.webChatSeat = args.seat;
    pincar.webChatStartPoint = startPoint;
    pincar.webChatDestination = destination;
    //pincar.webChatDetail = args.detail;
    pincar.webChatTime = time;
    pageManager.go('publish');
   }else if(page.name=='search'){
   pageManager.go('search');
   };
   

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
    pincar.webChatTime = args.time;
    pageManager.push(publish)
        .push(search)
        .push(orderList)
        .push(home);
    if (pincar.webChatMenuId == 'zhaoRen') {

        pageManager.setDefault('publish').init();
    }
    else if (pincar.webChatMenuId == 'zhaoChe') {

        pageManager.setDefault('search').init();

    } else if (pincar.webChatMenuId == 'mine') {
	
        displayOrderList();
        pageManager.setDefault('orderList').init();

    } else {

        pageManager.setDefault('home').init();

    }
	
    console.log('outer-->main');

})


function displayPublishList() {

    var $loadingToast = $('#loadingToast');
    if ($loadingToast.css('display') != 'none') {
        return;
    }
    $loadingToast.show();

    var urlServer = 'http://120.25.196.109/zhaoRen/123'+$("#userId")[0].value;
    var url = 'http://192.168.31.151/zhaoRen/'+$("#userId")[0].value;
    var urlLocalTomcat='http://192.168.30.148:8080/WebRoot/servlet/PinCarServlet';
    //var time = '04/04/2016 07:30';
    var data = {
        userId: $("#userId")[0].value,
        type: $("#type")[0].value,
        card: $("#card")[0].value,
        phone: $("#phone")[0].value,
        seat: $("#seat")[0].value,
        startPoint: $("#startPoint")[0].value,
        destination: $("#destination")[0].value,
        detail: $("#detail")[0].value,
        time: $("#time")[0].value,
		id:pincar.webChatId
    };

    $.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        //jsonp:'callback',
        timeout: 10000,
        context: $('body'),
        //headers: {'access-control-allow-origin':'*'},
        success: function (data) {
            // Supposing this JSON payload was received:
            //   {"project": {"id": 42, "html": "<div>..." }}
            // append the HTML to context object.
            //this.append(data.project.html)
            console.log(JSON.stringify(data));
            //var data1 = data.responseXML;
            //var data1 = JSON.parse(data);
            // do nothing if we don't have initial values or we got error
           
            var line = "";
            var line1 = "";
            var listHtmlTxt = [];
			pincar.webChatId=data.order.id;
			console.log(JSON.stringify(data.order.id));
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
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
                    {
                        userId: 222,
                        nickname: '小王',
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
					{
                        userId: 333,
                        nickname: '小王',
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
                ]
            };

           // for (var i = 0; i < carList.data.length; i++) {
            for (var i = 0; i < data.data.length; i++) {
                //var m = carList.data[i];
				var m = data.data[i];
                line1 = line1 + "<div class='weui_cells weui_cells_access'>\n";
                line1 = line1 + " <a class='weui_cell' href='javascript:alert(13761838982);'>\n";
                line1 = line1 + "<div class='weui_cell_bd weui_cell_primary'>\n";
                line1 = line1 + "<p>" +"从"+ " " + m.startPoint + " 到 " + m.destination + " ";
                line1 = line1 + m.time + " " + m.phone + " ";
//                line1 = line1 + m.carInfo.brand + " " + m.carInfo.verticallicense + " " + m.carInfo.color + " "
//                line1 = line1 + m.carInfo.totalSeatNum + " " + m.carInfo.remainderSeatNum + " ";
                line1 = line1 + "</p>\n";
                line1 = line1 + "</div>\n";
                line1 = line1 + "<div class='weui_cell_ft'>" +m.detail+ "</div>\n";
                line1 = line1 + "</a>\n";
                line1 = line1 + "</div>  \n";
            }

            listHtmlTxt.push(line1);


            $("#publishListResult").html(listHtmlTxt.join("\n"));
			$("#confirm")[0].scrollIntoView();
           // $loadingToast.hide();

        },
        error: function (xhr, type) {
            //$loadingToast.hide();
            console.log('error');
            var $tooltips = $('.js_tooltips');
            if ($tooltips.css('display') != 'none') {
                return;
            }
            $tooltips.show();
            setTimeout(function () {
                $tooltips.hide();
            }, 2000);
        },
		complete: function(){
			console.log('adjax done');
			$("#loadingToast").hide();
		}
    })

}
function displaySearchList() {

    var $loadingToast = $('#loadingToast');
    if ($loadingToast.css('display') != 'none') {
        return;
    }
    $loadingToast.show();

    var urlServer = 'http://120.25.196.109/zhaoRen/'+$("#userIdZhaoChe")[0].value;
    var url = 'http://192.168.31.151/zhaoChe/'+$("#userIdZhaoChe")[0].value;
    var urlLocalTomcat='http://192.168.30.148:8080/WebRoot/servlet/PinCarServlet';
    //var time = '04/04/2016 07:30';
    var data = {
        userId: $("#userIdZhaoChe")[0].value,
        phone: $("#phoneZhaoChe")[0].value,
        startPoint: $("#startPointZhaoChe")[0].value,
        destination: $("#destinationZhaoChe")[0].value,
        detail: $("#detailZhaoChe")[0].value,
        time: $("#timeZhaoChe")[0].value,
		id:pincar.webChatId
    };

    $.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        timeout: 10000,
        context: $('body'),
        success: function (data) {
		
           console.log(JSON.stringify(data));
            var line = "";
            var line1 = "";
            var listHtmlTxt = [];
			pincar.webChatId=data.order.id;
			console.log(JSON.stringify(data.order.id));
            for (var i = 0; i < data.data.length; i++) {
                
				var m = data.data[i];
                line1 = line1 + "<div class='weui_cells weui_cells_access'>\n";
                line1 = line1 + " <a class='weui_cell' href='javascript:alert(13761838982);'>\n";
                line1 = line1 + "<div class='weui_cell_bd weui_cell_primary'>\n";
                line1 = line1 + "<p>" +"从"+ " " + m.startPoint + " 到 " + m.destination + " ";
                line1 = line1 + m.time + " " + m.phone + " ";
//                line1 = line1 + m.carInfo.brand + " " + m.carInfo.verticallicense + " " + m.carInfo.color + " "
//                line1 = line1 + m.carInfo.totalSeatNum + " " + m.carInfo.remainderSeatNum + " ";
                line1 = line1 + "</p>\n";
                line1 = line1 + "</div>\n";
                line1 = line1 + "<div class='weui_cell_ft'>" +m.detail+ "</div>\n";
                line1 = line1 + "</a>\n";
                line1 = line1 + "</div>  \n";
            }

            listHtmlTxt.push(line1);


            $("#searchListResult").html(listHtmlTxt.join("\n"));
			$("#confirm")[0].scrollIntoView();

        },
        error: function (xhr, type) {
            console.log('error');
            var $tooltips = $('.js_tooltips');
            if ($tooltips.css('display') != 'none') {
                return;
            }
            $tooltips.show();
            setTimeout(function () {
                $tooltips.hide();
            }, 2000);
        },
		complete: function(){
			console.log('adjax done');
			$("#loadingToast").hide();
		}
    })

}
function displayOrderList() {

    var urlServer = 'http://120.25.196.109/zhaoRen/'+pincar.webChatUserId;
    var url = 'http://192.168.31.151/zhaoChe/'+pincar.webChatUserId;
    var urlLocalTomcat='http://192.168.30.148:8080/WebRoot/servlet/PinCarServlet';
    //var time = '04/04/2016 07:30';
    var data = {
        userId: pincar.webChatUserId
    };

    $.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        timeout: 10000,
        context: $('body'),
        success: function (data) {

            console.log(JSON.stringify(data));

           
            var line = "";
            var line1 = "";
            var listHtmlTxt = [];

            var carList = {
                data: [
                    {
                        userId: 111,
                        nickname: '小王',
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
                    {
                        userId: 222,
                        nickname: '小王',
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
					{
                        userId: 333,
                        nickname: '小王',
                        phone: 13575600911,
                        startPoint: "丽都",
                        destination: '金科路',
                        time: '2016-03-04 7:50',
						detail:'还剩两个位子',
                        carInfo: {
                            id: 123, brand: '大众', verticallicense: '沪E 6***7',
                            color: '白色', totalSeatNum: 4,
                            remainderSeatNum: 2, status: 1
                        }
                    },
                ]
            };

            //for (var i = 0; i < carList.data.length; i++) {
            for (var i = 0; i < data.data.length; i++) {
               // var m = carList.data[i];
				var m = data.data[i];
                line1 = line1 + "<div class='weui_cells weui_cells_access'>\n";
                line1 = line1 + " <a class='weui_cell' href='javascript:goto(publish,\"lixj\",13761838982,\"丽都\",\"广兰路\",\"04/04/2016 07:30\");'>\n";
                line1 = line1 + "<div class='weui_cell_bd weui_cell_primary'>\n";
                line1 = line1 + "<p>" +"从"+ " " + m.startPoint + " 到 " + m.destination + " ";
                line1 = line1 + m.time + " " + m.phone + " ";
//                line1 = line1 + m.carInfo.brand + " " + m.carInfo.verticallicense + " " + m.carInfo.color + " "
//                line1 = line1 + m.carInfo.totalSeatNum + " " + m.carInfo.remainderSeatNum + " ";
                line1 = line1 + "</p>\n";
                line1 = line1 + "</div>\n";
                line1 = line1 + "<div class='weui_cell_ft'>" +m.detail+ "</div>\n";
                line1 = line1 + "</a>\n";
                line1 = line1 + "</div>  \n";
            }

            listHtmlTxt.push(line1);


            $("#orderListResult").html(listHtmlTxt.join("\n"));
			//$("#confirm")[0].scrollIntoView();
           // $loadingToast.hide();

        },
        error: function (xhr, type) {
            //$loadingToast.hide();
            console.log('error');
            
        },
		complete: function(){
			console.log('adjax done');
			//$("#loadingToast").hide();
		}
    })

}
//-----------------------------------------------------------------------------
//Create a object array from XML doc, the attribute name is the same as
//the tag name in XML
//-----------------------------------------------------------------------------
function parseXML(xmlDoc) {
 var rsArray = new Array();

 root = xmlDoc.documentElement;
 if (root == null) {
     // report error if Ajax response is null
     //alert('appException.unexpected.error');
 }
 else {
     // parse values in each row
     var rows = root.getElementsByTagName("ROW");
     if (rows != null) {
         var rowCount = rows.length;
         if (rowCount > 0) {
             var colCount = rows.item(0).childNodes.length;

             for (var i = 0; i < rowCount; i++) {
                 /* Create object for each row */
                 var oRow = new Object();
                 var row = rows.item(i);
                 /* Loop through columns */
                 for (var j = 0; j < colCount; j++) {
                     var colName = row.childNodes.item(j).tagName;
                     var dataValue = row.childNodes.item(j).textContent;
                     //console.log("oRow." + colName + "='" + dataValue + "'");
                     eval("oRow." + colName + "='" + dataValue + "'");
                 }
                 rsArray[i] = oRow;
             }
         }
     }
 }

 return rsArray;
}
$(document).on('ajaxBeforeSend', function (e, xhr, options) {
    // This gets fired for every Ajax request performed on the page.
    // The xhr object and $.ajax() options are available for editing.
    // Return false to cancel this request.
    console.log('before ajax');
})
//$(document).on('ajaxComplete', function (e, xhr, options) {
    // This gets fired for every Ajax request performed on the page.
    // The xhr object and $.ajax() options are available for editing.
    // Return false to cancel this request.
   // console.log('after ajax');
    //$loadingToast.hide();
//})
