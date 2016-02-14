define(['imageLoader', 'itemHelper', './backdrop', 'mediaInfo', 'focusManager'], function (imageLoader, itemHelper, themeBackdrop, mediaInfo, focusManager) {

    function focusHandler(options) {

        var self = this;

        var parent = options.parent;
        var focusedElement;
        var zoomElement;
        var currentAnimation;
        var zoomScale = options.zoomScale || (options.slyFrame.options.horizontal ? '1.16' : '1.12');
        var zoomInEase = 'ease-out-sine';
        var zoomOutEase = 'ease-in-cubic';
        var zoomDuration = 160;
        var lastFocus = 0;

        parent.addEventListener('focus', onFocusIn, true);
        parent.addEventListener('blur', onFocusOut, true);

        var selectedItemInfoInner = options.selectedItemInfoInner;
        var selectedIndexElement = options.selectedIndexElement;
        var selectedItemPanel;

        var enableSelectedItemPanel = options.selectedItemMode == 'panel';

        function onFocusIn(e) {
            var focused = focusManager.focusableParent(e.target);
            focusedElement = focused;

            if (focused) {

                if (selectedIndexElement) {
                    var index = focused.getAttribute('data-index');
                    if (index) {
                        selectedIndexElement.innerHTML = 1 + parseInt(index);
                    }
                }

                var now = new Date().getTime();

                var animate = (now - lastFocus) > 50;
                options.slyFrame.toCenter(focused, !animate);
                lastFocus = now;
                startZoomTimer();
            }
        }

        function onFocusOut(e) {
            clearSelectedItemInfo();

            var focused = focusedElement;
            focusedElement = null;

            var zoomed = zoomElement;
            zoomElement = null;

            if (zoomed) {
                zoomOut(zoomed);
            }

            if (currentAnimation) {
                currentAnimation.cancel();
                currentAnimation = null;
            }
        }

        var zoomTimeout;
        var selectedMediaInfoTimeout;
        function startZoomTimer() {

            if (zoomTimeout) {
                clearTimeout(zoomTimeout);
            }
            zoomTimeout = setTimeout(onZoomTimeout, 50);
            if (selectedMediaInfoTimeout) {
                clearTimeout(selectedMediaInfoTimeout);
            }
            var delay = enableSelectedItemPanel ? 2000 : 1200;
            selectedMediaInfoTimeout = setTimeout(onSelectedMediaInfoTimeout, delay);
        }

        function onZoomTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                zoomIn(focused);
            }
        }

        function onSelectedMediaInfoTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                setSelectedItemInfo(focused);
            }
        }

        function zoomIn(elem) {

            if (elem.classList.contains('noScale')) {
                return;
            }

            var card = elem;

            if (document.activeElement != card) {
                return;
            }

            var cardBox = card.querySelector('.cardBox');

            if (!cardBox) {
                return;
            }

            elem = cardBox;

            var keyframes = [
                { transform: 'scale(1)  ', offset: 0 },
              { transform: 'scale(' + zoomScale + ')', offset: 1 }
            ];

            if (currentAnimation) {
                //currentAnimation.cancel();
            }

            var onAnimationFinished = function () {
                zoomElement = elem;
                currentAnimation = null;
            };

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomInEase };
                var animation = elem.animate(keyframes, timing);

                animation.onfinish = onAnimationFinished;
                currentAnimation = animation;
            } else {
                onAnimationFinished();
            }
        }

        function setSelectedItemInfo(card) {

            var id = card.getAttribute('data-id');

            if (!id) {
                return;
            }

            if (options.enableBackdrops !== false || selectedItemInfoInner) {
                Emby.Models.item(id).then(function (item) {

                    if (options.enableBackdrops) {
                        themeBackdrop.setBackdrops([item], true);
                    }
                    setSelectedInfo(card, item);
                });
            }
        }

        function setSelectedInfo(card, item) {

            if (enableSelectedItemPanel) {
                var div = document.createElement('div');
                div.classList.add('selectedItemPanel');
                document.body.appendChild(div);
                selectedItemPanel = div;
                fillSelectedItemPanel(div, item);
                slideInLeft(div);
                return;
            }

            if (!selectedItemInfoInner) {
                return;
            }

            var html = '';

            var mediaInfoHtml = mediaInfo.getMediaInfoHtml(item);

            html += '<div>';
            html += '<div>';

            if (item.AlbumArtist) {
                html += item.AlbumArtist + " - ";
            }

            html += itemHelper.getDisplayName(item);
            html += '</div>';
            if (mediaInfoHtml) {
                html += '<div class="selectedItemMediaInfo">';
                html += mediaInfoHtml;
                html += '</div>';
            }
            html += '</div>';

            //if (item.Overview && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist') {
            //    html += '<div class="overview">';
            //    html += item.Overview;
            //    html += '</div>';
            //}

            var logoImageUrl = Emby.Models.logoImageUrl(item, {
            });

            if (logoImageUrl) {
                selectedItemInfoInner.classList.add('selectedItemInfoInnerWithLogo');

                html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';

            } else {
                selectedItemInfoInner.classList.remove('selectedItemInfoInnerWithLogo');
            }

            selectedItemInfoInner.innerHTML = html;

            var rect = card.getBoundingClientRect();
            selectedItemInfoInner.parentNode.style.left = (Math.max(rect.left, 70)) + 'px';

            if (html) {
                fadeIn(selectedItemInfoInner, 1);
            }
        }

        function fillSelectedItemPanel(elem, item) {

            var thumbImage = Emby.Models.thumbImageUrl(item);

            var html = '';

            if (thumbImage) {

                html += '<div class="selectedItemPanelImage lazy" data-src="' + thumbImage + '"></div>';
            }

            html += '<div class="selectedItemPanelContent">';

            html += '<div>';
            html += item.Name;
            html += '</div>';

            if (item.Taglines && item.Taglines.length) {
                html += '<p class="tagline">';
                html += item.Taglines[0];
                html += '</p>';
            }

            html += '</div>';

            elem.innerHTML = html;
            imageLoader.lazyChildren(elem);
        }

        function clearSelectedItemInfo() {

            if (enableSelectedItemPanel) {
                var panel = selectedItemPanel;
                if (panel) {
                    selectedItemPanel = null;
                    slideOutRightAndRemove(panel);
                }
            } else if (selectedItemInfoInner) {
                selectedItemInfoInner.innerHTML = '';
            }
        }

        function slideInLeft(elem) {

            var keyframes = [
                { transform: 'translate3d(100%, 0, 0)', offset: 0 },
                { transform: 'translate3d(0, 0, 0)', offset: 1 }
            ];

            var timing = { duration: 200, iterations: 1, fill: 'forwards', easing: 'ease-out' };
            elem.animate(keyframes, timing);
        }

        function slideOutRightAndRemove(elem) {

            var keyframes = [
                { transform: 'translate3d(0, 0, 0)', offset: 0 },
                { transform: 'translate3d(100%, 0, 0)', offset: 1 }
            ];

            var timing = { duration: 100, iterations: 1, fill: 'forwards', easing: 'ease-out' };
            elem.animate(keyframes, timing).onfinish = function () {
                elem.parentNode.removeChild(elem);
            };
        }

        function zoomOut(elem) {

            var keyframes = [
            { transform: 'scale(' + zoomScale + ')  ', offset: 0 },
            { transform: 'scale(1)', offset: 1 }
            ];

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomOutEase };
                elem.animate(keyframes, timing);
            }
        }

        function fadeIn(elem, iterations) {

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 300, iterations: iterations };
            return elem.animate(keyframes, timing);
        }

        self.destroy = function () {

            parent.removeEventListener('focus', onFocusIn, true);
            parent.removeEventListener('blur', onFocusOut, true);
        };
    }

    return focusHandler;
});