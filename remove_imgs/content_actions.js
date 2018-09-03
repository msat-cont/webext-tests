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
 * Removal of IMG tags during the page loading.
 */
remove_img_tags();

/*
 * Removal of IMG tags on user request.
 */
{
  let ext_holder = chrome;
  if (typeof browser !== 'undefined') {
    ext_holder = browser;
  }
  ext_holder.runtime.onMessage.addListener(request => {
    if (request.remove_imgs) {
      remove_img_tags();
    }
  });
}

