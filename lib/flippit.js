var serverPath = 'http://www.flippit.ca/';
var devices;
var historyData = [];
var fileName = "";
var app = true;
var folderSize = "";
var dropZone = null;
var slider = null;
var saveMessage = false;
init();
events();

function init() {
    if (typeof localStorage.saveMessage != "undefined") {
        saveMessage = localStorage.saveMessage;
    }
    $(document).bind('ready', function() {
        if (app === true) {
            if (typeof localStorage.regID == "undefined") {
                chrome.gcm.register(["155899320902"], function(regID) {
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    localStorage.regID = regID;
                });
            }
        } else {
            serverPath = "http://" + window.location.hostname;
            $('html, body').height("");
            $('.page').css('min-height', ($(window).height() - $('#header').height() - $('.footer').height() - 50));
        }
        $( "#popUp" ).enhanceWithin().popup();
        if (typeof localStorage.email == "undefined") {
            showLogin();
        } else if (typeof getUrlParameter("msgID") != "undefined") {
            $.mobile.changePage('#home');
            openMessage(getUrlParameter("msgID"));
        } else {
            $.mobile.changePage('#home');
            showSend();
        }
    });
    $(window).unload(function() {
        localStorage.lastMessage = $('#message').text();
    });
}

function showSend() {
    $('.page').hide();
    $("#sendPage").show();
    $('#header .button').hide();
    $('#header .button.history,#header .button.deviceSettings,#header .button.logout,#header .button.refresh ').show();
    $('.page').css('min-height', ($(window).height() - $('#header').height() - $('.footer').height() - 20));

    getFolderSize();

    $(document).bind('pagechange', function() {
        if (typeof localStorage.devices == "undefined") {
            getDevices();

        }
        else{
            devices = $.parseJSON(localStorage.devices);
            if(devices.length==1){
                getDevices();
            } else {
                showDevices();
            }
        }

        $('html, body').height($('.page-container').height() + 12);
    });

    if(dropZone===null){
        dropZone = new Dropzone("div#message", {
            url: serverPath + "server/upload_v2.php",
            maxFiles: 1,
            autoProcessQueue: false,
            previewsContainer: '.fileUploads',
            dragover: function() {
                $('#message').css('background', '#33B2E3');
            },
            dragleave: function() {
                $('#message').css('background', 'none');
            },
            drop: function(e) {
                $('html, body').height($('.page-container').height() + 12);
                if ($('#message').text() == "Type message or drag and drop file here") {
                    $('#message').text("");
                }
            },
            success: function(file, data) {
                console.log(data);
                data = $.parseJSON(data);
                if (typeof data.error != "undefined") {
                    alert(data.error);
                } else {
                    $('#message').css('background', 'none');
                    $.mobile.loading('hide');
                }

            },
            init: function() {
                this.on("addedfile", function(file) {
                    console.log((parseInt(file.size) / 1024 + parseInt(folderSize)));
                    console.log(10 * 1024);
                    fileName = file.name;
                    if ((parseInt(file.size) / 1024 + parseInt(folderSize)) > 100 * 1024) {
                        $("#popUp").html('Upload would exceed storage limit and cancelled. Please delete some messages to get more storage.').popup("open");
                        this.removeFile();
                    }
                    $('html, body').height($('#home').height());
                });

                this.on("sending", function(file, xhr, formData) {
                    var storedDevices = [];
                    if (typeof localStorage.storedDevices != "undefined") {
                        storedDevices = $.parseJSON(localStorage.storedDevices);
                    }

                    formData.append("email", localStorage.email); // Will send the filesize along with the file as POST data.
                    formData.append("message", encodeURIComponent($('#message').text()));
                    formData.append("targetID", storedDevices[0].targetID);
                    formData.append("targetType", storedDevices[0].type);

                });
            },
            clickable: '#upload'
        });
    }


    if (typeof localStorage.deviceName != "undefined") {
        $('#deviceName').val(localStorage.deviceName);
    }
    if (typeof localStorage.saveMessage != "undefined") {
        //setting opposite because the setSaveMessage function will flip it.
        if (localStorage.saveMessage == "true") {
            saveMessage = false;
        } else {
            saveMessage = true;
        }
        setSaveMessage($("#save"));
    }
    if (typeof localStorage.lastMessage != "undefined") {
        $('#message').text(localStorage.lastMessage);
    }

}

