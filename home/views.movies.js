define(['./spotlight', 'imageLoader', 'focusManager', './../components/backdrop'], function (spotlight, imageLoader, focusManager, themeBackdrop) {

    var themeId = 'okuru';
	
    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.resumable(options).then(function (result) {
            var item = result[0];  		
            var resumeSection = element.querySelector('.resumeSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                shape: 'portraitCard',
                rows: 1,
                width: Okuru.CardBuilder.homePortraitWidth,
                preferThumb: false
            });
        });
    }

    function loadLatest(element, parentId) {
        var options = {

            IncludeItemTypes: "Movie",
            Limit: 20,
            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.latestItems(options).then(function (result) {
            var item = result[0];
        	themeBackdrop.setBackdrops([item]);
            var latestSection = element.querySelector('.latestSection');

            Okuru.CardBuilder.buildCards(result, {
                parentContainer: latestSection,
                itemsContainer: latestSection.querySelector('.itemsContainer'),
                shape: 'portraitCard',
                rows: 1,
                width: Okuru.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadRecommendations(element, parentId) {

        return Emby.Models.movieRecommendations({

            categoryLimit: 4,
            ItemLimit: 8

        }).then(function (recommendations) {

            var values = recommendations.map(getRecommendationHtml);

            var recs = element.querySelector('.recommendations');

            if (recs) {
                recs.innerHTML = values.join('');

                imageLoader.lazyChildren(recs);
            }
        });
    }

    function getRecommendationHtml(recommendation) {

        var cardsHtml = Okuru.CardBuilder.buildCardsHtml(recommendation.Items, {
            shape: 'portraitCard',
            rows: 1,
            width: Okuru.CardBuilder.homePortraitWidth
        });

        var html = '';

        var title = '';

        switch (recommendation.RecommendationType) {

            case 'SimilarToRecentlyPlayed':
                title = Globalize.translate('RecommendationBecauseYouWatched').replace("{0}", recommendation.BaselineItemName);
                break;
            case 'SimilarToLikedItem':
                title = Globalize.translate('RecommendationBecauseYouLike').replace("{0}", recommendation.BaselineItemName);
                break;
            case 'HasDirectorFromRecentlyPlayed':
            case 'HasLikedDirector':
                title = Globalize.translate('RecommendationDirectedBy').replace("{0}", recommendation.BaselineItemName);
                break;
            case 'HasActorFromRecentlyPlayed':
            case 'HasLikedActor':
                title = Globalize.translate('RecommendationStarring').replace("{0}", recommendation.BaselineItemName);
                break;
        }

        html += '<div class="horizontalSection">';
        html += '<div class="sectionTitle">' + title + '</div>';

        html += '<div class="itemsContainer">';

        html += cardsHtml;

        html += '</div>';
        html += '</div>';

        
        
        html += '<div class="horizontalSection2">';
        html += '<div class="navContainerPortrait"></div><div class="sectionTitle">' + title + '</div>';

        html += '<div class="itemsContainer">';

        html += cardsHtml;

        html += '</div>';
        html += '</div>';
        
        return html;
    }

    function loadImages(element, parentId) {

        return Emby.Models.items({

            SortBy: "IsFavoriteOrLiked,Random",
            IncludeItemTypes: "Movie",
            Limit: 2,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"

        }).then(function (result) {

            var items = result.Items;
            var imgOptions = {
                maxWidth: 240
            };

            if (items.length > 0) {
                element.querySelector('.movieFavoritesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[0], imgOptions) + "')";
            }

            if (items.length > 1) {
                element.querySelector('.allMoviesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[1], imgOptions) + "')";
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
                themeBackdrop.setBackdrops([item]);
            });
        }, true);
        
        var resumeSection = document.querySelector('.resumeSection');
        resumeSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.resumeItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
                themeBackdrop.setBackdrops([item]);
            });
        }, true);        
    }
    function view(element, parentId, autoFocus) {

        var self = this;
        var themeId = 'okuru';
        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function (isRefresh) {

            var promises = [
                loadResume(element, parentId),
                loadLatest(element, parentId)
            ];

            if (!isRefresh) {
                promises.push(loadRecommendations(element, parentId));
            }

            return promises;
        };
        
        loadImages(element, parentId);
        addEventListeners();
        
        var latestSection = document.querySelector('.latestSection');
        latestSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.latestItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
                themeBackdrop.setBackdrops([item]);
            });
        }, true);        
        
        var resumeSection = document.querySelector('.resumeSection');
        resumeSection.addEventListener('focus', function (e) {
            var elem = Emby.Dom.parentWithClass(e.target, 'itemAction');
            var itemId = elem.getAttribute('data-id');

            console.log('.resumeItem .itemAction | Focus detected | Item ID', itemId);

            Emby.Models.item(itemId).then(function (item) {
                console.log('Emby.Models.item(itemId)', item);
                themeBackdrop.setBackdrops([item]);
            });
        }, true);                

        self.destroy = function () {

        };
    }

    return view;

});