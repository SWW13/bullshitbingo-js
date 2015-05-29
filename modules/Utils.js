module.exports = {
    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return uuid;
    },
    shuffle: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    removeHTML: function (string) {
        return string.replace(/<[^>]+>/ig, '');
    },
    isVisible: function (element) {
        /* Get the TOP position of a given element. */
        function getPositionTop(element) {
            var offset = 0;
            while (element) {
                offset += element.offsetTop;
                element = element.offsetParent;
            }
            return offset;
        }

        if (!element) {
            return false;
        }

        // Get the top and bottom position of the given element.
        var posTop = getPositionTop(element);
        var posBottom = posTop + element.offsetHeight;

        // Get the top and bottom position of the *visible* part of the window.
        var visibleTop = visibleTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        var visibleBottom = visibleTop + window.innerHeight;

        return ((posBottom >= visibleTop) && (posTop <= visibleBottom));
    }
};