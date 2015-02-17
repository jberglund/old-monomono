function addInputCallback(element, callback, delay) {
    var timer = null;
    element.onkeypress = function() {
        if (timer) {
            window.clearTimeout(timer);
        }
        timer = window.setTimeout( function() {
            timer = null;
            callback();
        }, delay );
    };
    element = null;
}