// Contains all open and closed tab objects
var tabHistory = Array();
// Contains timestamps corresponding to tabs in tabHistory
var tabTimestamps = Array();

// Running totals for tabs
var totalCreated = 0;
var totalRemoved = 0;
// Total tabs currently open
var totalOpen = 0;
// Largest number of tabs ever open
var maxOpen = 0;

// Maximum value background colors are set to. Range is 0 - 255.
var MAX_COLOR_VALUE = 191;

// Things to run when starting the extension.
function init() {

    // Count currently open tabs when script starts.
    countTabs();

    // Listeners for created and removed tabs.
    chrome.tabs.onCreated.addListener(function(tab) {
        totalCreated++;
        update(tab);
    });
    chrome.tabs.onRemoved.addListener(function(tab) {
        totalRemoved++;
        update(tab);
    });

    // Setup listeners for closing popup
    initPopupCloseHack();
}

// Now run the function
init();

// Sets up the other half of the messaging hack in popup.js. See popup.js for
// details. This half detects when the popup closes and sets the popup again.
function initPopupCloseHack() {
    // Receive connection
    chrome.runtime.onConnect.addListener(function(port) {
        // Check to see that it's the connection from the popup hack
        if (port.name == "popupClose") {
            // Add listener for when popup disconnects
            port.onDisconnect.addListener(function() {
                // Set popup
                chrome.browserAction.setPopup({
                    popup: "popup.html"
                });
            });
        }
    });
}

// Counts all the currently open tabs. Should only be run once, at start.
function countTabs() {
    if (totalCreated == 0) {
        chrome.windows.getAll(null, function (windows) {
            for (w in windows) {
                chrome.tabs.getAllInWindow(windows[w].id, function (tabs) {
                    for (t in tabs) {
                        totalCreated++;
                        update(t);
                    }
                });
            }
        });
    } else  {
        console.log("countTabs should only be run at start");
    }
}



// Get current time with timezone offset.
function getCurrentTime() {
    time = new Date()
    return time.getTime() - (time.getTimezoneOffset() * 60 * 1000);
}

// Update the counter/history
function update(tab) {
    tabHistory.push(tab);
    tabTimestamps.push([getCurrentTime(), totalOpen]);
    totalOpen = totalCreated - totalRemoved;
    if (totalOpen > maxOpen)
        maxOpen = totalOpen;
    setIcon();
}

// Updates the icon area
function setIcon() {
    chrome.browserAction.setIcon(
        {imageData: draw(totalOpen, getColor(totalOpen, maxOpen))});
}

// Returns the color scaled from green to red based on the ratio of current tabs
// open to max tabs open.
function getColor(n, max) {
    var r = MAX_COLOR_VALUE;
    var g = MAX_COLOR_VALUE;
    if (n < max/2)
        r = (n/max) * (2*MAX_COLOR_VALUE);
    if (n > max/2)
        g = ((n/max) - 1) * -(MAX_COLOR_VALUE*2);
    return [parseInt(r.valueOf()), parseInt(g.valueOf()), 0, 255];
}

// Draw the extension bar icon
function draw(n, color) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var x = canvas.width/2;
    var y = canvas.height/2;
    var textSize = 15;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set style and fill background rectangle
    context.fillStyle    = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',127)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set font
    context.font         = 'bold ' + textSize + 'px Helvetica';
    context.textAlign    = 'center';
    context.textBaseline = 'middle';
    // Set text color
    context.fillStyle   = "rgba(255,255,255,255)";

    // Values with more than 2 digits don't fit, so we add a bar below
    if (n >= 100) {

        // Set color/weight
        context.strokeStyle = 'rgba(255,255,255,255)';
        context.lineWidth   = 2;
        
        // Draw line
        context.beginPath();
        context.moveTo(2, canvas.height - 3);
        context.lineTo(canvas.width - 2,  canvas.height - 3);
        context.stroke();
        context.closePath();
        
        // Move text up
        y -= 2;
    }

    // Draw text
    context.fillText(n.toString().substr(0, 2), x, y);
    
    return context.getImageData(0, 0, 19, 19);
}