function showLogin() {
    $(document).bind('pagechange', function() {
        console.log('test');
        $('html, body').height($('#loginPage').height());
    });
    $.mobile.changePage('#loginPage');
}

function openMessage(id) {
    $(".page").hide();
    $("#openMessagePage").show();
    $("#header .button").hide();
    $.mobile.loading('show');
    var query, postData;

    query = serverPath + "server/getMessage_v1.php";
    var text = "";
    postData = {
        email: localStorage.email,
        id: id
    };
    $.post(query, postData, function(data) {
        data = $.parseJSON(data);
        console.log(data);
        var text = "";
        $.each(data, function(index, message) {
            var image = "";
            if (typeOfMessage(message.fileName) == "image") {
                image = '<div class="image" style="background:url(\'http://www.flippit.ca/uploads/' + localStorage.email + '/' + message.fileName + '\');background-size:cover; height:300px;"></div>';
            }
            text += '	<div class="history">\
						<div class="date">' + message.dateTime + '</div>\
						<div class="buttons">\
							<div class="button open" data-flippitIndex="' + index + '"></div>\
							<div class="button send" data-flippitIndex="' + index + '"></div>\
							<div class="button delete" data-flippitIndex="' + index + '"></div>\
						</div>\
						<div class="message">' + decodeURIComponent(message.message) + '</div>\
						' + image + '\
					</div>';
        });
        $("#openMessagePage").html(text);
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
    });
}

function showHistory(totalLoad) {
    $('.page').hide();
    $('#historyPage').show();
    $('#header .button').hide();
    $('#header .button.send,#header .button.refresh, #header .button.logout').show();
    $('.page').css('min-height', ($(window).height() - $('#header').height() - $('.footer').height() - 20));
    $.mobile.loading('show');

    var query, postData;
    if (totalLoad === "") {
        totalLoad = 20;
    }
    query = serverPath + "server/getHistory_v1.php";
    var text = "";
    postData = {
        email: localStorage.email,
        totalLoad: totalLoad
    };
    $.post(query, postData, function(data) {
        data = $.parseJSON(data);
        console.log(data);
        var text = "";
        historyData = [];

        $.each(data, function(index, historyItem) {
            var image = "";
            var buttons = "";

            if (typeOfMessage(historyItem.fileName) == "image") {
                image = '<img class="image" src="http://www.flippit.ca/uploads/' + localStorage.email + '/' + historyItem.fileName + '");"/>';
                buttons += '<div class="button download" data-flippitIndex="' + index + '"></div>';
                buttons += '<div class="button open" data-flippitIndex="' + index + '"></div>';
            } else if (typeOfMessage(historyItem.fileName) == "file") {
                buttons += '<div class="button download" data-flippitIndex="' + index + '"></div>';
                buttons += '<div class="button open" data-flippitIndex="' + index + '"></div>';
            } else if (typeOfMessage(historyItem.fileName) == "text" && app===false) {
                buttons += '<div class="button copy" data-flippitIndex="' + index + '"></div>';
            }

            buttons += '<div class="button send" data-flippitIndex="' + index + '"></div>';
            buttons += '<div class="button delete" data-flippitIndex="' + index + '"></div>';

            text += '	<div class="history">\
						<div class="date">' + historyItem.dateTime + '</div>\
						<div class="buttons">' + buttons + '</div>\
						<div class="message">' + decodeURIComponent(historyItem.message) + '</div>\
						' + image + '\
					</div>';
            historyData.push(historyItem);
        });

        $("#historyPage").html(text);
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
    });
}

