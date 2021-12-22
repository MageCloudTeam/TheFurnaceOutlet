// Override Settings
var boostPFSInstantSearchConfig = {
    search: {
        suggestionMobileStyle: 'style1'
    }
};

// Override Settings
(function () {  // Add this
  BoostPFS.inject(this);  // Add this

  // Customize style of Suggestion box
  SearchInput.prototype.customizeInstantSearch = function(suggestionElement, searchElement, searchBoxId) {  
  };

  // BoostPFS.prototype.buildSearchResultHeader = function(data){
  // 	jQ('.boost-pfs-filter-breadcrumb').each(function(index, breadcrumb) {
  // 		var html = jQ(breadcrumb).html();
  // 		html = html.replace(/{{terms}}/, Globals.queryParams.q)
  // 		jQ(breadcrumb).html(html);
  // 		jQ(breadcrumb).removeClass('hidden');
  // 	})	
  // };

  // InstantSearch.prototype.beforeInit = function (id) {
  // 	if (Settings.getSettingValue('search.enableSuggestion')) {

  // 		//Remove theme's instant search
  // 		removeThemeSearchEvent();

  // 		var self = this;
  // 		if (typeof id === 'undefined') {
  // 			jQ('input[name="' + this.searchTermKey + '"]').each(function (i) {
  // 				if (!jQ(this)[0].hasAttribute('data-no-bc-search')) {
  // 					var id = 'boost-pfs-search-box-' + i;
  // 					jQ(this).attr('id', id);
  // 					self.buildSearchBox('#' + id)
  // 				}
  // 			});
  // 		} else {
  // 			this.buildSearchBox(id);
  // 		}
  // 		if (this.isMobile()) {
  // 			// Clear cache when going back from another page
  // 			window.onpageshow = function (event) {
  // 				if (event.persisted) {
  // 					window.location.reload();
  // 				}
  // 			};
  // 			// Build Suggestion mobile on top
  // 			if (Settings.getSettingValue('search.suggestionMobileStyle') == 'style1') {
  // 				this.buildSuggestionMobile();
  // 			}
  // 		}
  // 	}
  // };

  // function removeThemeSearchEvent() {
  // 	// Remove all events
  // 	if (jQ('.header__search-bar-wrapper').length > 0) {
  // 		var cloneSearchBar = jQ('.header__search-bar-wrapper:first').clone();
  // 		jQ('.header__search-bar-wrapper').replaceWith(cloneSearchBar);
  // 		jQ('.search-bar__filter').hide();
  // 	}
  // 	// Rebuild some event
  // 	if (jQ('[data-action="toggle-search"]').length > 0) {
  // 		jQ('[data-action="toggle-search"]').on('click', function () {
  // 			jQ('.header__search-bar-wrapper').toggleClass('is-visible');
  // 		})
  // 	}
  // 	if (jQ('[data-action="clear-input"]').length > 0) {
  // 		jQ('[data-action="clear-input"]').on('click', function () {
  // 			jQ('input[name="' + bcsffilter.searchTermKey + '"]').val('');
  // 		})
  // 	}
  // }
  
 var bindEvents = InstantSearchMobile.prototype.bindEvents;

  InstantSearchMobile.prototype.bindEvents = function() {
      bindEvents.call(this);

      var self = this;

      jQ('.header__action-item-link[data-action="toggle-search"]').off('click').click(function(e) {
        e.preventDefault();
        //e.stopPropagation();
        jQ('.search-bar__input').focus();
        self.openSuggestionMobile();

      });

  }
  
  var originalcloseInstantSearchMobile = InstantSearchMobile.prototype.closeInstantSearchMobile;
    InstantSearchMobile.prototype.closeInstantSearchMobile = function(isClose) {
          // Call the original function in our app lib.
          // We don't have to copy a very big function out here to modify.
          // function.call(this, param1, param2) binds the "this" pointer and params to the original function.
          originalcloseInstantSearchMobile.call(this,isClose);

          // Do your custom code after the original function has run

        jQ('.header__search-bar-wrapper').removeClass('is-visible');


    }
  

})();  // Add this at the end