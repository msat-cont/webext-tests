(function() {
    /*
     * Auxiliary definitions.
     */
    let ext_holder = chrome;
    let ext_uses_browser = false;
    if (typeof browser !== 'undefined') {
        ext_holder = browser;
        ext_uses_browser = true;
    }
    let err_output = function (data) {
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
     * Defining the removal of IMG tags.
     */
    var remove_img_tags = function () {
        var tags = document.getElementsByTagName("img");
        for (let idx = tags.length-1; idx>=0; idx--) {
            let elm = tags[idx];
            if (elm) {
                if (elm.remove) {
                    elm.remove();
                }
                else {
                    elm.outerHTML = "";
                }
            }
        }
    };

    /*
     * Checking whether a request asks for removal of IMG tags.
     */
    let should_remove_images = function (message) {
        check_last_error();
        if (message && (message.remove_imgs)) {
            remove_img_tags();
        }
    };

    /*
     * Asking on removal of IMG tags during page loading.
     */
    if (ext_uses_browser) {
        ext_holder.runtime.sendMessage({
            remove_imgs: true,
            page_url: window.location.href
        }).then(should_remove_images).catch(err_output);
    } else {
        ext_holder.runtime.sendMessage({
            remove_imgs: true,
            page_url: window.location.href
        }, should_remove_images);
    }

    /*
     * Waiting for user requests on removal of IMG tags.
     */
    ext_holder.runtime.onMessage.addListener(should_remove_images);
}.call());
