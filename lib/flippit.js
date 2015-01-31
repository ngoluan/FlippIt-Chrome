var serverPath = 'http://www.flippit.ca/';
var app = true;
var devices;
var slider = null;
var dropZone = null;
var fileName = "";
var folderLimit = 100 * 1024;
var folderSize = 0;
var saveMessage = false;
var historyData = [];
init();

function init() {
    setupEvents();

    if (app === false) {
        serverPath = "http://" + window.location.hostname + "/";
    }

    $(document).bind('ready', function () {
        if (app === true) {
            if (typeof localStorage.regID == "undefined") {
                chrome.gcm.register(["155899320902"], function (regID) {
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    localStorage.regID = regID;
                });
            }
        }
        pageShowInit();
        if (checkUser() === false) {
            loginPageInit();
        } else {
            sendPageInit();
        }
    });
}
function pageShowInit(){
    console.log('pageshowinit');
    $(document).on('pagecontainershow ', function () {
        var page = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
        console.log(page);
        if(page=="sendPage"){
            showDevices();
            if (dropZone === null) {
                dropZone = new Dropzone("div#message", {
                    url: serverPath + "server/upload_v2.php",
                    maxFiles: 1,
                    autoProcessQueue: false,
                    previewsContainer: '.fileUploads',
                    dragover: function () {
                        $('#message').css('background', '#FFF954');
                    },
                    dragleave: function () {
                        $('#message').css('background', '#ffffff');
                    },
                    drop: function (e) {
                        if ($('#message').text() == "Type message or drag and drop file here") {
                            $('#message').text("");
                            $('#message').css('background', '#ffffff');
                        }
                    },
                    success: function (file, data) {
                        data = $.parseJSON(data);
                        if (typeof data.error != "undefined") {
                            toast(data.error, "short");
                        } else {
                            $('#message').css('background', '#ffffff');
                            toast('File sent', "short");
                            $.mobile.loading('hide');
                        }
                    },
                    init: function () {
                        this.on("addedfile", function (file) {
                            fileName = file.name;
                            if ((parseInt(file.size) / 1024 + parseInt(folderSize)) > folderLimit) {
                                toast('Upload would exceed storage limit and cancelled. Please delete some messages to get more storage.', 'short');
                                this.removeFile();
                            }
                        });

                        this.on("sending", function (file, xhr, formData) {
                            var savedTargetDevice;
                            if (typeof localStorage.savedTargetDevice != "undefined") {
                                savedTargetDevice = $.parseJSON(localStorage.savedTargetDevice);
                            }

                            formData.append("email", localStorage.email);
                            formData.append("message", encodeURIComponent($('#message').text()));
                            formData.append("targetID", savedTargetDevice.targetID);
                            formData.append("targetType", savedTargetDevice.type);
                        });
                    },
                    clickable: '#uploadBtn'
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
                setSaveMessage($("#saveMessageBtn"));
            }
            if (typeof localStorage.lastMessage != "undefined") {
                $('#message').text(localStorage.lastMessage);
            }
            getFolderSize();

            $("#deviceNameDialog").popup();
        }
        else if(page=="loginPage"){
            setAppHeight();
        }
    });

}
function sendPageInit() {
    $(":mobile-pagecontainer").pagecontainer("change", "#sendPage");
}

function historyPageInit(totalLoad, search) {
    $.mobile.loading('show');
    $(":mobile-pagecontainer").pagecontainer("change", "#historyPage");

    var query, postData;
    if (totalLoad === "") {
        totalLoad = 20;
    }
    query = serverPath + "server/getHistory_v1.php";
    postData = {
        email: localStorage.email,
        totalLoad: totalLoad,
        search: search
    };
    $.post(query, postData, function (data) {
        data = $.parseJSON(data);
        var text = "";
        historyData = [];

        $.each(data, function (index, historyItem) {
            var image = "";
            var buttons = "";
            var message = "";
            message = decodeURIComponent(historyItem.message);
            if (typeOfMessage(historyItem.fileName) == "image") {
                image = '<img class="image" src="http://www.flippit.ca/uploads/' + localStorage.email + '/' + historyItem.fileName + '");"/>';
                buttons += '<div class="button download" data-flippitIndex="' + index + '"></div>';
                //buttons += '<div class="button open" data-flippitIndex="' + index + '"></div>';
            } else if (typeOfMessage(historyItem.fileName) == "file") {
                buttons += '<div class="button download" data-flippitIndex="' + index + '"></div>';
                if (message != "") {
                    message += "<br>";
                }
                else {
                    message += "File transfer: " + historyItem.fileName;
                }
                //buttons += '<div class="button open" data-flippitIndex="' + index + '"></div>';
            } else if (typeOfMessage(historyItem.fileName) == "text" && app === true) {
                buttons += '<div class="button copy" data-flippitIndex="' + index + '"></div>';

            }

            buttons += '<div class="button send" data-flippitIndex="' + index + '"></div>';
            buttons += '<div class="button delete" data-flippitIndex="' + index + '"></div>';

            text += '	<div class="history">\
						<div class="date">' + historyItem.dateTime + '</div>\
						<div class="buttons">' + buttons + '</div>\
						<div class="message">' + message + '</div>\
						' + image + '\
					</div>';
            historyData.push(historyItem);
        });

        $("#historyContainer").html(text);
        $("#historyContainer").append(
            '<div id="loadMoreBtn" class="largeButton">\
                    <div class="text">load more</div></div>\
            </div>'
        );
        $('#searchInput').focus();
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "slow");
    });
}
function loginPageInit() {
    $(":mobile-pagecontainer").pagecontainer("change", "#loginPage");
    setAppHeight();
}
function login() {
    $.mobile.loading('show');

    var query, postData;
    query = serverPath + "server/login_v2.php";
    postData = {
        email: $('#emailLoginInput').val(),
        password: $('#passwordLoginInput').val(),
        targetID: localStorage.regID,
        type: "chrome"
    };

    $.post(query, postData, function (data) {
        data = $.parseJSON(data);

        if (typeof data.message !== "undefined") {
            sendPageInit();
            toast(data.message, "short");
            localStorage.email = $('#emailLoginInput').val();
        }
        else {
            $("#popUp").html(data.error).popup("open");
        }
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "short");
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

    $.post(query, postData, function (data) {
        data = $.parseJSON(data);
        if (typeof data.message !== "undefined") {
            toast(data.message, 'short');
            localStorage.email = $('#email').val();
            sendPageInit();
        }
        else {
            toast(data.error, "short");
        }
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "short");
        $.mobile.loading('hide');
    });
}
function checkUser() {
    if (typeof localStorage.email == "undefined") {
        return false;
    }
}
function showDevices() {
    var text = "";
    var savedTargetDevice = {};

    if (typeof localStorage.savedTargetDevice != "undefined") {
        savedTargetDevice = $.parseJSON(localStorage.savedTargetDevice);
    }
    if (typeof localStorage.devices != "undefined") {
        devices = $.parseJSON(localStorage.devices);
    } else {
        getDevices();
        return true;
    }

    var i = 0;

    $.each(devices, function (index, device) {
        var active = "";
        var image = "";
        var deviceName = "";
        if (savedTargetDevice.targetID == device.targetID) {
            active = "active";
        }

        if (device.type == "chrome") {
            image = "computer_black.png";
        }
        else if (device.type == "android") {
            image = "phone_black.png";
        }
        else if (device.type == "blackberry") {
            image = "phone_black.png";
        }
        else if (device.type == "cloud") {
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
        else {
            deviceName = device.type;
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
        var maxSlides;
        if (app === false) {
            maxSlides = 6;
        } else {
            maxSlides = 3;
        }
        slider = $('#devices').bxSlider({
            slideWidth: 120,
            minSlides: 2,
            maxSlides: maxSlides,
            slideMargin: 30,
            pager: false,
            infiniteLoop: false,
            hideControlOnEnd: true,
            onSliderLoad: function () {
                $('.bx-wrapper').wrap("<div class='slider-wrapper'></div>");
                setAppHeight();
            }
        });
    } else {
        slider.reloadSlider();
    }
}
function getDevices() {
    $.mobile.loading('show');
    var query, postData;
    query = serverPath + "server/getDevices_v1.php";

    postData = {email: localStorage.email};

    $.post(query, postData, function (data) {
        data = $.parseJSON(data);

        devices = data;
        var cloud = {};
        cloud.type = "cloud";
        cloud.name = "cloud";
        data.splice(0, 0, cloud);

        localStorage.devices = JSON.stringify(data);

        showDevices();

        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "short");
        $.mobile.loading('hide');
    });
}

function copyMessage(element) {
    var index = element.attr('data-flippitindex');
    console.log(index);
    var message = $('.button.copy[data-flippitindex="' + index + '"]').parent().parent().find('.message');
    console.log(message);
    message.attr('contentEditable', true);
    message.focus();
    document.execCommand('SelectAll');
    document.execCommand("copy");
    message.attr('contentEditable', false);
}

function deviceSelect(element) {
    var index = $(element).attr("data-index");
    slider.goToSlide(index);
    var selectedDevice = devices[index];
    $('.device').removeClass('active');
    element.addClass("active");

    savedTargetDevice = {
        type: selectedDevice.type,
        targetID: selectedDevice.targetID
    };
    localStorage.savedTargetDevice = JSON.stringify(savedTargetDevice);
    send();
}
function send(message) {
    $.mobile.loading('show');
    var query, postData;
    var savedTargetDevice = $.parseJSON(localStorage.savedTargetDevice);

    message = $('#message').text();

    if (fileName !== "") {
        dropZone.processQueue();
        return true;
    }

    var localSaveMessage = "";
    if (savedTargetDevice.type == "cloud") {
        localSaveMessage = "true";
    }
    else {
        localSaveMessage = saveMessage;
    }

    query = serverPath + "server/send_v2.php";

    postData = {
        message: encodeURIComponent(message),
        targetID: savedTargetDevice.targetID,
        targetType: savedTargetDevice.type,
        fileName: fileName,
        email: localStorage.email,
        saveMessage: localSaveMessage
    };

    $.post(query, postData, function (data) {
        data = $.parseJSON(data);
        if (typeof data.error != "undefined") {
            toast(data.error, "short");
        }
        else {
            toast("Message sent", "short");
        }
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "short");
        $.mobile.loading('hide');
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
function clearMessagePlaceholder(element) {
    if (element.html() == "Type message or drag and drop file here") {
        element.html("");
    }
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

    $.post(query, postData, function (data) {
        getDevices();
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", 'short');
        $.mobile.loading('hide');
    });
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
    var index = $("#deviceNameSave").attr("data-index");
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

    $.post(query, postData, function (data) {
        getDevices();
        $('.ui-popup').popup('close');
        toast('Device name changed', 'short');
        $('.device .button-back,#deviceName').removeClass('visible');
        $.mobile.loading('hide');
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", 'short');
        $.mobile.loading('hide');
    });
}
function searchInput(event) {
    if ($('#searchInput').hasClass("visible") === false) {
        $('#searchInput').addClass("visible");
    }
    if (event.keyCode == 13) {
        $('#searchInput').removeClass("visible");
    }
    var text = $('#searchInput').val();
    if (text.length > 2) {
        historyPageInit(20, text);
    }
}
function downloadHistory(element) {
    var index = element.attr('data-flippitIndex');
    console.log(index);
    fileName = historyData[index].fileName;
    email = localStorage.email;
    if (app === true) {
        chrome.downloads.download({
            url: "http://www.flippit.ca/uploads/" + email + "/" + fileName
        });
    }
    else {
        window.open("http://www.flippit.ca/uploads/" + email + "/" + fileName);
    }
}
function sendHistory(element) {
    var index = element.attr('data-flippitIndex');
    fileName = historyData[index].fileName;
    sendPageInit();
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
    $.post(query, postData, function (data) {
        historyPageInit(20, "");
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", 'short');
    });

}
function openHelp() {
    var text = '';
    text = '<div data-role="popup" id="helpDialog" data-dismissible="false" style="max-width:400px;">\
			<div data-role="header">\
				<h1>Tutorials</h1>\
			</div>\
			<div role="main" class="ui-content">\
				<div class="largeButton tutFiles" style="margin-top: 5px;width:200px;margin-left: auto;margin-right: auto;"><div class="text">Sharing files</div><div class="button"></div></div>\
				<div class="largeButton tutText"  style="margin-top: 5px;width:200px;margin-left: auto;margin-right: auto;"><div class="text">Sharing text</div><div class="button"></div></div>\
				<div class="largeButton popupClose" style="margin-top: 5px;width:200px;margin-left: auto;margin-right: auto;"><div class="text">close</div><div class="button"></div></div>\
			</div>\
		</div>';
    $.mobile.activePage.append(text);
    $("#helpDialog").enhanceWithin().popup();
    $("#helpDialog").popup('open');

    $("#helpDialog").on("popupafterclose", function (event, ui) {
        $("#helpDialog").remove();
    });
}
function getFolderSize() {
    var query, postData;

    query = serverPath + "server/getFolderSize_v1.php";
    var text = "";
    postData = {
        email: localStorage.email
    };

    $.post(query, postData, function (data) {
        data = $.parseJSON(data);
        folderSize = data.size;
        var limit = (parseInt(folderSize) / 100) / (folderLimit) * 100;
        limit = parseInt(limit);
        $(".diskSpace").html("You have used " + limit + "% of your space.");
    }).fail(function (xhr, status, error) {
        toast("Something wrong with getting data from the server.", "short");
    });
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
function toast(msg, length) {
    var currentPage = $(":mobile-pagecontainer").pagecontainer("getActivePage");
    var toastContainer = "<div style='display:none' id='toast'>" + msg + "</div>";
    var delay;
    if (length == "long") {
        delay = 6000;
    } else {
        delay = 3000;
    }
    currentPage.append(toastContainer);
    $('#toast').fadeIn(400).delay(delay).fadeOut(400, "swing", function () {
        $('#toast').remove();
    });

}
function setAppHeight() {
    if (app === true) {
        console.log('set height');
        var page = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
        if (page == "sendPage") {
            $('html').width('500').height($("#" + page).height());
        }
        else if (page == "loginPage") {
            $('html').width('500').height('550');
        }
    }

}
function setupEvents() {
    $(document).on("tap", '#loginInputBtn', function (e) {
        login();
    });
    $(document).on("tap", '#regInputBtn', function (e) {
        register();
    });
    $(document).on("tap", '.device', function (e) {
        deviceSelect($(this));
    });
    $(document).on("tap", '.device .button-back.delete', function (e) {
        e.stopPropagation();
        deleteDevice($(this));
    });
    $(document).on("tap", '.device .button-back.name', function (e) {
        e.stopPropagation();
        $("#deviceNameSave").attr("data-index", $(this).attr('data-index'));
        $("#deviceNameDialog").popup("open");
    });
    $(document).on("keypress", '#deviceName', function (e) {
        changeThisDeviceName(e);
    });
    $(document).on("tap", '#deviceNameSave', function (e) {
        e.stopPropagation();
        changeAnotherDeviceName($(this));
    });
    $(document).on("tap", '#sendPage .header .button.refresh', function (e) {
        getDevices();
    });
    $(document).on("tap", '#message', function (e) {
        clearMessagePlaceholder($(this));
    });
    $(document).on("tap", '#saveMessageBtn', function (e) {
        setSaveMessage($(this));
    });
    $(document).on("tap", '#clear', function (e) {
        $('#message').html("");
        dropZone.removeAllFiles();
    });
    $(document).on("tap", '.header .button.deviceSettings', function (e) {
        $('.device .button-back,#deviceName').addClass('visible');
    });
    $(document).on("tap", '.popupClose', function (e) {
        e.stopPropagation();
        $('.ui-popup').popup('close');
    });
    $(document).on("tap", '#loadMoreBtn', function (e) {
        totalLoad = +20;
        historyPageInit(totalLoad, "");
    });
    $(document).on("tap", '.header .button.history', function (e) {
        historyPageInit(20, "");
    });
    $(document).on("tap", '.history .button.download', function (e) {
        downloadHistory($(this));
    });
    $(document).on("tap", '.history .button.send', function (e) {
        sendHistory($(this));
    });
    $(document).on("tap", '.history .button.delete', function (e) {
        deleteMessage($(this));
    });
    $(document).on("tap", '.history .button.copy', function (e) {
        copyMessage($(this));
    });
    $(document).on("tap", '#historyPage .header .button.refresh', function (e) {
        historyPageInit(20, "");
    });
    $(document).on("tap", '#historyPage .header .button.search', function (e) {
        $('#searchInput').addClass('visible');
    });
    $(document).on("keypress", '#searchInput', function (e) {
        searchInput(e);
    });
    $(document).on("tap", '.logo,.title', function (e) {
        sendPageInit();
    });
    $(document).on("tap", '.help', function (e) {
        openHelp();
    });
    $(document).on("tap", '.tutFiles', function (e) {
        if (app == true) {
            chrome.tabs.create({url: "https://www.youtube.com/watch?v=zyfscyL1gJU"});
        }
        else {
            window.open("https://www.youtube.com/watch?v=zyfscyL1gJU");
        }
    });
    $(document).on("tap", '.tutText', function (e) {
        if (app == true) {
            chrome.tabs.create({url: "https://www.youtube.com/watch?v=m6S2m-vS204"});
        }
        else {
            window.open("https://www.youtube.com/watch?v=m6S2m-vS204");
        }
    });
    $(document).on("tap", '.logout', function (e) {
        localStorage.clear();
        $.mobile.changePage('#loginPage');
    });
}