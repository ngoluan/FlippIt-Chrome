var registerWindowCreated = false;
var fileName = "";
var serverPath = 'http://www.flippit.ca/';
chrome.gcm.onMessage.addListener(messageReceived);

function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}
function messageReceived(message) {
    console.log(message);

    chrome.notifications.onButtonClicked.addListener(function (notID, btnIndex) {
        console.log(btnIndex);
        if(btnIndex==0){
            copy(message.data.message);
        }
        else{
            chrome.downloads.download({url:serverPath+"uploads/"+email+"/"+fileName});
        }

    });

    if (typeof message.data.fileName != 'undefined') {
        if (message.data.fileName.search(".jpg") > -1 || message.data.fileName.search(".jpeg") > -1 ||
            message.data.fileName.search(".gif") > -1 || message.data.fileName.search(".png") > -1) {
            imageNotification(message);
        }
        else {
            fileNotification(message);
        }
    }
    else {
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
function textNotification(message) {
    chrome.notifications.create(getNotificationId(), {
            title: 'Pass',
            iconUrl: '../images/icon36.png',
            type: 'basic',
            message: message.data.message,
            buttons: [{title: 'Copy'}]
        },
        function () {
        });
    var id = message.data.id;
    chrome.notifications.onClicked.addListener(function (notID) {
        copy(message.data.message);
    });

}
function fileNotification(message) {
    var notificationMessage = "";
    if (typeof message.data.message != "undefined") {
        notificationMessage = message.data.mesage + ' - ';
    }
    notificationMessage += message.data.fileName;
    chrome.notifications.create(getNotificationId(), {
            title: 'Pass',
            iconUrl: '../images/icon36.png',
            type: 'basic',
            message: notificationMessage,
            buttons: [{title: 'Copy'},{title:'Download'}]
        },
        function () {
        });
    fileName = message.data.fileName;
    email = localStorage.email;

}
function imageNotification(message) {
    fileName = message.data.fileName;
    email = localStorage.email;
    var id = message.data.id;
    var notificationMessage = "";
    if (typeof message.data.message != "undefined") {
        notificationMessage = message.data.message + ' - ';
    }
    notificationMessage += message.data.fileName;
    chrome.notifications.create(getNotificationId(), {
            title: 'Pass',
            iconUrl: '../images/icon36.png',
            type: 'image',
            message: notificationMessage,
            buttons: [{title: 'Copy'},{title:'Download'}],
            imageUrl: serverPath+'uploads/' + localStorage.email + '/' + fileName
        },
        function () {
        });

}
function copy(message){
    var bg = chrome.extension.getBackgroundPage();

    clipboardholder= bg.document.getElementById("clipboardholder");

    clipboardholder.style.display = "block";

    clipboardholder.value = message;

    clipboardholder.select();

    bg.document.execCommand("Copy");

    clipboardholder.style.display = "none";
}
function test() {
    console.log('test');
    alert('test');
}
function download(url, id){
    chrome.downloads.download({url:url}, function(){

    });
}