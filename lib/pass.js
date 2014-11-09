var serverPath = 'http://www.local-motion.ca';
var devices;
var historyData=[];
var fileName="";
var app=true;
init();
events();
function init(){
	if(app==true){
		if(typeof localStorage.regID=="undefined"){
		chrome.gcm.register(["155379597538"], function(regID){
			if (chrome.runtime.lastError) {
				// When the registration fails, handle the error and retry the
				// registration later.
				return;
			  }
			  localStorage.regID = regID;
			});
		}
	}
	$(document).bind('ready', function(){
		if(typeof localStorage.email=="undefined"){
			showLogin();
		}
		else if(typeof getUrlParameter("msgID")!="undefined"){
			openMessage(getUrlParameter("msgID"));
		}
		else{
			showSend();
		}
	});
}
function showSend(){
	$('.page').hide();
	$('#sendPage').show();
	$('#header .button').hide();
	$('#header .button.history,#header .button.deviceSettings').show();

	getDevices();
	$("#message").dropzone({
		url: serverPath + "/pass/upload.php",
		maxFiles:1,
		previewsContainer:'.fileUploads',
		dragover : function(){$('#message').css('background','#33B2E3');},
		dragleave : function(){$('#message').css('background','none');},
		drop:function(){
			$('html').height($('.page-container').height()+12);
			if($('#message').text()=="Type message or drag and drop file here"){
				$('#message').text("");
			}
		},
		success : function(file, response){
			fileName=response;
			console.log(response);
			$('#message').css('background','none');
			$('html').height($('#home').height()+12);
		},
		clickable:'#upload',
		headers: {email:localStorage.email}
		});
	if(typeof localStorage.deviceName!="undefined"){
		$('#deviceName').val(localStorage.deviceName);
	}
}
function showLogin(){
	$(".page").hide();
	$("#loginPage").show();
	$('#header .button').hide();
}
function openMessage(id){
	$(".page").hide();
	$("#openMessagePage").show();
	$("#header .buttons").hide();

	var query, postData;

	query = serverPath + "/pass/getMessage.php";
	var text="";
	postData = {
		email:localStorage.email,
		id:id
	};
	$.post( query, postData, function(data){
		data = $.parseJSON(data);
		console.log(data);
		var text="";
		$.each(data, function(index, message){
			var image="";
			if(typeOfMessage(message.fileName)=="image"){
				image = '<div class="image" style="background:url(\'http://www.local-motion.ca/pass/uploads/' + localStorage.email + '/' + message.fileName+'\');"></div>';
			}
			text+='	<div class="history">\
						<div class="date">'+message.dateTime+'</div>\
						<div class="buttons">\
							<div class="button open" data-passIndex="'+index+'"></div>\
							<div class="button send" data-passIndex="'+index+'"></div>\
							<div class="button delete" data-passIndex="'+index+'"></div>\
						</div>\
						<div class="message">'+decodeURIComponent(message.message)+'</div>\
						'+image+'\
					</div>';
		});
		$("#openMessagePage").html(text);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function showHistory(totalLoad){
	$('.page').hide();
	$('#historyPage').show();
	$('#header .button.history').hide();
	$('#header .button.send').show();

	var query, postData;
	if(totalLoad==""){
		totalLoad=20;
	}
	query = serverPath + "/pass/getHistory.php";
	var text="";
	postData = {
		email:localStorage.email,
		totalLoad:totalLoad
	};
	$.post( query, postData, function(data){
		data = $.parseJSON(data);
		console.log(data);
		var text="";
		$.each(data, function(index, historyItem){
			var image="";
			if(typeOfMessage(historyItem.fileName)=="image"){
				image = '<div class="image" style="background:url(\'http://www.local-motion.ca/pass/uploads/' + localStorage.email + '/' + historyItem.fileName+'\');"></div>';
			}
			text+='	<div class="history">\
						<div class="date">'+historyItem.dateTime+'</div>\
						<div class="buttons">\
							<div class="button open" data-passIndex="'+index+'"></div>\
							<div class="button send" data-passIndex="'+index+'"></div>\
							<div class="button delete" data-passIndex="'+index+'"></div>\
						</div>\
						<div class="message">'+decodeURIComponent(historyItem.message)+'</div>\
						'+image+'\
					</div>';
			historyData.push(historyItem);
		});
		console.log(historyData);
		$("#historyPage").html(text);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
function send(message){
	var query, postData;
	var storedDevices =[];
	if(typeof localStorage.storedDevices!="undefined"){
		storedDevices = $.parseJSON(localStorage.storedDevices);
	}
	if(message==null){
		message = $('#message').text();
	}


	$.each(storedDevices, function(index, device){
		if(device.type=="chrome"){
			query = serverPath + "/pass/sendChrome.php";
		}
		else if(device.type=="android"){
			query = serverPath + "/pass/sendAndroid.php";
		}

		postData = {
		message:encodeURIComponent(message),
		targetID:device.targetID,
		fileName:fileName,
		email:localStorage.email
		};

	$.post( query, postData, function(data){
	console.log(data);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
	});

}
function login(){

	var query, postData;

	query = serverPath + "/pass/signinUser.php";

	postData = {
		email:$('#email').val(),
		password:$('#password').val(),
		targetID : localStorage.regID,
		type : "chrome",
		};

	$.post( query, postData, function(data){
		data = $.parseJSON(data);
		$( "#popUp" ).html(data.message).popup( "open");
		if(data.code===0){
			$("#loginPage").slideUp();
			$("#sendPage").slideDown();
			localStorage.email = $('#email').val();
			getDevices();
			$("deviceName").val("");
			$("#header .buttons").show();
		}
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function register(){
	var query, postData;
	query = serverPath + "/pass/regUser.php";
	postData = {
		email:$('#email').val(),
		password:$('#password').val(),
		targetID : localStorage.regID,
		type : "chrome",
		};

	$.post( query, postData, function(data){
		console.log(data);
		data = $.parseJSON(data);
		$( "#popUp" ).html(data.message).popup( "open");
		if(data.code===0){
			$("#loginPage").slideUp();
			$("#sendPage").slideDown();
			localStorage.email = $('#email').val();
		}

	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function getDevices(){
	var query, postData;
	var storedDevices =[];
	if(typeof localStorage.storedDevices!="undefined"){
		storedDevices = $.parseJSON(localStorage.storedDevices);
	}
	query = serverPath + "/pass/getDevices.php";
	var text="";
	postData = {
		email:localStorage.email
		};
	
	$.post( query, postData, function(data){
		data = $.parseJSON(data);
		console.log(data);
		devices = data;
		text+='<div class="ui-block-a">\
					<div class="device" data-index="999">\
						<div class="img" style="background-image: url(\'images/cloud_black.png\');background-size: cover;"></div>\
						<h2>cloud</h2>\
					</div>\
				</div>';
		$.each(data, function(index, device){
			var position = index % 3;
			var block="";
			var active="";
			var image="";
			var deviceName=device.type;
			$.each(storedDevices, function(storedIndex, storedDevice){
				if(storedDevice.targetID==device.targetID){
					active="active";
				}
			});

			if(position==0){block="b";}
			else if(position==1){block="c";}
			else if(position==2){block="d";}

			if(device.type=="chrome"){
				image="computer_black.png";
			}
			else if(device.type=="android"){
				image="phone_black.png";
			}
			
			if(typeof localStorage.regID!="undefined"){
				 if (localStorage.regID==device.targetID){
					return true;
				}
			}
			
			if(device.name!=""){
				deviceName = device.name;
			}

 			text+='<div class="ui-block-'+block+'">\
					<div class="device '+active+'" data-index="'+index+'">\
						<div class="buttons">\
							<div class="button-back name" data-index="'+index+'"><div class="button name white"></div></div>\
							<div class="button-back delete" data-index="'+index+'"><div class="button delete white"></div></div>\
						</div>\
						<div class="img" style="background-image: url(\'images/'+image+'\');background-size: cover;"></div>\
						<h2>'+deviceName+'</h2>\
					</div>\
				</div>';
		});

		$("#devices").html(text);
		$('html').height($('.page-container').height()+12);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function deviceSelect(element){
	var storedDevices =[];
	if(typeof localStorage.storedDevices!="undefined"){
		storedDevices = $.parseJSON(localStorage.storedDevices);
	}

	var index = element.attr("data-index");
	var selectedDevice = devices[index];
	$('.device').removeClass('active');
	element.addClass("active");

	storedDevices[0]={type:selectedDevice.type, targetID: selectedDevice.targetID};
	localStorage.storedDevices = JSON.stringify(storedDevices);
}
function clearMessagePlaceholder(element){
	if(element.html()=="Type message or drag and drop file here"){
		element.html("");
	}
}
function changeThisDeviceName(event){
	if(event.keyCode!=13){
		return true;
	}
	var deviceName = $('#deviceName').val();
	var targetID=localStorage.regID;
	changeDeviceName(deviceName, targetID);
}
function changeAnotherDevice(element){
	if(event.keyCode!=13){
		return true;
	}
	var deviceName = $('#deviceName').val();
	var targetID=localStorage.regID;
	changeDeviceName(deviceName, targetID);
}
function changeDeviceName(deviceName, targetID){
	var query, postData;
	query = serverPath + "/pass/changeDeviceName.php";
	postData = {
		targetID : targetID,
		deviceName : deviceName,
		};

	$.post( query, postData, function(data){
		console.log(data);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
	localStorage.deviceName = deviceName;
}
function deleteDevice(element){
	var index = element.attr("data-index");
	var query = serverPath + "/pass/deleteDevice.php";
	var text="";
	postData = {
		email:localStorage.email,
		targetID:devices[index].targetID
	};

	$.post( query, postData, function(data){
		console.log(data);
		getDevices();
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
}
function sendHistory(element){
	var index = element.attr('data-passIndex');
	console.log(index);
	fileName = historyData[index].fileName;
	send(historyData[index].message);
}
function sendOpenMessage(element){
	var index = element.attr('data-passIndex');
	console.log(index);
	var id = historyData[index].id;
	openMessage(id);
}
function typeOfMessage(fileName) {
	var type;
	if (fileName.search(".jpg") !=-1 || fileName.search(".jpeg") !=-1 ||fileName.search(".gif") !=-1 || fileName.search(".png") !=-1){
		type =  "image";
	} else if (fileName!="") {
		type =  "file";
	} else {
		type =  "text";
	}
	return type;
}
function events(){
	$( document ).on( "tap", '#send', function( e ) {send();});
	$( document ).on( "tap", '#login', function( e ) {login();});
	$( document ).on( "tap", '#reg', function( e ) {register();});
	$( document ).on( "tap", '.device', function( e ) {deviceSelect($(this));});
	$( document ).on( "tap", '#message', function( e ) {clearMessagePlaceholder($(this));});;
	$( document ).on( "keypress", '#deviceName', function( e ) {changeThisDeviceName(e);});
	$( document ).on( "tap", '#header .button.history', function( e ) {showHistory("")});
	$( document ).on( "tap", '#header .button.send', function( e ) {showSend()});
	$( document ).on( "tap", '#header .button.deviceSettings', function( e ) {$('.device .button-back').addClass('visible');});
	$( document ).on( "tap", '#header .button.logout', function( e ) {localStorage.clear;location.reload();});
	$( document ).on( "tap", '#clear', function( e ) {$('#message').html("");});
	$( document ).on( "tap", '.history .button.send', function( e ) {sendHistory($(this));});
	$( document ).on( "tap", '.history .button.open', function( e ) {sendOpenMessage($(this));});
	$( document ).on( "tap", '.device .button-back.name', function( e ) {changeAnotherDevice($(this));});
	$( document ).on( "tap", '.device .button-back.delete', function( e ) {deleteDevice($(this));});
}