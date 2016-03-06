define(['./spotlight', 'focusManager', './../components/backdrop'], function (spotlight, focusManager, skinBackdrop) {

    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.resumable(options).then(function (result) {

            var section = element.querySelector('.resumeSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 1,
                width: Okuru.CardBuilder.homeThumbWidth,
                preferThumb: true,
                addImageData: true
            });
        });
    }

    function loadNextUp(element, parentId) {

        var options = {

            Limit: 50,
            ParentId: parentId
        };

        return Emby.Models.nextUp(options).then(function (result) {
            var item = result[0];
        	//skinBackdrop.setBackdrops([item]);
            var section = element.querySelector('.nextUpSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 1,
                width: Okuru.CardBuilder.homeThumbWidth,
                preferThumb: true,
                addImageData: true
            });
        });
    }

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Episode",
            Limit: 50,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.latestItems(options).then(function (result) {
            var item = result[0];
        	skinBackdrop.setBackdrops([item]);
            var section = element.querySelector('.latestSection');

            Okuru.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 1,
                width: Okuru.CardBuilder.homeThumbWidth,
                preferThumb: true,
                showGroupCount: true
            });
        });
    }

    function loadImages(element, parentId) {

        var options = {

            SortBy: "IsFavoriteOrLiked,Random",
            IncludeItemTypes: "Series",
            Limit: 3,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        return Emby.Models.items(options).then(function (result) {

            var items = result.Items;
            var imgOptions = {
                maxWidth: 240
            };

            if (items.length > 0) {
                element.querySelector('.tvFavoritesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[0], imgOptions) + "')";
            }

            if (items.length > 1) {
                element.querySelector('.allSeriesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[1], imgOptions) + "')";
            }
        });
    }
    function addEventListeners() {
        var latestSection = document.querySelector('.latestSection');
        latestSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.latestItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
               // skinBackdrop.setBackdrops([item]);
            });
        }, true);
        
        var nextUpSection = document.querySelector('.nextUpSection');
        nextUpSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.nextUpSection .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
                //skinBackdrop.setBackdrops([item]);
            });
        }, true);        
    }
    function view(element, parentId, autoFocus) {

        var self = this;
        var skinId = 'okuru';

        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function () {

            return Promise.all([
            //loadResume(element, parentId),
            loadNextUp(element, parentId),
            loadLatest(element, parentId)
            ]);
        };

        var latestSection = document.querySelector('.latestSection');
        latestSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.latestItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
                skinBackdrop.setBackdrops([item]);
            });
        }, true);        
        
        var nextUpSection = document.querySelector('.nextUpSection');
        nextUpSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.nextUpItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
               // skinBackdrop.setBackdrops([item]);
            });
        }, true);                

        self.destroy = function () {

        };

        bindFlipEvents(element.querySelector('.nextUpSection'));
        //bindFlipEvents(element.querySelector('.resumeSection'));
    }

    function bindFlipEvents(element) {

        element.addEventListener('focus', function (e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card) {
                startCardFlipTimer(card);
            }

        }, true);
    }

    var cardFlipTimer;
    function startCardFlipTimer(card) {

        if (cardFlipTimer) {
            clearTimeout(cardFlipTimer);
            cardFlipTimer = null;
        }

        if (card.querySelector('.cardRevealContent')) {
            // Already flipped
            return;
        }

        // It doesn't have an image
        if (!card.querySelector('.primaryImageTag')) {
            return;
        }

        cardFlipTimer = setTimeout(function () {
            flipCard(card);
        }, 3000);
    }

    function flipCard(card) {

        if (document.activeElement != card) {
            return;
        }

        if (card.querySelector('.cardRevealContent')) {
            // Already flipped
            return;
        }

        // Also cancel if not in document

        var cardImageContainer = card.querySelector('.cardImageContainer');

        var newCardImageContainer = document.createElement('div');
        newCardImageContainer.classList.add('cardImage');
        newCardImageContainer.classList.add('coveredImage');
        newCardImageContainer.classList.add('cardRevealContent');

        var imgUrl = Emby.Models.imageUrl(card.getAttribute('data-id'), {
            tag: card.querySelector('.primaryImageTag').value,
            type: 'Primary',
            maxWidth: 400
        });

        newCardImageContainer.style.backgroundImage = "url('" + imgUrl + "')";
        newCardImageContainer.classList.add('hide');
        cardImageContainer.appendChild(newCardImageContainer);

        flipElementWithDuration(card, 600, function () {
            newCardImageContainer.classList.remove('hide');

            setTimeout(function () {
                newCardImageContainer.parentNode.removeChild(newCardImageContainer);
            }, 4000);
        });
    }

    function flipElementWithDuration(elem, duration, callback) {

        if (!elem.animate) {

            callback();
            return;
        }

        elem.style.transform = 'perspective(400px) rotate3d(1, 0, 0, -180deg)';

        // Switch to SequenceEffect once that api is a little more mature
        var keyframes = [
          { transform: 'perspective(400px) ', offset: 0 },
          { transform: 'perspective(400px) rotate3d(1, 0, 0, -180deg)', offset: 1 }];

        var timing = { duration: duration, iterations: 1, easing: 'ease-in' };
        elem.animate(keyframes, timing).onfinish = function () {
            callback();
            elem.style.transform = '';
        };
    }

    return view;

});
