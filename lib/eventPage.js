var registerWindowCreated = false;
var fileName=""
chrome.gcm.onMessage.addListener(messageReceived);

function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}
function messageReceived(message) {

    if(typeof message.data.message.fileName!='undefined' ){
        console.log(message.data.message.fileName.search(".jpg"));
        if(message.data.message.fileName.search(".jpg")>-1||message.data.message.fileName.search(".jpeg")>-1||
            message.data.message.fileName.search(".gif")>-1||message.data.message.fileName.search(".png")>-1){
            imageNotification(message);
        }
        else{
            fileNotification(message);
        }
    }
	else{
		textNotification(message);
	}
	
	
  var messageString = "";
  for (var key in message.data) {
    if (messageString != "")
      messageString += ", "
    messageString += key + ":" + message.data[key];
  }
  console.log("Message received: " + message.data.message);


}
function textNotification(message){
	chrome.notifications.create(getNotificationId(), {
		title: 'Pass',
		iconUrl: 'icon36.png',
		type: 'basic',
		message: message.data.message}, 
		function(){});
        var id = message.data.id;
        chrome.notifications.onClicked.addListener(function (notID){
		console.log(fileName);
		chrome.tabs.create({
			url: 'http://www.local-motion.ca/pass/index.html?msgID='+id
		}, function (){});
	});
}
function fileNotification(message){
	chrome.notifications.create(getNotificationId(), {
		title: 'Pass',
		iconUrl: 'icon36.png',
		type: 'basic',
		message: message.data.message + ' - ' + message.data.fileName,
		buttons: [{title:'Download'}]},
		function(){});
	fileName = message.data.fileName;
	chrome.notifications.onButtonClicked.addListener(function (notID, btnIndex){
		console.log(fileName);
		var id = message.data.id;
		chrome.tabs.create({
			url: 'http://www.local-motion.ca/pass/index.html?msgID='+id
			}, function (){});
	});
}
function imageNotification(message){
	fileName = message.data.fileName;
	var id = message.data.id;
	chrome.notifications.create(getNotificationId(), {
		title: 'Pass',
		iconUrl: 'icon36.png',
		type: 'image',
		message: message.data.message + ' - ' + message.data.fileName,
		imageUrl: 'http://www.local-motion.ca/pass/uploads/'+localStorage.email+'/'+fileName},
		function(){});

	chrome.notifications.onClicked.addListener(function (notID){
		console.log(fileName);
		chrome.tabs.create({
			url: 'http://www.local-motion.ca/pass/index.html?msgID='+id
		}, function (){});
	});
}
function test(){
	console.log('test');
}