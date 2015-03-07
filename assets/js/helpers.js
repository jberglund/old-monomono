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



function bindSearchKeys(items){
    var currentlySelectedItem;
    var allItems = items;
    console.log(allItems);
    $(document).keydown(function(e) {

        switch(e.which) {
            case 38: // up
            console.log('up');
                if(currentlySelectedItem){
                    currentlySelectedItem.removeClass('selected');
                    next = currentlySelectedItem.prev();
                    if(next.length > 0){
                        currentlySelectedItem = next.addClass('selected');
                    }else{
                        // Would be nice if we went up to search again after this.
                        currentlySelectedItem = allItems.last().addClass('selected');
                    }
                }else{
                    currentlySelectedItem = allItems.last().addClass('selected');
                }
            break;

            case 40: // down
            console.log('down');
                if(currentlySelectedItem){
                    currentlySelectedItem.removeClass('selected');
                    next = currentlySelectedItem.next();
                    if(next.length > 0){
                        currentlySelectedItem = next.addClass('selected');
                    }else{
                        currentlySelectedItem = allItems.eq(0).addClass('selected');
                    }
                }else{
                    console.log('msg');
                    currentlySelectedItem = allItems.eq(0).addClass('selected');
                }
            break;
            case 13:
                currentlySelectedItem.trigger('click');
                currentlySelectedItem.removeClass('selected');
                currentlySelectedItem = null;
                break;
            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
}
