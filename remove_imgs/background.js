/*
 * Setting the base variables.
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
  }
};

/*
 * Dealing with commands (for late IMG tags removal on user request).
 */
var command_names = {
  "removal": "remove-command"
};

/*
 * Sending the (IMG tags removal) command to the active page.
 */
var send_update_message = function (tabs) {
  if (!ext_uses_browser) {
    check_last_error();
  }

  for (let idx = tabs.length - 1; idx>=0; idx--) {
    if (ext_uses_browser) {
      ext_holder.tabs.sendMessage(
        tabs[idx].id,
        {remove_imgs: true}
      ).then(response => no_op_function).catch(err_output);
    } else {
      ext_holder.tabs.sendMessage(
        tabs[idx].id,
        {remove_imgs: true}
      )
    }
  }
};

/*
 * Listening on commands (for IMG tags removal).
 */
ext_holder.commands.onCommand.addListener(function(command) {
  if (command = command_names["removal"]) {
    if (ext_uses_browser) {
      ext_holder.tabs.query({
        currentWindow: true,
        active: true
      }).then(send_update_message).catch(err_output);
    } else {
      ext_holder.tabs.query({
        currentWindow: true,
        active: true},
        send_update_message
      )
    }
  }
});

