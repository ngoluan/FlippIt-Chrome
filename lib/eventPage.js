var registerWindowCreated = false;
var fileName=""
chrome.gcm.onMessage.addListener(messageReceived);

function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}
function messageReceived(message) {
	console.log(message.data.fileName.search(".png"));
	if(message.data.fileName.search(".jpg")>-1||message.data.fileName.search(".jpeg")>-1||message.data.fileName.search(".gif")>-1||message.data.fileName.search(".png")>-1){
		imageNotification(message);
	}
	else if(message.data.fileName !=""){
		fileNotification(message);
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
		chrome.tabs.create({
			url: 'http://www.local-motion.ca/pass/uploads/'+localStorage.email+'/'+fileName
			}, function (){});
	});
}
function imageNotification(message){
	fileName = message.data.fileName;
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
			url: 'http://www.local-motion.ca/pass/uploads/'+localStorage.email+'/'+fileName
			}, function (){});
	});
}
function test(){
	console.log('test');
}