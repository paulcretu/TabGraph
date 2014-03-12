// Stuff to run when the popup is launched
function init() {
    initPopupCloseHack();
}
// Run the init
init();

/* 
  Setup a small workaround that closes the popup window if the user clicks the
  icon button again. It works by using two hacks.

  The first hack overrides the default re-opening of the popup by exploiting the
  onClicked event. If the popup is set in the manifest or in code, onClicked
  doesn't get triggered, but if it's not set, it does.

  So to let us use the event as a mechanism for closing the popup, we unset the
  popup in the popup itself, as soon as it opens. This makes it so that
  onClicked gets triggered on the following button click. In the onClicked
  listener, we close the popup window.

  This gets halfway there. If the popup isn't set back, it won't ever be opened
  again. We could put it in the listener, but then there's still the unhandled
  case of the user clicking outside the popup, closing it without triggering the
  button click listener.

  The solution would be to add another event listener for when the popup closes
  and set the popup there. Unfortunately, Chrome seems to have buggy onUnload
  listeners for popups. The best suggested workaround is using the messaging API
  to connect to the background, and using the chrome.runtime.Port.onDisconnect
  event to trigger the setting of the popup. That part of the code is in
  background.js.

  http://rethrowexception.wordpress.com/2010/06/01/google-chrome-onunload-event-when-closing-popup/
*/
function initPopupCloseHack() {
    // Unset the popup
    chrome.browserAction.setPopup({
        popup: ""
    });

    // Close popup on button click
    chrome.browserAction.onClicked.addListener(function(tab) {
        window.close();
    });

    // Open messaging connection to background view
    port = chrome.runtime.connect({
            name: "popupClose"
    });
}


$(document).ready(function() {
    $('#total').html(
        chrome.extension.getBackgroundPage().totalOpen);
    $('#opened').html(
        chrome.extension.getBackgroundPage().totalCreated);
    $('#closed').html(
        chrome.extension.getBackgroundPage().totalRemoved);
        // Add current time to data.
        time = new Date()
        currentTime = time.getTime() - (time.getTimezoneOffset() * 60 * 1000);
        d = (chrome.extension.getBackgroundPage().tabTimestamps).concat(
            [[currentTime, chrome.extension.getBackgroundPage().totalOpen]]);
        //d = chrome.extension.getBackgroundPage().timedTabs;
        $.plot($("#graph"),
            [{data: d, lines: {show: true, steps: true}}],
            {
                xaxis: { mode: "time", twelveHourClock: true },
                yaxis: {tickDecimals: 0}
            }
        );
});