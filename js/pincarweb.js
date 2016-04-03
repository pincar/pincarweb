/**
 * Created by jf on 2015/9/11.
 */

$(function () {

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
                    self._back(page);//todo
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
            this._pageIndex ++;

            history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

            var html = $(config.template).html();
			if(pincar.html) {
				html=pincar.html;
				//pincar.html=null;
			}
			
            var $html = $(html).addClass('slideIn').addClass(config.name);
			//$html = $(config.template)
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
            this._pageIndex --;

            var stack = this._pageStack.pop();
            if (!stack) {
                return;
            }

            var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
            var found = this._findInStack(url);
            if (!found) {
                var html = $(config.template).html();
				if(pincar.html){
					html=pincar.html;
					//pincar.html=null;
				}
				
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
            for(var i = 0, len = this._pageStack.length; i < len; i++){
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
                click: function (){
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
        name:"searchbar",
        url:"#searchbar",
        template: '#tpl_searchbar',
        events:{
            '#search_input':{
                focus:function(){
                    //searchBar
                    var $weuiSearchBar = $('#search_bar');
                    $weuiSearchBar.addClass('weui_search_focusing');
                },
                blur:function(){
                    var $weuiSearchBar = $('#search_bar');
                    $weuiSearchBar.removeClass('weui_search_focusing');
                    if($(this).val()){
                        $('#search_text').hide();
                    }else{
                        $('#search_text').show();
                    }
                },
                input:function(){
                    var $searchShow = $("#search_show");
                    if($(this).val()){
                        $searchShow.show();
                    }else{
                        $searchShow.hide();
                    }
                }
            },
            "#search_cancel":{
                touchend:function(){
                    $("#search_show").hide();
                    $('#search_input').val('');
                }
            },
            "#search_clear":{
                touchend:function(){
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
                    var id = $(this).data('id');					
					pincar.publish();//.after(function(){pageManager.go(id);});					
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
	
	var findCar = {
        name: 'findCar',
        url: '#findCar',
        template: '#tpl_findCar',		
        events: {
		    '#find': {
                click: function () {
                    var id = $(this).data('id');					
					pincar.findCar();//.after(function(){pageManager.go(id);});					
                }
			}
		}
    };
	
	var carList = {
        name: 'carList',
        url: '#carList',
        template: '#tpl_carList'        
    };
	
	
	pageManager.push(publish)
	.push(publishList)
	.push(search)
	.push(searchList)
	.push(findCar).push(carList);
	window.pageManager = pageManager;
	//.setDefault('publish')
    //.init(); 
   /* pageManager.push(home)
        .push(button)
        .push(cell)
        .push(toast)
        .push(dialog)
        .push(progress)
        .push(msg)
        .push(article)
        .push(tab)
        .push(navbar)
        .push(tabbar)
        .push(panel)
        .push(actionSheet)
        .push(icons)
        .push(searchbar)
        .setDefault('home')
        .init(); */
		
});

function urlArgs() {
    var args = {};                             // Start with an empty object
    var searchStr = window.location.search;	
	if(searchStr == null || searchStr.length<2){
		return args;
	}
	var query = window.location.search.substring(1);  // Get query string, minus '?'
    var pairs = query.split("&");              // Split at ampersands
    for(var i = 0; i < pairs.length; i++) {    // For each fragment
        var pos = pairs[i].indexOf('=');       // Look for "name=value"
        if (pos == -1) continue;               // If not found, skip it
        var name = pairs[i].substring(0,pos);  // Extract the name
        var value = pairs[i].substring(pos+1); // Extract the value
        value = decodeURIComponent(value);     // Decode the value
        args[name] = value;                    // Store as a property
    }
    return args;                               // Return the parsed arguments
}

var pincar ={webchatUserid:'',  
  afterHandler: [],
  after: function(f){
	  this.afterHandler.push(f);
  },
  findCar: function(){
		//console.log(window.location.pathname);
		var findCarServReq ={};
		findCarServReq.startPoint=$("#zhaoche_startPoint").val();
		findCarServReq.destination=$("#zhaoche_destination").val();
		findCarServReq.time=$("#zhaoche_time").val();
		var findCarUrl= "http://120.25.196.109/zhaoChe/"+this.webchatUserid;
		$.ajax({
			url:findCarUrl,
			data:findCarServReq,
			type:"POST",
			dataType:"json",
			success: pincar.findCarSuccess
			}
		);
	  return this;
  },
  findCarSuccess: function(msg, status, xhr) {
		console.log("findCar success");	
		console.log(JSON.stringify(msg));
		/*
		res result://success ,http code:200
    {
        data : [{
                    userId : 111,//车主id
                    nickname : '',
                    mobileNo : 139xxxx1234 ,
                    startPoint:'',
                    destination:'',
                    time : '2016-02-24 21:00',//出发时间
                    carInfo : {//车主的车子信息
                        id : 111,//carId in our system
                        brand:'',
                        verticallicense:'',//隐藏中间3位
                        color:'',
                        totalSeatNum:3,
                        remainderSeatNum:1,
                        status : 1 //1:等待中 2：满员了 3：异常了（车主取消了或
                            者其他意外情况）
                    }
               }]
    }  */
		var listHtmlTxt = [];
		for (var i=0; i<msg.data.length; i++) {
			var m = msg.data[i];		
			var line = "<a class=\"weui_cell\" href=\"tel:"+m.mobileNo+
			 "\"><div class=\"weui_cell_bd weui_cell_primary\">"+
			"<p>"+m.time+", "+m.startpoint+"到"+m.destination+", "+m.mobileNo+"</p></div></a>";		
			listHtmlTxt.push(line);			
		}
		
		//$("#findResultList").html(listHtmlTxt.join("\n"));
		var carListhtml ="<div class=\"page\"><div class=\"hd\"><h1 class=\"page_title\">车子信息</h1></div>"+
     "<div class=\"weui_cells weui_cells_access\">";
		carListhtml+=listHtmlTxt.join("\n");
		carListhtml +="</div></div>";
		
		pincar.carListhtml=carListhtml;
  },
  publish: function(){
	  
	//console.log($("#test").name);
	var pubCarServReq ={};
	//$("#publishCarServiceForm select[name='cartype']").val();
	pubCarServReq.startPoint=$("#pub_startPoint").val();
	pubCarServReq.destination=$("#pub_destination").val();
	pubCarServReq.time=$("#pub_time").val();
	pubCarServReq.sex=$("#pub_sex").val();
	pubCarServReq.remainderSeatNum=$("#pub_remainderSeatNum").val();
	//pubCarServReq.userId = $("body").data("userToken").userId;
	var pubUrl= "/zhaoren?userid="+this.webchatUserid;
	/*$.ajax({
		url:pubUrl,
		data:pubCarServReq,
		type:"POST",
		dataType:"json",
		success: pincar.pubSuccess
	});*/
	/*var pubUrl= "http://120.25.196.109/zhaoRen/"+this.webchatUserid+"?callback=?";
	
	$.ajaxJSONP({
		url:pubUrl,
		data:pubCarServReq,
		success: pincar.pubSuccess
	});*/
	//var pubUrl= "http://120.25.196.109/zhaoRen/"+this.webchatUserid;
	$.ajax({
		url:pubUrl,
		data:pubCarServReq,
		type:"POST",
		dataType:"json",
		success: pincar.pubSuccess
	});
	return this;
}, pubSuccess : function (msg, status, xhr) {
		console.log("pub success");	
		/*{data : [
				{
					userId : 111,
					nickname : '',
					startpoint : '',
					destination : '',
					time : '',
					mobileNo : '138xxxx1234'
				}
		]"}*/
		console.log(JSON.stringify(msg));
		var listHtmlTxt = [];
		for (var i=0; i<msg.data.length; i++) {
			var m = msg.data[i];		
			var line = "<a class=\"weui_cell\" href=\"tel:"+m.mobileNo+
			 "\"><div class=\"weui_cell_bd weui_cell_primary\">"+
			"<p>"+m.time+", "+m.startpoint+"到"+m.destination+", "+m.mobileNo+"</p></div></a>";		
			listHtmlTxt.push(line);
			console.log("matched request:"+line);	
		}
		
		//$("#pubResultList").html(listHtmlTxt.join("\n"));
		var pubRSHtml ="<div class=\"page\"><div class=\"hd\"><h1 class=\"page_title\">发布成功</h1></div>"+
     "<div class=\"weui_cells weui_cells_access\">";
		pubRSHtml+=listHtmlTxt.join("\n");
		pubRSHtml +="</div></div>";
		//pincar.html=pubRSHtml;
		//$("#tpl_publish").html(pubRSHtml);
		$("#publishListResult").html("<div class=\"weui_cells weui_cells_access\">"+listHtmlTxt.join("\n")+"</div>");
		pageManager.go('publish');
        /*if(pincar.afterHandler.length>0){
			for(var i=0;i<pincar.afterHandler.length;i++){
				pincar.afterHandler[i]();
			}
		}*/		
	}
};

$(function (){
	var args = urlArgs();
    if('userid' in args){
		pincar.webchatUserid=args.userid;
		console.log('you are '+pincar.webchatUserid);	
	}	
	//pincar.webchatUserid=('userid' in args) && args.userid;
	//console.log('you are '+pincar.webchatUserid);	
	pageManager.setDefault('publish')//findCar
	.init(); 
})