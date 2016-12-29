define(['loading', 'scroller', './focushandler', 'focusManager', 'scrollHelper', 'browser', 'emby-button', 'scrollStyles'], function (loading, scroller, focusHandler, focusManager, scrollHelper, browser) {
    'use strict';
    var btnSub1Target;
    var btnSub2Target;
    var btnSub3Target;
    var subMenuInit = false;

    function focusViewSlider() {

        var selected = this.querySelector('.selected');

        if (selected) {
            focusManager.focus(selected);
        } else {
            focusManager.autoFocus(this);
        }
    }

    function createHeaderScroller(view, instance, initialTabId) {

    	var userViewNames = view.querySelector('.userViewNames');

        userViewNames.classList.add('smoothScrollX');
        userViewNames.classList.add('focusable');
        userViewNames.classList.add('focuscontainer-x');
        userViewNames.style.scrollBehavior = 'smooth';
        userViewNames.focus = focusViewSlider;

            loading.hide();

            var initialTab = initialTabId ? userViewNames.querySelector('.btnUserViewHeader[data-id=\'' + initialTabId + '\']') : null;

            if (!initialTab) {
                initialTab = userViewNames.querySelector('.btnUserViewHeader');
            }

        // In Edge the web components aren't always immediately accessible
        setTimeout(function () {
            instance.setFocusDelay(view, initialTab);
        }, 0);
    }

    function parentWithClass(elem, className) {

        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
		}

        return elem;
    }
    /*
    function onInputCommand(e) {
    	var subMenu = document.querySelector('.subMenuButtonsContainer');
    	var elem = parentWithClass(e.target, 'btnUserViewHeader');
        if (elem) {
        	switch (e.detail.command) {
            	 case 'down':
            	 	 setTimeout(function () {
            	 	 		 focusManager.autoFocus(subMenu);
            	 	 }, 0);
            	 	 break;
            }
		}

        return elem;
    }*/
    
    function initEvents(view, instance) {

        // Catch events on the view headers
        var btnFavorites = view.querySelector('.btnFavorites');
        var userViewNames = view.querySelector('.userViewNames');
        userViewNames.addEventListener('click', function (e) {

            var elem = parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {
                scrollHelper.toCenter(userViewNames, elem, true);
                instance.setFocusDelay(view, elem);
            }
        });
        var btnSub1 = view.querySelector('.btnSub1');
        var btnSub2 = view.querySelector('.btnSub2');
        var btnSub3 = view.querySelector('.btnSub3');

        userViewNames.addEventListener('focus', function (e) {

            var elem = parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {            
                scrollHelper.toCenter(userViewNames, elem, true);
                instance.setFocusDelay(view, elem);
            }
            var viewType = elem.getAttribute('data-type');
            var viewId = elem.getAttribute('data-id');


            if (viewType) {
            	switch(viewType) {
                	case 'movies':
                		btnSub1.innerHTML = 'Genres';
                		btnSub1Target = Emby.PluginManager.mapRoute(self, 'movies/movies.html?tab=genres&parentid=' + viewId);
                		btnSub2.innerHTML = 'Unwatched';
                	    btnSub2Target = Emby.PluginManager.mapRoute(self, 'movies/movies.html?tab=unwatched&parentid=' + viewId);
                		btnSub3.innerHTML = 'Favorites';
                		btnSub3Target = Emby.PluginManager.mapRoute(self, 'movies/movies.html?tab=favorites&parentid=' + viewId);
                		break;
                	case 'tvshows':
                		btnSub1.innerHTML = 'Genres';
                		btnSub1Target = Emby.PluginManager.mapRoute(self, 'tv/tv.html?tab=genres&parentid=' + viewId);
                		btnSub2.innerHTML = 'Upcoming';
                		btnSub2Target = Emby.PluginManager.mapRoute(self, 'tv/tv.html?tab=upcoming&parentid=' + viewId);
                		btnSub3.innerHTML = 'Favorites';
                		btnSub3Target = Emby.PluginManager.mapRoute(self, 'tv/tv.html?tab=favorites&parentid=' + viewId);
                		break;
                	case 'music':
                		btnSub1.innerHTML = 'Genres';
                		btnSub1Target = Emby.PluginManager.mapRoute(self, 'music/music.html?tab=genres&parentid=' + viewId);
                		btnSub2.innerHTML = 'Artist';
                		btnSub2Target = Emby.PluginManager.mapRoute(self, 'music/music.html?tab=artists&parentid=' + viewId);
                		btnSub3.innerHTML = 'Favorites';
                		btnSub3Target = Emby.PluginManager.mapRoute(self, 'music/music.html?tab=favorites&parentid=' + viewId);
                		break;
                    default:
                		btnSub1.innerHTML = '';
                		btnSub2.innerHTML = '';
                		btnSub3.innerHTML = '';
                }
            }
        }, true);

       userViewNames.addEventListener('click', function (e) {
            var elem = parentWithClass(e.target, 'btnUserViewHeader');
            if (elem) {
                var viewId = elem.getAttribute('data-id');
                var viewType = elem.getAttribute('data-type');
                if (viewType) {
                    switch(viewType) {
                	    case 'movies':
                	        Emby.Page.show(Emby.PluginManager.mapRoute(self, 'movies/movies.html?parentid=' + viewId));
                	        break;
                	    case 'tvshows':
                	        Emby.Page.show(Emby.PluginManager.mapRoute(self, 'tv/tv.html?parentid=' + viewId));
                	        break;
                	    case 'music':
                	        Emby.Page.show(Emby.PluginManager.mapRoute(self, 'music/music.html?parentid=' + viewId));
                	        break;
                	    case 'homevideos':
                	        Emby.Page.show(Emby.PluginManager.mapRoute(self, 'list/list.html?parentid=' + viewId));
                	        break;
                	    case 'folders':
                	        Emby.Page.show(Emby.PluginManager.mapRoute(self, 'list/list.html?parentid=' + viewId));
                	        break;
                	    default:
                		    Emby.Page.show(Emby.PluginManager.mapRoute(self, 'list/list.html?parentid=' + viewId));
                	}
                }
            }
       }, true);
        if (!subMenuInit) {
        document.querySelector('.btnSub1').addEventListener('click', function () {
               Emby.Page.show(btnSub1Target);
        });
        document.querySelector('.btnSub2').addEventListener('click', function () {
               Emby.Page.show(btnSub2Target);
        });
        document.querySelector('.btnSub3').addEventListener('click', function () {
               Emby.Page.show(btnSub3Target);
        });
        subMenuInit=true;
        }
    }

    function selectUserView(page, id, self) {

        var btn = page.querySelector(".btnUserViewHeader[data-id='" + id + "']");

        self.bodyScroller.slideTo(0, true);

        var contentScrollSlider = page.querySelector('.contentScrollSlider');
        contentScrollSlider.innerHTML = '';
        var promise = self.loadViewContent.call(self, page, id, btn.getAttribute('data-type'));

        // Only enable the fade if native WebAnimations are supported
        if (promise && browser.animate) {
            promise.then(function () {
                fadeInRight(contentScrollSlider);
            });
        }
    }

    function fadeInRight(elem) {

        var translateX = Math.round(window.innerWidth / 100);
        var keyframes = [
          { opacity: '0', transform: 'translate3d(1%, 0, 0)', offset: 0 },
          { opacity: '1', transform: 'none', offset: 1 }];
        var timing = { duration: 300, iterations: 1 };
        elem.animate(keyframes, timing);
    }

    function tabbedPage(page, pageOptions) {

        var self = this;
        pageOptions = pageOptions || {};

        // lock the height so that the location of the top tabs won't fluctuate
        var contentScrollSlider = page.querySelector('.contentScrollSlider');
        contentScrollSlider.classList.add('focuscontainer-x');

        var selectedItemInfoElement = page.querySelector('.selectedItemInfo');
        var selectedIndexElement = page.querySelector('.selectedIndex');

        var tagName = 'button';

        self.renderTabs = function (tabs, initialTabId) {

            page.querySelector('.userViewNames').innerHTML = tabs.map(function (i) {

                return '<' + tagName + ' is="emby-button" class="flat btnUserViewHeader button-flat" data-id="' + i.Id + '" data-type="' + (i.CollectionType || '') + '"><h3 class="userViewButtonText">' + i.Name.toUpperCase() + '</h3></' + tagName + '>';

            }).join('');

            createHeaderScroller(page, self, initialTabId);
            createHorizontalScroller(page);
            initEvents(page, self);
        };

        var viewsScrollSlider = page.querySelector('.viewsScrollSlider');
        viewsScrollSlider.classList.add('focusable');
        viewsScrollSlider.classList.add('focuscontainer-x');
        viewsScrollSlider.focus = focusViewSlider;

        function onAlphaPickerValueChanged() {

            var value = pageOptions.alphaPicker.value();

            trySelectValue(value);
        }

        function trySelectValue(value) {

            var card;

            // If it's the symbol just pick the first card
            if (value === '#') {

                card = contentScrollSlider.querySelector('.card');

                if (card) {
                    self.bodyScroller.toCenter(card, false);
                    return;
                }
            }

            card = contentScrollSlider.querySelector('.card[data-prefix^=\'' + value + '\']');

            if (card) {
                self.bodyScroller.toCenter(card, false);
                return;
            }

            // go to the previous letter
            var values = pageOptions.alphaPicker.values();
            var index = values.indexOf(value);

            if (index < values.length - 2) {
                trySelectValue(values[index + 1]);
            } else {
                var all = contentScrollSlider.querySelectorAll('.card');
                card = all.length ? all[all.length - 1] : null;

                if (card) {
                    self.bodyScroller.toCenter(card, false);
                }
            }
        }

        if (pageOptions.alphaPicker) {
            pageOptions.alphaPicker.on('alphavaluechanged', onAlphaPickerValueChanged);
        }

        function focusViewSlider() {

            var selected = this.querySelector('.selected');

            if (selected) {
                focusManager.focus(selected);
            } else {
                focusManager.autoFocus(this);
            }
        }

        var focusTimeout;
        var focusDelay = 0;
        self.setFocusDelay = function (view, elem, immediate) {

            var viewId = elem.getAttribute('data-id');

            var btn = view.querySelector('.btnUserViewHeader.selected');

            if (btn) {

                if (viewId === btn.getAttribute('data-id')) {
                    return;
                }
            }

            if (elem !== btn) {
                if (btn) {
                btn.classList.remove('selected');
            }
            elem.classList.add('selected');
            }

            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }

            var onTimeout = function () {

                selectUserView(view, viewId, self);

            };

            if (immediate) {
                onTimeout();
            } else {
                focusTimeout = setTimeout(onTimeout, focusDelay);
            }

            // No delay the first time
            focusDelay = 700;
        };

        function createHorizontalScroller(view) {

            var scrollFrame = view.querySelector('.itemScrollFrame');

            var options = {
                horizontal: 1,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.contentScrollSlider'),
                itemSelector: '.card',
                smart: true,
                releaseSwing: true,
                scrollBy: 200,
                speed: 300,
                immediateSpeed: pageOptions.immediateSpeed,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1,
                scrollWidth: 500000
            };

            self.bodyScroller = new scroller(scrollFrame, options);
            self.bodyScroller.init();
            initFocusHandler(view, self.bodyScroller);
        }

        function initFocusHandler(view) {

            if (pageOptions.handleFocus) {

                var scrollSlider = view.querySelector('.contentScrollSlider');

                self.focusHandler = new focusHandler({
                    parent: scrollSlider,
                    selectedItemInfoElement: selectedItemInfoElement,
                    selectedIndexElement: selectedIndexElement,
                    animateFocus: pageOptions.animateFocus,
                    scroller: self.bodyScroller,
                    enableBackdrops: true
                });
            }
        }

        self.destroy = function () {

            if (pageOptions.alphaPicker) {
                pageOptions.alphaPicker.off('alphavaluechanged', onAlphaPickerValueChanged);
            }

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null;
            }
            if (self.bodyScroller) {
                self.bodyScroller.destroy();
                self.bodyScroller = null;
            }
        };
    }

    return tabbedPage;
});