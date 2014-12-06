var registerWindowCreated = false;
var fileName = ""
chrome.gcm.onMessage.addListener(messageReceived);

function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}
function messageReceived(message) {
    console.log(message);
    if (typeof message.data.fileName != 'undefined') {
        console.log(message.data.fileName.search(".jpg"));
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
            iconUrl: '../icon36.png',
            type: 'basic',
            message: message.data.message
        },
        function () {
        });
    var id = message.data.id;
    chrome.notifications.onClicked.addListener(function (notID) {
        console.log(fileName);
        copy(message.data.message);
    });
}
function fileNotification(message) {
    chrome.notifications.create(getNotificationId(), {
            title: 'Pass',
            iconUrl: '../icon36.png',
            type: 'basic',
            message: message.data.message + ' - ' + message.data.fileName,
            buttons: [{title: 'Download'}]
        },
        function () {
        });
    fileName = message.data.fileName;
    email = localStorage.email;
    chrome.notifications.onButtonClicked.addListener(function (notID, btnIndex) {
        console.log(fileName);
        chrome.downloads.download({url:"http://www.local-motion.ca/pass/server/uploads/"+email+"/"+fileName});
    });
}
function imageNotification(message) {
    fileName = message.data.fileName;
    email = localStorage.email;
    var id = message.data.id;
    var notificationMessage = "";
    if (typeof message.data.message != "undefined") {
        notificationMessage = message.data.mesage + ' - ';
    }
    notificationMessage += message.data.fileName;
    chrome.notifications.create(getNotificationId(), {
            title: 'Pass',
            iconUrl: '../icon36.png',
            type: 'image',
            message: notificationMessage,
            buttons: [{title: 'Download'}],
            imageUrl: 'http://www.local-motion.ca/pass/uploads/' + localStorage.email + '/' + fileName
        },
        function () {
        });
    chrome.notifications.onButtonClicked.addListener(function (notID, btnIndex) {
        console.log(fileName);
        chrome.downloads.download({url:"http://www.local-motion.ca/pass/server/uploads/"+email+"/"+fileName});
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
        /*var query, postData;

        query = serverPath + "/pass/server/getFolderSize_v1.php";
        var text = "";
        postData = {
            email: localStorage.email
        };

        $.post(query, postData, function (data) {
            console.log(data);
            data = $.parseJSON(data);
            folderSize = data.size;
            var limit = parseInt(folderSize) / (100 * 1024) * 100;
            limit = parseInt(limit);
            if ((limit / 100) > 10 * 1024) {
                $("#popUp").html('You have reached ' + limit + '% of your space. Consider deleting some messages.').popup("open");
            }
            $("#diskSpace").html("You have used " + limit + "% of your space.")
        }).fail(function (xhr, status, error) {
            alert("Something wrong with getting data from the server.");
        });*/
    });
}