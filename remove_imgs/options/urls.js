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
    if (ext_holder.runtime.lastError) {
        console.log(ext_holder.runtime.lastError);
        return true;
    }
    return false;
};

/*
 * Base identifiers.
 */
var key_for_urls = "urls_with_default_image_removal";

var class_name_url_input = "url_img_auto_use_input";
var class_name_url_del = "url_img_auto_use_del";
var class_name_url_add = "url_img_auto_use_add";

/*
 * Removal of a row and its URL value.
 */
var remove_set_url = function (e) {
    var elm = (e.target) ? e.target : e.srcElement;
    if (!elm) {
        return;
    }

    var elm_div = elm.parentElement;
    if (!elm_div) {
        return;
    }

    if (elm_div.remove) {
        elm_div.remove();
    }
    else {
        elm_div.outerHTML = "";
    }

    setTimeout(
        save_set_urls,
        10
    );
};

/*
 * Saving changed URL values.
 */
var save_set_urls = function () {
    var elms = document.getElementsByClassName(class_name_url_input);

    var url_values = [];
    for (let idx = elms.length - 1; idx>=0; idx--) {
        if (!(elms[idx].value)) {
            continue;
        }
        url_values.push({
            value: elms[idx].value,
            form: "regexp"
        });
    }

    let set_param = {};
    set_param[key_for_urls] = url_values;
    if (ext_uses_browser) {
        ext_holder.storage.local.set(set_param).then(no_op_function, do_log_error);
    } else {
        ext_holder.storage.local.set(set_param, check_last_error);
    }
};

/*
 * Setting UI actions for the added rows:
 * saving and/or removal of its value.
 */
var update_handling_input = function () {
    var elms_inp = document.getElementsByClassName(class_name_url_input);
    for (let idx = elms_inp.length - 1; idx>=0; idx--) {
        elms_inp[idx].onchange = save_set_urls;
    }
    var elms_del = document.getElementsByClassName(class_name_url_del);
    for (let idx = elms_del.length - 1; idx>=0; idx--) {
        elms_del[idx].onclick = remove_set_url;
    }
};

/*
 * Adding one row into UI.
 */
var add_one_url_row = function (value) {
    var elm_set = document.getElementById("url_img_auto_remove_collection");

    var elm_one = document.createElement('div');
    elm_one.role = "listitem";

    var elm_inp = document.createElement('input');
    elm_inp.setAttribute("spellcheck", "false");
    elm_inp.value = value;
    elm_inp.className = class_name_url_input;
    elm_inp.role = "textfield";
    elm_one.appendChild(elm_inp)

    var elm_del = document.createElement('span');
    elm_del.innerHTML = "X";
    elm_del.title = "removes item";
    elm_del.className = class_name_url_del;
    elm_del.role = "button";
    elm_one.appendChild(elm_del)

    elm_set.appendChild(elm_one);
};

/*
 * Insert the read URL values into UI;
 * plus adding one empty row.
 */
var set_all_url_rows = function (item) {
    let urls = [];
    if (key_for_urls in item) {
        urls = item[key_for_urls];
    }

    for (let idx = urls.length - 1; idx>=0; idx--) {
        if ((urls[idx].value) && (urls[idx].form) && (urls[idx].form == "regexp")) {
            add_one_url_row(urls[idx].value);
        }
    }

    add_one_url_row("");
    setTimeout(
        update_handling_input,
        10
    );
};

/*
 * Take the current auto-purge URL values from storage.
 */
var load_set_urls = function () {
    if (ext_uses_browser) {
        ext_holder.storage.local.get(key_for_urls).then(
            (item) => {
                set_all_url_rows(item);
            }, (err) => {
                set_all_url_rows({});
                return;
            }
        );
    } else {
        ext_holder.storage.local.get(key_for_urls,
            (item) => {
                set_all_url_rows(item);
            }
        );
    }
};

/*
 * Set the UI action for appending new rows.
 */
var setup_row_appending = function () {
    var elms_add = document.getElementsByClassName(class_name_url_add);
    for (let idx = elms_add.length - 1; idx>=0; idx--) {
        elms_add[idx].onclick = function (e) {
            add_one_url_row("");
            setTimeout(
                update_handling_input,
                10
            );
        }
    }
};

/*
 * Page init.
 */
var initialize_page_state = function () {
    load_set_urls();
    setup_row_appending();
};

if ((document.readyState == "loading") || (document.readyState == "uninitialized")) {
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", initialize_page_state);
    } else {
        window.onload = initialize_page_state;
    }
} else {
    initialize_page_state();
}
