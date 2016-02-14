define([], function () {

    var themeId = 'okuru';
	
	function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Audio",
            Limit: 9,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            Okuru.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadPlaylists(element, parentId) {

        var options = {

            SortBy: "SortName",
            SortOrder: "Ascending",
            IncludeItemTypes: "Playlist",
            Recursive: true,
            ParentId: parentId,
            Fields: "PrimaryImageAspectRatio,SortName,CumulativeRunTimeTicks,CanDelete",
            StartIndex: 0,
            Limit: 9
        };

        return Emby.Models.playlists(options).then(function (result) {

            var section = element.querySelector('.playlistsSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth,
                showTitle: true
            });
        });
    }

    function loadRecentlyPlayed(element, parentId) {

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.recentlyPlayedSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function loadFrequentlyPlayed(element, parentId) {

        var options = {

            SortBy: "PlayCount",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.frequentlyPlayedSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function loadFavoriteSongs(element, parentId) {

        var options = {

            SortBy: "Random",
            IncludeItemTypes: "Audio",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsFavorite",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.favoriteSongsSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function loadFavoriteAlbums(element, parentId) {

        var options = {

            SortBy: "Random",
            IncludeItemTypes: "MusicAlbum",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsFavorite",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.favoriteAlbumsSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadFavoriteArtists(element, parentId) {

        var options = {

            SortBy: "Random",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsFavorite",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.artists(options).then(function (result) {

            var section = element.querySelector('.favoriteArtistsSection');

            Okuru.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: Okuru.CardBuilder.homePortraitWidth
            });
        });
    }

    function gotoMusicView(tab, parentId) {

        Emby.Page.show(Emby.PluginManager.mapRoute(themeId, 'music/music.html?tab=' + tab + "&parentid=" + parentId));
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        if (autoFocus) {
            Emby.FocusManager.autoFocus(element, true);
        }

        self.loadData = function (isRefresh) {

            if (isRefresh) {
                return Promise.resolve();
            }

            return Promise.all([
                loadLatest(element, parentId),
                loadPlaylists(element, parentId),
                loadRecentlyPlayed(element, parentId),
                loadFrequentlyPlayed(element, parentId),
                loadFavoriteSongs(element, parentId),
                loadFavoriteAlbums(element, parentId),
                loadFavoriteArtists(element, parentId)
            ]);
        };

        element.querySelector('.artistsCard').addEventListener('click', function () {
            gotoMusicView('albumartists', parentId);
        });

        element.querySelector('.albumsCard').addEventListener('click', function () {
            gotoMusicView('albums', parentId);
        });

        element.querySelector('.genresCard').addEventListener('click', function () {
            gotoMusicView('genres', parentId);
        });

        self.destroy = function () {

        };
    }

    return view;

});