function downloadHistory(element) {
    var index = element.attr('data-flippitIndex');
    console.log(index);
    fileName = historyData[index].fileName;
    email = localStorage.email;
    chrome.downloads.download({
        url: "http://www.flippit.ca/uploads/" + email + "/" + fileName
    });
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function send(message) {
    $.mobile.loading('show');
    var query, postData;
    var storedDevices = [];
    if (typeof localStorage.storedDevices != "undefined") {
        storedDevices = $.parseJSON(localStorage.storedDevices);
    }
    if (typeof message=="undefined") {
        message = $('#message').text();
    }
    if (fileName !== "") {
        dropZone.processQueue();
        return true;
    }


    $.each(storedDevices, function(index, device) {
        var targetType = "";
        query = serverPath + "server/send_v2.php";

        var localSaveMessage="";
        if(device.type=="chrome"){
            localSaveMessage="true;"
        }
        else{
            localSaveMessage=saveMessage;
        }
        postData = {
            message: encodeURIComponent(message),
            targetID: device.targetID,
            targetType: device.type,
            fileName: fileName,
            email: localStorage.email,
            saveMessage: localSaveMessage
        };
        console.log(postData);
        $.post(query, postData, function(data) {
            console.log(data);
            data = $.parseJSON(data);
            if (typeof data.error != "undefined") {
                alert(data.error);
            }
            $.mobile.loading('hide');
        }).fail(function(xhr, status, error) {
            alert("Something wrong with getting data from the server.");
            $.mobile.loading('hide');
        });
    });

}

function login() {
    $.mobile.loading('show');
    var query, postData;

    query = serverPath + "server/login_v2.php";

    postData = {
        email: $('#email').val(),
        password: $('#password').val(),
        targetID: localStorage.regID,
        type: "chrome"
    };

    $.post(query, postData, function(data) {
        console.log(data);
        data = $.parseJSON(data);

        if (typeof data.message !=="undefined") {
            $.mobile.changePage('#home');
            showSend();
            $("#popUp").html(data.message).popup("open");
            localStorage.email = $('#email').val();
        }
        else{
            $("#popUp").html(data.error).popup("open");
        }
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
        $.mobile.loading('hide');
    });
}

function register() {
    $.mobile.loading('show');
    var query, postData;
    query = serverPath + "server/reg_v2.php";
    postData = {
        email: $('#email').val(),
        password: $('#password').val(),
        targetID: localStorage.regID,
        type: "chrome"
    };

    $.post(query, postData, function(data) {
        console.log(data);
        data = $.parseJSON(data);
        $("#popUp").html(data.message).popup("open");
        if (typeof data.message !=="undefined") {
            $.mobile.changePage('#home');
            showSend();
            $("#popUp").html(data.message).popup("open");
            localStorage.email = $('#email').val();
        }
        else{
            $("#popUp").html(data.error).popup("open");
        }
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
        $.mobile.loading('hide');
    });
}

function getDevices() {
    $.mobile.loading('show');
    var query, postData;

    query = serverPath + "server/getDevices_v1.php";

    postData = {
        email: localStorage.email
    };

    $.post(query, postData, function(data) {
        data = $.parseJSON(data);

        devices = data;
        var cloud = {};
        cloud.type = "cloud";
        cloud.name = "cloud";
        data.splice(0, 0, cloud);

        localStorage.devices = JSON.stringify(data);
        showDevices();
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
        $.mobile.loading('hide');
    });
}

function showDevices() {
    var text = "";
    var activeIndex = 0;
    var storedDevices = [];
    if (typeof localStorage.storedDevices != "undefined") {
        storedDevices = $.parseJSON(localStorage.storedDevices);
    }
    devices = $.parseJSON(localStorage.devices);
    var i = 0;

    $("#devices").html(text);
    $.each(devices, function(index, device) {
        var active = "";

        var image = "";
        var deviceName = device.type;
        $.each(storedDevices, function(storedIndex, storedDevice) {
            if (storedDevice.targetID == device.targetID) {
                active = "active";
                activeIndex = index;
            }
        });

        if (device.type == "chrome") {
            image = "computer_black.png";
        } else if (device.type == "android") {
            image = "phone_black.png";
        } else if (device.type == "blackberry") {
            image = "phone_black.png";
        } else if (device.type == "cloud") {
            image = "cloud_black.png";
        }
        if (typeof localStorage.regID != "undefined") {

            if (localStorage.regID == device.targetID) {
                return true;
            }
        }
        i++;
        if (device.name !== "") {
            deviceName = device.name;
        }

        text += '<div class="device ' + active + '" data-index="' + index + '">\
						<div class="buttons">\
							<div class="button-back name" data-index="' + index + '"><div class="button name white"></div></div>\
							<div class="button-back delete" data-index="' + index + '"><div class="button delete white"></div></div>\
						</div>\
						<div class="img" style="background-image: url(\'images/' + image + '\');background-size: cover;"></div>\
						<h2>' + deviceName + '</h2>\
					</div>';
    });
    $("#devices").html(text);
    if (slider === null) {
        slider = $('#devices').bxSlider({
            slideWidth: 120,
            minSlides: 2,
            maxSlides: 3,
            slideMargin: 30,
            startSlide: activeIndex,
            pager: false
        });
    } else {
        slider.reloadSlider();
    }
    $('.page').css('min-height', ($(window).height() - $('#header').height() - $('.footer').height() - 20));
    $('html, body').height($('.page-container').height() + 12);
}

function getFolderSize() {
    var query, postData;

    query = serverPath + "server/getFolderSize_v1.php";
    var text = "";
    postData = {
        email: localStorage.email
    };

    $.post(query, postData, function(data) {
        data = $.parseJSON(data);
        folderSize = data.size;
        var limit = parseInt(folderSize) / (100 * 1024) * 100;
        limit = parseInt(limit);
        if ((limit / 100) > 10 * 1024) {
            $("#popUp").html('You have reached ' + limit + '% of your space. Consider deleting some messages.').popup("open");
        }
        $("#diskSpace").html("You have used " + limit + "% of your space.");
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
    });
}

function copyMessage(element) {
    var index = element.attr('data-flippitindex');
    console.log(index);
    var message = $('.button.copy[data-flippitindex="'+index+'"]').parent().parent().find('.message');
    console.log(message);
    message.attr('contentEditable',true);
    message.focus();
    document.execCommand('SelectAll');
    document.execCommand("copy");
    message.attr('contentEditable',false);
}

function deviceSelect(element) {
    var storedDevices = [];
    if (typeof localStorage.storedDevices != "undefined") {
        storedDevices = $.parseJSON(localStorage.storedDevices);
    }
    var index = element.attr("data-index");
    slider.goToSlide(index);
    var selectedDevice = devices[index];
    $('.device').removeClass('active');
    element.addClass("active");

    storedDevices[0] = {
        type: selectedDevice.type,
        targetID: selectedDevice.targetID
    };
    localStorage.storedDevices = JSON.stringify(storedDevices);
    send();
}

function clearMessagePlaceholder(element) {
    if (element.html() == "Type message or drag and drop file here") {
        element.html("");
    }
}

function changeThisDeviceName(event) {
    if (event.keyCode != 13) {
        return true;
    }
    var deviceName = $('#deviceName').val();
    var targetID = localStorage.regID;
    localStorage.deviceName = deviceName;
    changeDeviceName(deviceName, targetID);
}

function changeAnotherDeviceName(element) {
    var index = $("#save").attr("data-index");
    var deviceName = $('#otherDeviceName').val();
    var targetID = devices[index].targetID;
    changeDeviceName(deviceName, targetID);
}

function changeDeviceName(deviceName, targetID) {
    var query, postData;
    $.mobile.loading('show');
    query = serverPath + "server/changeDeviceName_v1.php";
    postData = {
        targetID: targetID,
        deviceName: deviceName
    };

    $.post(query, postData, function(data) {
        getDevices();
        $('.ui-popup').popup('close');
        $("#popUp").html('Device name changed').popup("open");
        $('.device .button-back,#deviceName').removeClass('visible');
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
        $.mobile.loading('hide');
    });

}

function deleteDevice(element) {
    $.mobile.loading('show');
    var index = element.attr("data-index");
    var query = serverPath + "server/deleteDevice_v2.php";
    var text = "";
    postData = {
        email: localStorage.email,
        targetID: devices[index].targetID
    };

    $.post(query, postData, function(data) {
        getDevices();
        $.mobile.loading('hide');
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
        $.mobile.loading('hide');
    });
}

function sendHistory(element) {
    var index = element.attr('data-flippitIndex');
    fileName = historyData[index].fileName;
    showSend();
    $('#message').html(historyData[index].message);
}

function deleteMessage(element) {
    var index = element.attr('data-flippitIndex');
    id = historyData[index].id;
    console.log(index);
    var query, postData;
    query = serverPath + "server/deleteMessage_v1.php";
    postData = {
        id: id,
        email: localStorage.email
    };

    $.post(query, postData, function(data) {
        showHistory(20);
    }).fail(function(xhr, status, error) {
        alert("Something wrong with getting data from the server.");
    });

}

function setSaveMessage(element) {
    if (saveMessage === true) {
        element.removeClass("active");
        element.find(".button").removeClass("blue").addClass("white");
        saveMessage = false;
    } else {
        element.addClass("active");
        element.find(".button").removeClass("white").addClass("blue");
        saveMessage = true;
    }
    localStorage.saveMessage = saveMessage;

}

function sendOpenMessage(element) {
    var index = element.attr('data-flippitIndex');
    console.log(index);
    var id = historyData[index].id;

    if (app === true && historyData.fileName !== "") {
        chrome.tabs.create({
            url: "http://www.flippit.ca/index.html?msgID=" + id
        });
    }
}

function refresh() {
    if ($("#sendPage").is(":visible") === true) {
        getDevices();
    } else if ($("#historyPage").is(":visible") === true) {
        showHistory(20);
    }
}

function typeOfMessage(fileName) {
    var type;
    if (fileName.search(".jpg") != -1 || fileName.search(".jpeg") != -1 || fileName.search(".gif") != -1 || fileName.search(".png") != -1) {
        type = "image";
    } else if (fileName !== "") {
        type = "file";
    } else {
        type = "text";
    }
    return type;
}

function events() {
    $(document).on("tap", '#send', function(e) {
        send();
    });
    $(document).on("tap", '#login', function(e) {
        login();
    });
    $(document).on("tap", '#reg', function(e) {
        register();
    });
    $(document).on("tap", '.device', function(e) {
        deviceSelect($(this));
    });
    $(document).on("tap", '#message', function(e) {
        clearMessagePlaceholder($(this));
    });
    $(document).on("keypress", '#deviceName', function(e) {
        changeThisDeviceName(e);
    });
    $(document).on("tap", '#header .button.history', function(e) {
        showHistory("");
    });
    $(document).on("tap", '#header .button.deviceSettings', function(e) {
        $('.device .button-back,#deviceName').addClass('visible');
    });
    $(document).on("tap", '#header .button.refresh', function(e) {
        refresh();
    });
    $(document).on("tap", '#clear', function(e) {
        $('#message').html("");
    });
    $(document).on("tap", '#save', function(e) {
        setSaveMessage($(this));
    });
    $(document).on("tap", '.history .button.send', function(e) {
        sendHistory($(this));
    });
    $(document).on("tap", '.history .button.copy', function(e) {
        copyMessage($(this));
    });
    $(document).on("tap", '.history .button.download', function(e) {
        downloadHistory($(this));
    });
    $(document).on("tap", '.history .button.delete', function(e) {
        deleteMessage($(this));
    });
    $(document).on("tap", '.history .button.open', function(e) {
        sendOpenMessage($(this));
    });
    $(document).on("tap", '.device .button-back.name', function(e) {
        e.stopPropagation();
        $("#save").attr("data-index", $(this).attr('data-index'));
        $("#deviceNameDialog").popup("open");
    });
    $(document).on("tap", '#save2', function(e) {
        e.stopPropagation();
        changeAnotherDeviceName($(this));
    });
    $(document).on("tap", '.popupClose', function(e) {
        e.stopPropagation();
        $('.ui-popup').popup('close');
    });
    $(document).on("tap", '.device .button-back.delete', function(e) {
        e.stopPropagation();
        deleteDevice($(this));
    });
    $(document).on("tap", '#logout', function(e) {
        localStorage.clear();
        $.mobile.changePage('#loginPage');
    });
    $(document).on("tap", '#logo,#title', function(e) {
        showSend();
    });
    $(document).on("tap", '#help', function (e) {
        $("#helpDialog").popup("open");
    });
    $(document).on("tap", '#tutFiles', function (e) {
        if(app==true){
            chrome.tabs.create({url:"https://www.youtube.com/watch?v=zyfscyL1gJU"});
        }
        else{
            window.open("https://www.youtube.com/watch?v=zyfscyL1gJU");
        }
    });
    $(document).on("tap", '#tutText', function (e) {
        if(app==true){
            chrome.tabs.create({url:"https://www.youtube.com/watch?v=m6S2m-vS204"});
        }
        else{
            window.open("https://www.youtube.com/watch?v=m6S2m-vS204");
        }
    });
}