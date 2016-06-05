var GET_ORDER_LIST_URL = "/getOrderList";

var config = {
	cur : 'dev',
	dev : {
		domain:'localhost:4000'
	},
	product : {

	}
}

$(function (){

	init();
	refreshOrderList(orderListType);

});

function init(){
	GET_ORDER_LIST_URL = "http://" + config[config.cur].domain + GET_ORDER_LIST_URL;
}


function refreshOrderList(orderType){

	var url = GET_ORDER_LIST_URL;
	var data = {
		type : orderType
	}
	$.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        timeout: 10000,
        context: $('body'),
        success: function (data) {
        	console.log(data);
        	if(data && data.length > 0){
        		var orderItemTemplateId = "";
        		var oderListDiv = $("#order_list ul");
        		if(orderListType == 1){
        			orderItemTemplateId = "template_order_item_zhao_ren";	
        		}else{
        			orderItemTemplateId = "template_order_item_zhao_che";
        		}
        		var orderItemTemplate = $('#' + orderItemTemplateId);
        		for(var i=0;i<data.length;i++){
        			var orderItem = data[i];
        			orderItemTemplate.find('#ol_nick_name').text(orderItem.nickName);
        			orderItemTemplate.find('#ol_tel').text(orderItem.phone);
        			orderItemTemplate.find('#ol_start_point').text(orderItem.startPoint);
        			orderItemTemplate.find('#ol_destination').text(orderItem.destination);
        			orderItemTemplate.find('#ol_start_time').text(orderItem.time);
        			orderItemTemplate.find('#ol_car_type').text(orderItem.carType);
        			orderItemTemplate.find('#ol_card').text(orderItem.card);
        			orderItemTemplate.find('#ol_seat').text(orderItem.seat);
        			orderItemTemplate.find('#ol_detail').text(orderItem.detail);
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