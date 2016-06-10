var GET_ORDER_LIST_URL = "/getOrderList";

var config = {
	cur : 'dev',
	dev : {
		domain:'localhost:4000'
	},
	product : {
		domain:'www.52pincar.com'
	}
}

var curPageNo = 0;

$(function (){

	init();
	refreshOrderList();

});

function init(){
	GET_ORDER_LIST_URL = "http://" + config[config.cur].domain + GET_ORDER_LIST_URL;
	$('#order_list #countTips').hide();
	$('#order_list #more').click(function(){
		curPageNo++;
		refreshOrderList();
	});

	$('#order_type_choose [name=order_type_selector]').click(function(){
		curPageNo = 0;
		var oderListDiv = $("#order_list ul");
		oderListDiv.html("");
		refreshOrderList();
	});
}


function refreshOrderList(){
	var orderType = $('#order_type_choose [name=order_type_selector]:checked').val();
	var url = GET_ORDER_LIST_URL;
	var data = {
		type : orderType,
		pageNo : curPageNo 
	};
	$.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        timeout: 10000,
        context: $('body'),
        success: function (data) {
        	console.log(data);
        	var count = data.count;
        	var more = data.more;
        	data = data.list;

        	if(count == 0 && curPageNo == 0){
        		$('#order_list #countTips').show();
        		$('#order_list #countTips').text("当前没有记录");
        	}

        	if(more == 1){
        		$('#order_list #more').show();
        	}else{
        		$('#order_list #more').hide();
        	}

        	if(data && data.length > 0){
        		var orderItemTemplateId = "";
        		var oderListDiv = $("#order_list ul");
        		if(orderType == 1){
        			orderItemTemplateId = "template_order_item_zhao_ren";	
        		}else{
        			orderItemTemplateId = "template_order_item_zhao_che";
        		}
        		
        		for(var i=0;i<data.length;i++){
        			var orderItemTemplate = $('#' + orderItemTemplateId).html();
        			orderItemTemplate = $(orderItemTemplate);
        			var orderItem = data[i];
        			orderItemTemplate.find('#ol_nick_name').text(orderItem.nickName);
        			orderItemTemplate.find('#ol_tel').text(orderItem.phone);
        			orderItemTemplate.find('#ol_start_point').text(orderItem.startPoint);
        			orderItemTemplate.find('#ol_destination').text(orderItem.destination);
        			orderItemTemplate.find('#ol_start_time').text(orderItem.time);
        			
        			orderItemTemplate.find('#ol_detail').text(orderItem.detail);

        			orderItemTemplate.find('#ol_call').href="tel:" + orderItem.phone;
        			

        			if(orderType == 1){
        				orderItemTemplate.find('#ol_car_type').text(orderItem.carType);
        				orderItemTemplate.find('#ol_card').text(orderItem.card);
        				orderItemTemplate.find('#ol_seat').text(orderItem.seat);
        			}

        			oderListDiv.append(orderItemTemplate);	
        		}
        	}
        },
        error: function (xhr, type) {
            console.log('error');

        },
		complete: function(){
			console.log('adjax done');
		}
	});
}