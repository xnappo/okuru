define(['loading', 'alphapicker', './../components/horizontallist', './../components/focushandler', './../components/tabbedpage', './../components/backdrop', 'focusManager'], function (loading, alphaPicker, horizontalList, focusHandler, tabbedPage, skinBackdrop, focusManager) {

    var skinId = 'okuru';
	
    return function(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            skinBackdrop.setStaticBackdrop();

            if (!self.tabbedPage) {
                loading.show();
                renderTabs(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.focusHandler) {
                self.focusHandler.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            var tabs = [
            {
                Name: Globalize.translate('Series'),
                Id: "series"
            },
            {
                Name: Globalize.translate('Upcoming'),
                Id: "upcoming"
            },
            {
                Name: Globalize.translate('Genres'),
                Id: "genres"
            },
            {
                Name: Globalize.translate('Favorites'),
                Id: "favorites"
            }];

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });

            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }
                if (self.focusHandler) {
                    self.focusHandler.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                var showAlphaPicker = false;
                var showListNumbers = false;

                switch (id) {

                    case 'series':
                        showAlphaPicker = true;
                        showListNumbers = true;
                        renderSeries(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'genres':
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'upcoming':
                        renderUpcoming(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'favorites':
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    default:
                        break;
                }

                if (showListNumbers) {
                    page.querySelector('.listNumbers').classList.remove('hide');
                } else {
                    page.querySelector('.listNumbers').classList.add('hide');
                }

                if (self.alphaPicker) {
                    self.alphaPicker.visible(showAlphaPicker);
                    self.alphaPicker.enabled(showAlphaPicker);
                }
            });
        }

        function renderUpcoming(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new horizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.upcoming({
                        ImageTypeLimit: 1,
                        EnableImageTypes: "Primary,Backdrop,Thumb",
                        StartIndex: startIndex,
                        Limit: Math.min(limit, 60),
                        ParentId: pageParams.parentid
                    });
                },
                autoFocus: autoFocus,
                cardOptions: {
                    shape: 'backdropCard',
                    rows: 3,
                    preferThumb: true,
                    width: Okuru.CardBuilder.homeThumbWidth,
                    indexBy: 'PremiereDate'
                },
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderSeries(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new horizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Series",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderGenres(page, pageParams, autoFocus, slyFrame, resolve) {

            Emby.Models.genres({
                ParentId: pageParams.parentid,
                SortBy: "SortName"

            }).then(function (genresResult) {

                self.listController = new horizontalList({

                    itemsContainer: page.querySelector('.contentScrollSlider'),
                    getItemsMethod: function (startIndex, limit) {
                        return Emby.Models.items({
                            StartIndex: startIndex,
                            Limit: limit,
                            ParentId: pageParams.parentid,
                            IncludeItemTypes: "Series",
                            Recursive: true,
                            SortBy: "SortName",
                            Fields: "Genres"
                        });
                    },
                    autoFocus: autoFocus,
                    slyFrame: slyFrame,
                    onRender: function () {
                        if (resolve) {
                            resolve();
                            resolve = null;
                        }
                    },
                    cardOptions: {
                        indexBy: 'Genres',
                        genres: genresResult.Items,
                        indexLimit: 4,
                        parentId: pageParams.parentid
                    }
                });

                self.listController.render();
            });
        }

        function renderFavorites(page, pageParams, autoFocus, slyFrame, resolve) {

            fetch(Emby.PluginManager.mapUrl(skinId, 'tv/views.favorites.html'), { mode: 'no-cors' }).then(function (response) {
                return response.text();
            }).then(function (html) {

                var parent = page.querySelector('.contentScrollSlider');
                parent.innerHTML = Globalize.translateHtml(html, skinId);
                loadFavoriteSeries(parent, pageParams, autoFocus, resolve);
                loadFavoriteEpisodes(parent, pageParams);
            });

            self.focusHandler = new focusHandler({
                parent: page.querySelector('.contentScrollSlider'),
                slyFrame: slyFrame,
                selectedItemInfoInner: page.querySelector('.selectedItemInfoInner')
            });
        }

        function loadFavoriteSeries(parent, pageParams, autoFocus, resolve) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "Series",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteSeriesSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                Okuru.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: 2
                });

                if (autoFocus) {
                    setTimeout(function () {
                        var firstCard = section.querySelector('.card');
                        if (firstCard) {
                            focusManager.focus(firstCard);
                        }
                    }, 400);
                }
                resolve();
            });
        }

        function loadFavoriteEpisodes(parent, pageParams) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "Episode",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteEpisodesSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                Okuru.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: 3
                });
            });
        }
    }

});
