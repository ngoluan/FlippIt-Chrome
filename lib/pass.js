var serverPath = 'http://www.local-motion.ca';
var devices;
var historyData=[];
var fileName="";
var app=false;
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
	$(document).bind('pageshow', function(){
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
	$('#header .button.history').show();
	$('#header .button.send').hide();

	getDevices();
	$("#message").dropzone({
		url: serverPath + "/pass/upload.php",
		maxFiles:1,
		previewsContainer:'.fileUploads',
		dragover : function(){$('#message').css('background','#33B2E3');},
		dragleave : function(){$('#message').css('background','none');},
		drop:function(){$('html').height('600');},
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
	$("#header .buttons").hide();
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
function getUrlParameter(sParam)
{
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

			if(position==0){block="a";}
			else if(position==1){block="b";}
			else if(position==2){block="c";}

			if(device.type=="chrome"){
				image="computerIcon.png";
			}
			else if(device.type=="android"){
				image="phoneIcon.png";
			}

			if(device.name!=""){
				deviceName = device.name;
			}

 			text+='<div class="ui-block-'+block+'">\
					<div class="device '+active+'" data-index="'+index+'">\
						<div class="img" style="background-image: url(\'images/'+image+'\');background-size: cover;"></div>\
						<h2>'+deviceName+'</h2>\
					</div>\
				</div>';
		});

		$("#devices").html(text);
		$('html').height($('#home').height()+12);
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

	if(element.hasClass("active")==true){
		element.removeClass("active");

		$.each(storedDevices, function(storedIndex, storedDevice){
			if(typeof storedDevice!="undefined"){
				if(storedDevice.targetID==selectedDevice.targetID){
					storedDevices.splice(storedIndex, 1);
				}
			}
		});
	}
	else{
		element.addClass("active");
		storedDevices.push({type:selectedDevice.type, targetID: selectedDevice.targetID});
	}
	localStorage.storedDevices = JSON.stringify(storedDevices);
}
function clearMessagePlaceholder(element){
	if(element.html()=="Type message or drag and drop file here"){
		element.html("");
	}
}
function changeDeviceName(element, event){
	var deviceName = element.val();
	var query, postData;
	query = serverPath + "/pass/changeDeviceName.php";
	postData = {
		targetID : localStorage.regID,
		deviceName : deviceName,
		};

	$.post( query, postData, function(data){
		console.log(data);
	}).fail(function(xhr, status, error){
		alert("Something wrong with getting data from the server.");
	});
	localStorage.deviceName = deviceName;
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
	$( document ).on( "tap", '#message', function( e ) {clearMessagePlaceholder($(this));});
	$( document ).on( "change", '#deviceName', function( e ) {changeDeviceName($(this), e);});
	$( document ).on( "tap", '#header .button.history', function( e ) {showHistory("")});
	$( document ).on( "tap", '#header .button.send', function( e ) {showSend()});
	$( document ).on( "tap", '#clear', function( e ) {$('#message').html("");});
	$( document ).on( "tap", '.history .button.send', function( e ) {sendHistory($(this));});
	$( document ).on( "tap", '.history .button.open', function( e ) {sendOpenMessage($(this));});
}