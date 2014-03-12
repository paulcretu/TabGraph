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