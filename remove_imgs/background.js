/*
 * Setting variables for discerning of browser ways.
 */
var ext_holder;
var ext_uses_browser = false;
if (typeof browser !== 'undefined') {
    ext_holder = browser;
    ext_uses_browser = true;
} else {
    ext_holder = chrome;
}

/*
 * Auxiliary methods.
 */
var no_op_function = function () {
};
var err_output = function (data) {
    console.log(data);
};
var check_last_error = function () {
    if (ext_uses_browser) {
        return false;
    }
    if (ext_holder.runtime.lastError) {
        console.log(ext_holder.runtime.lastError);
        return true;
    }
    return false;
};

/*
 * The messages to send to the page for (not) deleting its images.
 */
var delete_imgs_yes = {remove_imgs: true};
var delete_imgs_no = {remove_imgs: false};

/*
 * Dealing with (early) questions on automatic IMG tags removal.
 */
var key_for_url_regexps = "urls_with_default_image_removal";

var check_url_for_image_removal = function (request, sender, sendResponse, item, page_url) {
    // here we are already with the set auto-purge URL reg-exps;
    // comparing them to the actual page URL;

    if (check_last_error()) {
        try {
            sendResponse(delete_imgs_no);
        } catch {}
        return;
    }

    if ((!item) || (!(key_for_url_regexps in item))) {
        try {
            sendResponse(delete_imgs_no);
        } catch {}
        return;
    }

    let urls = item[key_for_url_regexps];
    for (let idx = urls.length - 1; idx>=0; idx--) {
        if ((urls[idx].value) && (urls[idx].form) && (urls[idx].form == "regexp")) {
            let page_url_covered = false;
            try {
                let value_regexp = new RegExp(urls[idx].value.replace(/\\/g, "\\\\"), "i");
                if (value_regexp.test(page_url)) {
                    page_url_covered = true;
                }
            } catch {
                continue;
            }
            if (page_url_covered) {
                try {
                    sendResponse(delete_imgs_yes);
                } catch {}
                return;
            }
        }
    }

    try {
        sendResponse(delete_imgs_no);
    } catch {}
};

var handle_message = function (request, sender, sendResponse) {
    // have to ask the storage for the current settings on automatic image purging;

    if ((!request) || (!(request.remove_imgs)) || (!(request.page_url))) {
        sendResponse(delete_imgs_no);
        return;
    }

    if (ext_uses_browser) {
        ext_holder.storage.local.get(key_for_url_regexps).then(
            (item) => {
                check_url_for_image_removal(request, sender, sendResponse, item, request.page_url);
            }, (err) => {
                sendResponse(delete_imgs_no);
                return;
            }
        );
    } else {
        ext_holder.storage.local.get(key_for_url_regexps,
            (item) => {
                check_url_for_image_removal(request, sender, sendResponse, item, request.page_url);
            }
        );
    }

    // have to return true, so that browser knows that this is an asynchronous communication;
    return true;
};

// registering handler for messages that we gonna get during page loadings;
ext_holder.runtime.onMessage.addListener(handle_message);

/*
 * Sending any user-based IMG tags removal command to the active page.
 */
var send_removal_request = function (tabs) {
    if (check_last_error()) {
        return;
    }

    for (let idx = tabs.length - 1; idx>=0; idx--) {
        if (ext_uses_browser) {
            ext_holder.tabs.sendMessage(
                tabs[idx].id,
                delete_imgs_yes
            ).then(response => no_op_function).catch(err_output);
        } else {
            ext_holder.tabs.sendMessage(
                tabs[idx].id,
                delete_imgs_yes
            )
        }
    }
};

/*
 * Listening on keyboard-based commands for IMG tags removal.
 */
ext_holder.commands.onCommand.addListener(function(command) {
    // listening on keyboard shortucts;
    var command_names = {
        "img-removal": "remove-images"
    };
    var do_img_removal = false;

    switch (command) {
        case command_names["img-removal"]:
            do_img_removal = true;
            break;
        default:
            break;
    }
    if (!do_img_removal) {
        return;
    }

    // sending the keyboard-based request to the current active tab;
    // though we have yet to ask what is the current active tab;
    if (ext_uses_browser) {
        ext_holder.tabs.query({
            currentWindow: true,
            active: true
        }).then(send_removal_request).catch(err_output);
    } else {
        ext_holder.tabs.query({
            currentWindow: true,
            active: true
        },
        send_removal_request);
    }

});

/*
 * Listening on the browser-toolbar button clicks;
 * considering them as commands for IMG tags removal.
 */
ext_holder.browserAction.onClicked.addListener((tab) => {
    // the active tab is a parameter here, thus do not need to ask for it;
    send_removal_request([tab]);
});
