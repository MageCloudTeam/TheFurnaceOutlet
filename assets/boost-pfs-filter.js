var onSale = false;
var soldOut = false;
var priceVaries = false;
var images = [];
var firstVariant = {};

// Override Settings
var boostPFSFilterConfig = {
  general: {
    limit: boostPFSConfig.custom.products_per_page,
    loadProductFirst: true,
    numberFilterTree: 2,
    filterTreeMobileStyle: 'style1'
    //showLimitList: '24,36,48'
  }
};


(function () { // Add this
  BoostPFS.inject(this); // Add this

  /**************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM ****************/
  function prepareShopifyData(data) {
    // Displaying price base on the policy of Shopify, have to multiple by 100
    soldOut = !data.available; // Check a product is out of stock
    onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Convert images to array
    images = data.images_info;
    // Get First Variant (selected_or_first_available_variant)
    if (data.variants && data.variants.length > 0) {
      firstVariant = data.variants[0];
      if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
        var paramVariant = data.variants.filter(function (e) {
          return e.id == Utils.getParam('variant');
        });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
      } else {
        for (var i = 0; i < data.variants.length; i++) {
          if (data.variants[i].available) {
            firstVariant = data.variants[i];
            break;
          }
        }
      }
    }
    return data;
  }


  /***************************** BUILD PRODUCT LIST ****************************/
  // Build Product Grid Item
  ProductGridItem.prototype.compileTemplate = function (data, index) {

    if (!data) data = this.data;
    if (!index) index = this.index;
    // Get Template
    var itemHtml = boostPFSTemplate.productGridItemHtml;
    // Customize API data to get the Shopify data
    data = prepareShopifyData(data);

    // Add Grid Width class
    itemHtml = itemHtml.replace(/{{gridWidthClass}}/g, buildGridWidthClass(data));

    // Add Label
    itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data));

    // Add Image Properties
    var imageWrapperClass = boostPFSConfig.custom.show_secondary_image && images.length > 1 ? 'product-item__image-wrapper--with-secondary' : '';
    itemHtml = itemHtml.replace(/{{imageWrapperClass}}/g, imageWrapperClass);

    var imageAspectRatioClass = 'aspect-ratio--' + boostPFSConfig.custom.product_image_size;
    itemHtml = itemHtml.replace(/{{imageAspectRatioClass}}/g, imageAspectRatioClass);

    var imagePadding = 100;
    if (images && images.length > 0 && images[0].width && images[0].height) {
      imagePadding = 100 / (images[0].width / images[0].height);
    }
    itemHtml = itemHtml.replace(/{{imagePadding}}/g, imagePadding);

    // Add Images
    itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImages(data));

    // Add Info
    var itemInfoHtml = boostPFSConfig.custom.product_price_position == 'after_title' ?
      '{{itemVendor}}{{itemTitleWrapper}}{{itemSwatch}}{{itemPrice}}' :
      '{{itemPrice}}{{itemTitleWrapper}}{{itemVendor}}{{itemSwatch}}';

    itemHtml = itemHtml.replace(/{{itemInfo}}/g, itemInfoHtml);

    // Add Vendor
    var itemVendorHtml = boostPFSConfig.custom.show_vendor ? ('<a class="product-item__vendor link">' + data.vendor + '</a>') : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Title
    var itemTitleWrapperHtml = '<a href="{{itemUrl}}" class="product-item__title text--strong link">{{itemTitle}}</a>';
    itemHtml = itemHtml.replace(/{{itemTitleWrapper}}/g, itemTitleWrapperHtml);

    // Add price
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, buildPrice(data));

    // Add Swatch
    var itemSwatchHtml = boostPFSConfig.custom.show_color_swatch ? buildSwatch(data) : '';
    itemHtml = itemHtml.replace(/{{itemSwatch}}/g, itemSwatchHtml);

    // Add Reviews
    if (typeof Integration === 'undefined' || !Integration.hascompileTemplate('reviews')) {
      var itemReviews = '';

      if (boostPFSConfig.custom.hasOwnProperty('show_reviews_badge') && boostPFSConfig.custom.show_reviews_badge) {
        itemReviews = '<div class="ProductItem__Rating Heading Text--subdued u-h7">';
        var ratingInfo = Utils.getProductMetafield(data, 'reviews', 'rating') || '';
        var ratingValue = '';
        if (ratingInfo != '') {
          ratingInfo = JSON.parse(ratingInfo);
          ratingValue = ratingInfo.value;
          var rating_decimal = 0;
          var decimal = ratingValue % 1;
          if (decimal >= 0.3 && decimal <= 0.7) {
            rating_decimal = 0.5;
          } else if (decimal > 0.7) {
            rating_decimal = 1;
          }

          itemReviews += '<div class="rating">';
          itemReviews += '<div class="rating__stars" role="img" aria-label="';
          itemReviews += boostPFSConfig.label.star_reviews_info.replace(/{{rating_value}}/g, ratingValue).replace(/{{rating_max}}/g, ratingInfo.scale_max);
          itemReviews += '">';

          var rating_as_float = ratingValue * 1.0;
          var i;
          for (i = ratingInfo.scale_min; i <= ratingInfo.scale_max; i++) {
            if (rating_as_float >= i) {
              itemReviews += boostPFSConfig.custom.rating_star_full;
            } else {
              if (rating_decimal == 0.5) {
                itemReviews += boostPFSConfig.custom.rating_star_half;
              } else if (rating_decimal == 1) {
                itemReviews += boostPFSConfig.custom.rating_star_full;
              } else {
                itemReviews += boostPFSConfig.custom.rating_star_empty;
              }
              rating_decimal = false;
            }

          }

          itemReviews += '</div>';
          var rating_count = Utils.getProductMetafield(data, 'reviews', 'rating_count') || '';

          if (rating_count != '') {
            itemReviews += '<span class="rating__caption">' + boostPFSConfig.label.reviews_count.replace(/{{ count }}/g, rating_count) + '</span>';
          } else {
            itemReviews += '<span class="rating__caption">' + boostPFSConfig.label.reviews_count.replace(/{{ count }}/g, 0) + '</span>'
          }

          itemReviews += '</div>';


        } else {
          itemReviews += '<div class="rating">';
          itemReviews += '<div class="rating__stars" role="img" aria-label="';
          itemReviews += boostPFSConfig.label.star_reviews_info.replace(/{{ rating_value }}/g, 0).replace(/{{ rating_max }}/g, 5);
          itemReviews += '">';
          var j;
          for (j = 0; j < 5; j++) {
            itemReviews += boostPFSConfig.custom.rating_star_empty;
          }
          itemReviews += '</div>';
          itemReviews += '<span class="rating__caption">' + boostPFSConfig.label.reviews_count.replace(/{{ count }}/g, 0) + '</span>'
          itemReviews += '</div>';
        }

      }
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviews);

    }

    // Add Inventory
    itemHtml = itemHtml.replace(/{{itemInventory}}/g, buildInventory(data));

    // Add Quickview
    itemHtml = itemHtml.replace(/{{itemQuickView}}/g, buildQuickView(data));


    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrl(data));
    return itemHtml;
  };

  /************************ BUILD PRODUCT ITEM ELEMENTS ***********************/
  function buildGridWidthClass() {
    var gridWidthClass = '';
    switch (boostPFSConfig.custom.products_per_row) {
      case 3:
        gridWidthClass = '1/3--desk';
        break;
      case 4:
        gridWidthClass = '1/4--desk';
        break;
      default:
        gridWidthClass = '1/3--desk';
        break;
    }
    return gridWidthClass;
  }

  function buildLabels(data) {
    // Build Sale label
    var saleLabelHtml = '';
    if (boostPFSConfig.custom.show_discount && onSale) {
      var saveAmount = '';
      if (boostPFSConfig.custom.discount_mode === 'saving') {
        saveAmount = Utils.formatMoney(data.compare_at_price_min - data.price_min);
      } else {
        saveAmount = Math.round((data.compare_at_price_min - data.price_min) * 100 / data.compare_at_price_min) + '%';
      }
      saleLabelHtml = boostPFSTemplate.saleLabelHtml.replace(/{{savings}}/g, saveAmount);
    }

    //Build tag labels
    var tagLabelHtmls = '';
    if (data.tags && data.tags.length > 0) {
      var tagLabelHtml1 = '';
      var tagLabelHtml2 = '';
      for (var i = 0; i < data.tags.length; i++) {
        var tag = data.tags[i];
        if (tag.indexOf('__label:') !== -1) {
          tagLabelHtml1 += boostPFSTemplate.tagLabelHtml.replace(/{{tagLabelClass}}/g, 'product-label--custom1');
          tagLabelHtml1 = tagLabelHtml1.replace(/{{tagLabel}}/g, tag.split('__label:')[1]);
        }

        if (tag.indexOf('__label1:') !== -1) {
          tagLabelHtml1 += boostPFSTemplate.tagLabelHtml.replace(/{{tagLabelClass}}/g, 'product-label--custom1');
          tagLabelHtml1 = tagLabelHtml1.replace(/{{tagLabel}}/g, tag.split('__label1:')[1]);
        }

        if (tag.indexOf('__label2:') !== -1) {
          tagLabelHtml2 += boostPFSTemplate.tagLabelHtml.replace(/{{tagLabelClass}}/g, 'product-label--custom2');
          tagLabelHtml2 = tagLabelHtml2.replace(/{{tagLabel}}/g, tag.split('__label2:')[1]);
        }
      }
      tagLabelHtmls = tagLabelHtml1 + tagLabelHtml2;
    }

    // Build Labels
    return tagLabelHtmls + saleLabelHtml;
  }

  function buildImages(data) {
    // Build Main Image
    var firstImageHtml = boostPFSTemplate.imageHtml;
    if (images.length > 0) {
      var thumbUrl = Utils.optimizeImage(images[0].src, '60x');
      firstImageHtml = firstImageHtml.replace(/{{imageUrl}}/g, thumbUrl);
      firstImageHtml = firstImageHtml.replace(/{{imageId}}/g, images[0].id);
      firstImageHtml = firstImageHtml.replace(/{{image_url}}/g, Utils.optimizeImage(images[0].src, '{width}x'));
    } else {
      firstImageHtml = firstImageHtml.replace(/{{imageUrl}}/g, boostPFSConfig.general.no_image_url);
      firstImageHtml = firstImageHtml.replace(/{{imageId}}/g, '');
      firstImageHtml = firstImageHtml.replace(/{{image_url}}/g, Utils.optimizeImage(boostPFSConfig.general.no_image_url, '{width}x'));
    }

    // Build Image Swap
    var secondImageHtml = '';
    if (boostPFSConfig.custom.show_secondary_image && images.length > 1) {
      var flipImageUrl = Utils.optimizeImage(images[1].src, '60x');
      secondImageHtml = boostPFSTemplate.imageHtml;
      secondImageHtml = secondImageHtml.replace(/{{imageUrl}}/g, flipImageUrl);
      secondImageHtml = secondImageHtml.replace(/{{imageId}}/g, images[1].id);
      secondImageHtml = secondImageHtml.replace(/{{image_url}}/g, Utils.optimizeImage(images[1].src, '{width}x'));
      secondImageHtml = secondImageHtml.replace(/{{imageClass}}/g, 'product-item__secondary-image');
      firstImageHtml = firstImageHtml.replace(/{{imageClass}}/g, 'product-item__primary-image');
    } else {
      firstImageHtml = firstImageHtml.replace(/{{imageClass}}/g, 'product-item__primary-image');
    }

    return firstImageHtml + secondImageHtml;
  }

  function buildPrice(data) {
    var priceHtml = '<div class="product-item__price-list price-list">';
    if (data.price_min) {
      priceHtml += '<span class="price {{priceClass}}" data-money-convertible="">{{amount}}</span>';

      var priceAmount = priceAmount = boostPFSConfig.custom.currency_code_enabled ? Utils.formatMoney(data.price_min, 'money_with_currency') : Utils.formatMoney(data.price_min);
      if (priceVaries) {
        priceAmount = boostPFSConfig.label.from.replace(/{{price_min}}/g, boostPFSConfig.custom.currency_code_enabled ? Utils.formatMoney(data.price_min, 'money_with_currency') : Utils.formatMoney(data.price_min));
      }
      priceHtml = priceHtml.replace(/{{amount}}/g, priceAmount);
      priceHtml = priceHtml.replace(/{{priceClass}}/g, onSale ? 'price--highlight' : '');

      if (onSale) {
        priceHtml += '<span class="price price--compare" data-money-convertible="">' + boostPFSConfig.custom.currency_code_enabled ? Utils.formatMoney(data.compare_at_price_min, 'money_with_currency') : Utils.formatMoney(data.compare_at_price_min) + '</span>';
      }
    }
    priceHtml += '</div>';
    return priceHtml;
  }

  function buildSwatch(data) {
    var swatchHtml = '';
    if (boostPFSConfig.custom.show_filter_color_swatch) {
      var color_labels = 'color,colour,couleur,colore,farbe,색,色,カラー,färg,farve'.split(',');
      var foundColorOption = false;
      var swatchItems = [];
      // Color Swatch
      data.options_with_values.forEach(function(option, optionIndex) {
        if (foundColorOption) return;

        if (color_labels.indexOf(option.name.toLowerCase()) !== -1) {
          foundColorOption = true;
          option.values.forEach(function (colorValue, colorIndex) {
            var colorName = colorValue.title;
            var variantId = '';

            // Get variant with the color
            var variant = null;
            data.variants.forEach(function (dataVariant) {
              var variantColorName = dataVariant.merged_options[optionIndex].split(':')[1];
              if (variantColorName == colorName) {
                if (!variant) {
                  variant = dataVariant;
                } else if (!variant.image && dataVariant.image) {
                  variant = dataVariant;
                }
                variantId = dataVariant.id;
              }
            })

            // Get variant image info
            var variantImageInfo = {
              src: boostPFSConfig.general.no_image_url,
              id: 0,
              width: 480,
              height: 480
            };
            if (variant) {
              if (data.images_info.length > 0) variantImageInfo = data.images_info[0];
              data.images_info.forEach(function (image_info) {
                if (image_info.src == variant.image) {
                  variantImageInfo = image_info;
                }
              })
            }

            // Build swatch item
            if (variant) {
              var fileUrl = boostPFSConfig.general.file_url.split(/\/(?=[^\/]+$)/);
              var imageSwatchUrl = fileUrl[0] + '/' + Utils.slugify(colorName) + '_64x64.png' + fileUrl[1];
              var swatchItemHtml = '<div class="color-swatch {{whiteColorClass}}">' +
                '<input class="color-swatch__radio" type="radio" {{checked}} aria-hidden="true" ' +
                'name="collection-template-{{itemId}}" ' +
                'id="collection-template-{{itemId}}-{{colorIndex}}" ' +
                'value="{{colorName}}" ' +
                'data-variant-url="{{variantUrl}}" ' +
                'data-image-id="{{variantImageId}}" ' +
                'data-image-url="{{variantImageUrl}}" ' +
                'data-image-widths="[200,300,400,500,600,700]" ' +
                'data-image-aspect-ratio="{{aspectRatio}}">' +
                '<label class="color-swatch__item" ' +
                'for="collection-template-{{itemId}}-{{colorIndex}}" ' +
                'style="' + buildSwatchStyle(colorName, imageSwatchUrl) + '" ' +
                'title="{{colorName}}">' +
                '</label>' +
                '<a href="{{itemUrl}}" class="color-swatch__item-link">+{{colorIndexBackwards}}</a>' +
                '</div>';

              swatchItemHtml = swatchItemHtml.replace(/{{whiteColorClass}}/g, colorName.toLowerCase() == 'white' ? 'color-swatch--white' : '');
              swatchItemHtml = swatchItemHtml.replace(/{{checked}}/g, colorIndex == 0 ? 'checked="checked"' : '');
              swatchItemHtml = swatchItemHtml.replace(/{{colorIndex}}/g, colorIndex);
              swatchItemHtml = swatchItemHtml.replace(/{{colorIndexBackwards}}/g, option.values.length - colorIndex);
              swatchItemHtml = swatchItemHtml.replace(/{{colorName}}/g, colorName);
              swatchItemHtml = swatchItemHtml.replace(/{{colorBackground}}/g, Utils.slugify(colorName).split('-').pop());
              swatchItemHtml = swatchItemHtml.replace(/{{imageBackground}}/g, imageSwatchUrl);
              swatchItemHtml = swatchItemHtml.replace(/{{variantUrl}}/g, Utils.buildProductItemUrl(data) + '?variant=' + variant.id);
              swatchItemHtml = swatchItemHtml.replace(/{{variantImageId}}/g, variantId);
              swatchItemHtml = swatchItemHtml.replace(/{{variantImageUrl}}/g, variantImageInfo ? variantImageInfo.src : '');
              swatchItemHtml = swatchItemHtml.replace(/{{aspectRatio}}/g, variantImageInfo ? (variantImageInfo.width / variantImageInfo.height) : '');
              swatchItems.push(swatchItemHtml);
            }
          });
        }
      })
      if (swatchItems.length > 0) {
        swatchHtml = '<div class="product-item__swatch-list">' +
          '<div class="color-swatch-list">' +
          swatchItems.join(' ') +
          '</div>' +
          '</div>';

      }
    }
    return swatchHtml;
  }

  function buildSwatchStyle(colorName, imageSwatchUrl) {
    var color_value_downcase = colorName.toLowerCase();
    var color_swatch_style = 'background-color: ' + color_value_downcase;

    for (var i = 0; i < boostPFSThemeConfig.custom.color_swatch_config.length; i++) {
      var color_swatch_item = boostPFSThemeConfig.custom.color_swatch_config[i];
      var color_swatch_parts = color_swatch_item.split(':');
      var color_swatch_name = color_swatch_parts[0].toLowerCase().trim();

      if (color_value_downcase == color_swatch_name) {
        var color_swatch_value = color_swatch_parts[color_swatch_parts.length - 1].trim();
        if (color_swatch_value.indexOf('#') !== -1) {
          color_swatch_style = 'background-color: ' + color_swatch_value;
        } else {
          color_swatch_style = 'background-image: url(' + imageSwatchUrl + ')';
        }
        break;
      }
    }

    return color_swatch_style;
  }

  function buildInventory(data) {
    var inventoryHtml = '';
    if (boostPFSConfig.custom.show_inventory_quantity) {
      inventoryHtml = '<span class="product-item__inventory inventory {{inventoryClass}}">{{inventoryText}}</span>';
      if (soldOut) {
        inventoryHtml = inventoryHtml.replace(/{{inventoryClass}}/g, '');
        inventoryHtml = inventoryHtml.replace(/{{inventoryText}}/g, boostPFSConfig.label.sold_out);
      } else if (data.variants && data.variants.length > 0) {
        if (boostPFSConfig.custom.low_inventory_threshold > 0) {
          var numberInStock = 0;
          for (var i = 0; i < data.variants.length; i++) {
            numberInStock += data.variants[i].inventory_quantity;
          }
          if (numberInStock > boostPFSConfig.custom.low_inventory_threshold) {
            var inventoryText = numberInStock == 1 ? boostPFSConfig.label.in_stock_with_quantity_count.one : boostPFSConfig.label.in_stock_with_quantity_count.other;
            inventoryText = inventoryText.replace(/{{count}}/g, numberInStock);
            inventoryHtml = inventoryHtml.replace(/{{inventoryClass}}/g, 'inventory--high');
            inventoryHtml = inventoryHtml.replace(/{{inventoryText}}/g, inventoryText);
          } else {
            var inventoryText = numberInStock == 1 ? boostPFSConfig.label.low_stock_with_quantity_count.one : boostPFSConfig.label.low_stock_with_quantity_count.other;
            inventoryText = inventoryText.replace(/{{count}}/g, numberInStock);
            inventoryHtml = inventoryHtml.replace(/{{inventoryClass}}/g, 'inventory--low');
            inventoryHtml = inventoryHtml.replace(/{{inventoryText}}/g, inventoryText);
          }
        } else {
          inventoryHtml = inventoryHtml.replace(/{{inventoryClass}}/g, 'inventory--high');
          inventoryHtml = inventoryHtml.replace(/{{inventoryText}}/g, boostPFSConfig.label.in_stock);
        }
      }
    }
    return inventoryHtml;
  }

  function buildQuickView(data) {
    var quickViewHtml = '';
    var quickBuyHtml = '';
    if (boostPFSConfig.custom.show_quick_view == 'list' ||
      boostPFSConfig.custom.show_quick_view == 'list_grid' ||
      boostPFSConfig.custom.show_quick_buy == 'list' ||
      boostPFSConfig.custom.show_quick_buy == 'list_grid') {

      var quickViewClass = (boostPFSConfig.custom.show_quick_buy == 'list' && boostPFSConfig.custom.show_quick_view == 'list') ? 'product-item__action-list--list-view-only' : '';
      var quickViewButtonClass = boostPFSConfig.custom.show_quick_view == 'list' ? 'product-item__action-button--list-view-only' : '';
      var quickBuyButtonClass = boostPFSConfig.custom.show_quick_buy == 'list' ? 'product-item__action-button--list-view-only' : '';
      var templateClass = boostPFSConfig.custom.template || '';


      //Quick buy button
      if (soldOut) {
        quickBuyHtml = boostPFSTemplate.quickBuySoldOutHtml;
      } else {
        if (data.variants && data.variants.length > 1) {
          quickBuyHtml = boostPFSTemplate.quickBuyChooseOptionsHtml;
        } else {
          quickBuyHtml = boostPFSTemplate.quickBuyHtml;
        }
      }
      quickBuyHtml = quickBuyHtml.replace(/{{quickBuyButtonClass}}/g, quickBuyButtonClass);

      //Quick view
      quickViewHtml = boostPFSTemplate.quickViewHtml;
      quickViewHtml = quickViewHtml.replace(/{{variantId}}/g, firstVariant.id);
      quickViewHtml = quickViewHtml.replace(/{{quickBuy}}/g, quickBuyHtml);
      quickViewHtml = quickViewHtml.replace(/{{quickViewClass}}/g, quickViewClass);
      quickViewHtml = quickViewHtml.replace(/{{templateClass}}/g, templateClass);
      quickViewHtml = quickViewHtml.replace(/{{quickViewButtonClass}}/g, quickViewButtonClass);
    }
    return quickViewHtml;
  }


  /***************************** BUILD TOOLBAR *******************************/
  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {
    if (!totalProduct) totalProduct = this.totalProduct;
    // Get page info
    var currentPage = parseInt(Globals.queryParams.page);
    var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

    if (totalPage > 1) {
      var paginationHtml = boostPFSTemplate.paginateHtml;
      // Build Previous
      var previousHtml = (currentPage > 1) ? boostPFSTemplate.pageItemPreviousHtml : '';
      previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
      paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
      // Build Next
      var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.pageItemNextHtml : '';
      nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
      paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
      // Create page items array
      var beforeCurrentPageArr = [];
      for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
        beforeCurrentPageArr.unshift(iBefore);
      }
      if (currentPage - 4 > 0) {
        beforeCurrentPageArr.unshift('...');
      }
      if (currentPage - 4 >= 0) {
        beforeCurrentPageArr.unshift(1);
      }
      beforeCurrentPageArr.push(currentPage);
      var afterCurrentPageArr = [];
      for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
        afterCurrentPageArr.push(iAfter);
      }
      if (currentPage + 3 < totalPage) {
        afterCurrentPageArr.push('...');
      }
      if (currentPage + 3 <= totalPage) {
        afterCurrentPageArr.push(totalPage);
      }
      // Build page items
      var pageItemsHtml = '';
      var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
      for (var iPage = 0; iPage < pageArr.length; iPage++) {
        var activeClass = '';
        var pageLink = '';
        if (pageArr[iPage] == currentPage) {
          activeClass = 'is-active';
        } else if (pageArr[iPage] != '...') {
          activeClass = 'link';
          pageLink = Utils.buildToolbarLink('page', currentPage, pageArr[iPage]);
        }
        pageItemsHtml += boostPFSTemplate.pageItemHtml;
        pageItemsHtml = pageItemsHtml.replace(/{{activeClass}}/g, activeClass);
        pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
        pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, pageLink);
      }
      paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

      return paginationHtml;
    }

    return '';
  };

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function () {
    if (boostPFSConfig.custom.show_sorting && boostPFSTemplate.hasOwnProperty('sortingHtml')) {
      //jQ(Selector.topSorting).html('');
      var sortingArr = Utils.getSortingList();
      if (sortingArr) {
        var paramSort = Globals.queryParams.sort || '';
        // Build content
        var sortingItemsHtml = ''
        this.activeName = '';
        for (var sortingValue in sortingArr) {
          var sortingItemHtml = boostPFSTemplate.sortingItemHtml;
          var activeClass = paramSort == sortingValue ? 'is-selected' : '';
          var sortingName = sortingArr[sortingValue];
          if (paramSort == sortingValue) this.activeName = sortingName;
          sortingItemHtml = sortingItemHtml.replace(/{{sortingName}}/g, sortingName);
          sortingItemHtml = sortingItemHtml.replace(/{{sortingValue}}/g, sortingValue);
          sortingItemHtml = sortingItemHtml.replace(/{{sortingActiveClass}}/g, activeClass);
          sortingItemsHtml += sortingItemHtml;
        }
        var html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
        return html;
      }
    }
  };

  // Sorting render
  ProductSorting.prototype.render = function () {
    var $selectInput = jQ(Selector.topSorting);
    var paramSort = Globals.queryParams.sort || '';
    $selectInput.html(this.compileTemplate());

    if ($selectInput.hasClass("boost-pfs-filter-sort-active")) {
      $selectInput.toggleClass('boost-pfs-filter-sort-active');
    }
    var labelSort = '';
    var labelSortMobile = '';
    if (paramSort.length > 0 && this.activeName) {
      labelSort = boostPFSConfig.label.sorting + ": " + this.activeName;
    } else {
      labelSort = boostPFSConfig.label.sorting;
    }

    labelSortMobile = boostPFSConfig.label.sorting;

    jQ(Selector.topSorting + ' button span').text(labelSort);
    jQ(Selector.topSorting + ' button span.hidden-tablet-and-up').text(labelSortMobile);
  }

  // Build Sorting event
  ProductSorting.prototype.bindEvents = function () {
    var _this = this;
    jQ(Selector.topSorting + ' button.value-picker__choice-item').click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      FilterApi.setParam('sort', jQ(this).data('sort'));
      FilterApi.setParam('page', 1);
      FilterApi.applyFilter('sort');
    });
    jQ(Selector.topSorting + ' button.value-picker-button').click(function (e) {
      var expandedValue = jQ(this).attr('aria-expanded') == 'false' ? 'true' : 'false';
      var hiddenValue = jQ('#boost-sort-by-selector').attr('aria-hidden') == 'false' ? 'true' : 'false';
      jQ(this).attr('aria-expanded', expandedValue);
      jQ('#boost-sort-by-selector').attr('aria-hidden', hiddenValue);
    });
    jQ(document).on('click', function (e) {
      var valueButton = Selector.topSorting + " .value-picker-button";
      if (jQ(e.target).closest(valueButton).length === 0 && jQ(valueButton).eq(0).attr('aria-expanded') == 'true') {
        jQ(valueButton).trigger('click');
      }
    });
  };

  // Build Show Limit
  ProductLimit.prototype.compileTemplate = function () {
    if (boostPFSTemplate.hasOwnProperty('showLimitHtml')) {

      var numberList = Settings.getSettingValue('general.showLimitList');
      var iconHtml = '<svg focusable="false" class="icon icon--check-2" viewBox="0 0 13 11" role="presentation"><path d="M1 4.166456L5.317719 9 12 1" stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd"></path></svg>';
      if (numberList != '') {
        // Build content
        var showLimitItemsHtml = '';
        var arr = numberList.split(',');
        for (var k = 0; k < arr.length; k++) {
          if (arr[k] == Globals.queryParams.limit) {
            showLimitItemsHtml += '<button class="value-picker__choice-item link is-selected" data-action="select-value" data-value="' + arr[k] + '">' + boostPFSConfig.label.page_size.replace(/{{page_size}}/g, arr[k]) + iconHtml + '</button>';
          } else {
            showLimitItemsHtml += '<button class="value-picker__choice-item link" data-action="select-value" data-value="' + arr[k] + '">' + boostPFSConfig.label.page_size.replace(/{{page_size}}/g, arr[k]) + iconHtml + '</button>';
          }
        }
        var html = boostPFSTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml);
        return html;
      }
    }
    return '';
  };

  // Build Limit render
  ProductLimit.prototype.render = function () {
    jQ(Selector.topShowLimit).html(this.compileTemplate());
    var $topLimitSelect = jQ(Selector.topShowLimit + ' .value-picker-button .hidden-phone');
    if ($topLimitSelect.length) {
      $topLimitSelect.html(boostPFSConfig.label.display + ': ' + boostPFSConfig.label.page_size.replace(/{{page_size}}/g, Globals.queryParams.limit));
    }
  }

  //Build Limit bindEvents
  ProductLimit.prototype.bindEvents = function () {
    jQ(Selector.topShowLimit + ' .value-picker__choice-item').click(function (e) {
      FilterApi.setParam('limit', jQ(this).data('value'));
      FilterApi.applyFilter();
    });
    jQ(Selector.topShowLimit + ' button.value-picker-button').click(function (e) {
      var expandedValue = jQ(this).attr('aria-expanded') == 'false' ? 'true' : 'false';
      var hiddenValue = jQ('#boost-display-by-selector').attr('aria-hidden') == 'false' ? 'true' : 'false';
      jQ(this).attr('aria-expanded', expandedValue);
      jQ('#boost-display-by-selector').attr('aria-hidden', hiddenValue);
    });
    jQ(document).on('click', function (e) {
      var valueButton = Selector.topShowLimit + " .value-picker-button";
      if (jQ(e.target).closest(valueButton).length === 0 && jQ(valueButton).eq(0).attr('aria-expanded') == 'true') {
        jQ(valueButton).trigger('click');
      }
    });
  }


  /************************ BUILD ADDITIONAL ELEMENTS *************************/
  // Add additional feature for product list, used commonly in customizing product list
  ProductList.prototype.afterRender = function (data, eventType) {
    if (!data) data = this.data;
    if (window.SPR) {
      SPR.initDomEls();
      SPR.loadBadges();
    }

    if (boostPFSConfig.custom.currency_conversion_enabled) {
      convertAll();
    }
  };

  // Build additional elements
  FilterResult.prototype.afterRender = function (data, eventType) {
    if (!data) data = this.data;

    buildProductCount(data);
    buildSearchBreadcrumbs(data);
    buildDisplayType();
    styleFilterIcon(data);

    jQ('body').find('.boost-pfs-filter-skeleton-button').remove();
    jQ('a.boost-pfs-filter-scroll-to-top[target="_blank"]').removeAttr('target');
  };

  function convertAll(selector) {
    var _this = this;

    var moneyFormats = {
      "USD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} USD"
      },
      "EUR": {
        "money_format": "&euro;{{amount}}",
        "money_with_currency_format": "&euro;{{amount}} EUR"
      },
      "GBP": {
        "money_format": "&pound;{{amount}}",
        "money_with_currency_format": "&pound;{{amount}} GBP"
      },
      "CAD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} CAD"
      },
      "ALL": {
        "money_format": "Lek {{amount}}",
        "money_with_currency_format": "Lek {{amount}} ALL"
      },
      "DZD": {
        "money_format": "DA {{amount}}",
        "money_with_currency_format": "DA {{amount}} DZD"
      },
      "AOA": {
        "money_format": "Kz{{amount}}",
        "money_with_currency_format": "Kz{{amount}} AOA"
      },
      "ARS": {
        "money_format": "${{amount_with_comma_separator}}",
        "money_with_currency_format": "${{amount_with_comma_separator}} ARS"
      },
      "AMD": {
        "money_format": "{{amount}} AMD",
        "money_with_currency_format": "{{amount}} AMD"
      },
      "AWG": {
        "money_format": "Afl{{amount}}",
        "money_with_currency_format": "Afl{{amount}} AWG"
      },
      "AUD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} AUD"
      },
      "BBD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} Bds"
      },
      "AZN": {
        "money_format": "m.{{amount}}",
        "money_with_currency_format": "m.{{amount}} AZN"
      },
      "BDT": {
        "money_format": "Tk {{amount}}",
        "money_with_currency_format": "Tk {{amount}} BDT"
      },
      "BSD": {
        "money_format": "BS${{amount}}",
        "money_with_currency_format": "BS${{amount}} BSD"
      },
      "BHD": {
        "money_format": "{{amount}} BD",
        "money_with_currency_format": "{{amount}} BHD"
      },
      "BYR": {
        "money_format": "Br {{amount}}",
        "money_with_currency_format": "Br {{amount}} BYR"
      },
      "BZD": {
        "money_format": "BZ${{amount}}",
        "money_with_currency_format": "BZ${{amount}} BZD"
      },
      "BTN": {
        "money_format": "Nu {{amount}}",
        "money_with_currency_format": "Nu {{amount}} BTN"
      },
      "BAM": {
        "money_format": "KM {{amount_with_comma_separator}}",
        "money_with_currency_format": "KM {{amount_with_comma_separator}} BAM"
      },
      "BRL": {
        "money_format": "R$ {{amount_with_comma_separator}}",
        "money_with_currency_format": "R$ {{amount_with_comma_separator}} BRL"
      },
      "BOB": {
        "money_format": "Bs{{amount_with_comma_separator}}",
        "money_with_currency_format": "Bs{{amount_with_comma_separator}} BOB"
      },
      "BWP": {
        "money_format": "P{{amount}}",
        "money_with_currency_format": "P{{amount}} BWP"
      },
      "BND": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} BND"
      },
      "BGN": {
        "money_format": "{{amount}} Ð»Ð²",
        "money_with_currency_format": "{{amount}} Ð»Ð² BGN"
      },
      "MMK": {
        "money_format": "K{{amount}}",
        "money_with_currency_format": "K{{amount}} MMK"
      },
      "KHR": {
        "money_format": "KHR{{amount}}",
        "money_with_currency_format": "KHR{{amount}}"
      },
      "KYD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} KYD"
      },
      "XAF": {
        "money_format": "FCFA{{amount}}",
        "money_with_currency_format": "FCFA{{amount}} XAF"
      },
      "CLP": {
        "money_format": "${{amount_no_decimals}}",
        "money_with_currency_format": "${{amount_no_decimals}} CLP"
      },
      "CNY": {
        "money_format": "&#165;{{amount}}",
        "money_with_currency_format": "&#165;{{amount}} CNY"
      },
      "COP": {
        "money_format": "${{amount_with_comma_separator}}",
        "money_with_currency_format": "${{amount_with_comma_separator}} COP"
      },
      "CRC": {
        "money_format": "&#8353; {{amount_with_comma_separator}}",
        "money_with_currency_format": "&#8353; {{amount_with_comma_separator}} CRC"
      },
      "HRK": {
        "money_format": "{{amount_with_comma_separator}} kn",
        "money_with_currency_format": "{{amount_with_comma_separator}} kn HRK"
      },
      "CZK": {
        "money_format": "{{amount_with_comma_separator}} K&#269;",
        "money_with_currency_format": "{{amount_with_comma_separator}} K&#269;"
      },
      "DKK": {
        "money_format": "{{amount_with_comma_separator}}",
        "money_with_currency_format": "kr.{{amount_with_comma_separator}}"
      },
      "DOP": {
        "money_format": "RD$ {{amount}}",
        "money_with_currency_format": "RD$ {{amount}}"
      },
      "XCD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "EC${{amount}}"
      },
      "EGP": {
        "money_format": "LE {{amount}}",
        "money_with_currency_format": "LE {{amount}} EGP"
      },
      "ETB": {
        "money_format": "Br{{amount}}",
        "money_with_currency_format": "Br{{amount}} ETB"
      },
      "XPF": {
        "money_format": "{{amount_no_decimals_with_comma_separator}} XPF",
        "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} XPF"
      },
      "FJD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "FJ${{amount}}"
      },
      "GMD": {
        "money_format": "D {{amount}}",
        "money_with_currency_format": "D {{amount}} GMD"
      },
      "GHS": {
        "money_format": "GH&#8373;{{amount}}",
        "money_with_currency_format": "GH&#8373;{{amount}}"
      },
      "GTQ": {
        "money_format": "Q{{amount}}",
        "money_with_currency_format": "{{amount}} GTQ"
      },
      "GYD": {
        "money_format": "G${{amount}}",
        "money_with_currency_format": "${{amount}} GYD"
      },
      "GEL": {
        "money_format": "{{amount}} GEL",
        "money_with_currency_format": "{{amount}} GEL"
      },
      "HNL": {
        "money_format": "L {{amount}}",
        "money_with_currency_format": "L {{amount}} HNL"
      },
      "HKD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "HK${{amount}}"
      },
      "HUF": {
        "money_format": "{{amount_no_decimals_with_comma_separator}}",
        "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} Ft"
      },
      "ISK": {
        "money_format": "{{amount_no_decimals}} kr",
        "money_with_currency_format": "{{amount_no_decimals}} kr ISK"
      },
      "INR": {
        "money_format": "Rs. {{amount}}",
        "money_with_currency_format": "Rs. {{amount}}"
      },
      "IDR": {
        "money_format": "{{amount_with_comma_separator}}",
        "money_with_currency_format": "Rp {{amount_with_comma_separator}}"
      },
      "ILS": {
        "money_format": "{{amount}} NIS",
        "money_with_currency_format": "{{amount}} NIS"
      },
      "JMD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} JMD"
      },
      "JPY": {
        "money_format": "&#165;{{amount_no_decimals}}",
        "money_with_currency_format": "&#165;{{amount_no_decimals}} JPY"
      },
      "JEP": {
        "money_format": "&pound;{{amount}}",
        "money_with_currency_format": "&pound;{{amount}} JEP"
      },
      "JOD": {
        "money_format": "{{amount}} JD",
        "money_with_currency_format": "{{amount}} JOD"
      },
      "KZT": {
        "money_format": "{{amount}} KZT",
        "money_with_currency_format": "{{amount}} KZT"
      },
      "KES": {
        "money_format": "KSh{{amount}}",
        "money_with_currency_format": "KSh{{amount}}"
      },
      "KWD": {
        "money_format": "{{amount}} KD",
        "money_with_currency_format": "{{amount}} KWD"
      },
      "KGS": {
        "money_format": "Ð»Ð²{{amount}}",
        "money_with_currency_format": "Ð»Ð²{{amount}}"
      },
      "LVL": {
        "money_format": "Ls {{amount}}",
        "money_with_currency_format": "Ls {{amount}} LVL"
      },
      "LBP": {
        "money_format": "L&pound;{{amount}}",
        "money_with_currency_format": "L&pound;{{amount}} LBP"
      },
      "LTL": {
        "money_format": "{{amount}} Lt",
        "money_with_currency_format": "{{amount}} Lt"
      },
      "MGA": {
        "money_format": "Ar {{amount}}",
        "money_with_currency_format": "Ar {{amount}} MGA"
      },
      "MKD": {
        "money_format": "Ð´ÐµÐ½ {{amount}}",
        "money_with_currency_format": "Ð´ÐµÐ½ {{amount}} MKD"
      },
      "MOP": {
        "money_format": "MOP${{amount}}",
        "money_with_currency_format": "MOP${{amount}}"
      },
      "MVR": {
        "money_format": "Rf{{amount}}",
        "money_with_currency_format": "Rf{{amount}} MRf"
      },
      "MXN": {
        "money_format": "$ {{amount}}",
        "money_with_currency_format": "$ {{amount}} MXN"
      },
      "MYR": {
        "money_format": "RM{{amount}} MYR",
        "money_with_currency_format": "RM{{amount}} MYR"
      },
      "MUR": {
        "money_format": "Rs {{amount}}",
        "money_with_currency_format": "Rs {{amount}} MUR"
      },
      "MDL": {
        "money_format": "{{amount}} MDL",
        "money_with_currency_format": "{{amount}} MDL"
      },
      "MAD": {
        "money_format": "{{amount}} dh",
        "money_with_currency_format": "Dh {{amount}} MAD"
      },
      "MNT": {
        "money_format": "{{amount_no_decimals}} &#8366",
        "money_with_currency_format": "{{amount_no_decimals}} MNT"
      },
      "MZN": {
        "money_format": "{{amount}} Mt",
        "money_with_currency_format": "Mt {{amount}} MZN"
      },
      "NAD": {
        "money_format": "N${{amount}}",
        "money_with_currency_format": "N${{amount}} NAD"
      },
      "NPR": {
        "money_format": "Rs{{amount}}",
        "money_with_currency_format": "Rs{{amount}} NPR"
      },
      "ANG": {
        "money_format": "&fnof;{{amount}}",
        "money_with_currency_format": "{{amount}} NA&fnof;"
      },
      "NZD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} NZD"
      },
      "NIO": {
        "money_format": "C${{amount}}",
        "money_with_currency_format": "C${{amount}} NIO"
      },
      "NGN": {
        "money_format": "&#8358;{{amount}}",
        "money_with_currency_format": "&#8358;{{amount}} NGN"
      },
      "NOK": {
        "money_format": "kr {{amount_with_comma_separator}}",
        "money_with_currency_format": "kr {{amount_with_comma_separator}} NOK"
      },
      "OMR": {
        "money_format": "{{amount_with_comma_separator}} OMR",
        "money_with_currency_format": "{{amount_with_comma_separator}} OMR"
      },
      "PKR": {
        "money_format": "Rs.{{amount}}",
        "money_with_currency_format": "Rs.{{amount}} PKR"
      },
      "PGK": {
        "money_format": "K {{amount}}",
        "money_with_currency_format": "K {{amount}} PGK"
      },
      "PYG": {
        "money_format": "Gs. {{amount_no_decimals_with_comma_separator}}",
        "money_with_currency_format": "Gs. {{amount_no_decimals_with_comma_separator}} PYG"
      },
      "PEN": {
        "money_format": "S/. {{amount}}",
        "money_with_currency_format": "S/. {{amount}} PEN"
      },
      "PHP": {
        "money_format": "&#8369;{{amount}}",
        "money_with_currency_format": "&#8369;{{amount}} PHP"
      },
      "PLN": {
        "money_format": "{{amount_with_comma_separator}} zl",
        "money_with_currency_format": "{{amount_with_comma_separator}} zl PLN"
      },
      "QAR": {
        "money_format": "QAR {{amount_with_comma_separator}}",
        "money_with_currency_format": "QAR {{amount_with_comma_separator}}"
      },
      "RON": {
        "money_format": "{{amount_with_comma_separator}} lei",
        "money_with_currency_format": "{{amount_with_comma_separator}} lei RON"
      },
      "RUB": {
        "money_format": "&#1088;&#1091;&#1073;{{amount_with_comma_separator}}",
        "money_with_currency_format": "&#1088;&#1091;&#1073;{{amount_with_comma_separator}} RUB"
      },
      "RWF": {
        "money_format": "{{amount_no_decimals}} RF",
        "money_with_currency_format": "{{amount_no_decimals}} RWF"
      },
      "WST": {
        "money_format": "WS$ {{amount}}",
        "money_with_currency_format": "WS$ {{amount}} WST"
      },
      "SAR": {
        "money_format": "{{amount}} SR",
        "money_with_currency_format": "{{amount}} SAR"
      },
      "STD": {
        "money_format": "Db {{amount}}",
        "money_with_currency_format": "Db {{amount}} STD"
      },
      "RSD": {
        "money_format": "{{amount}} RSD",
        "money_with_currency_format": "{{amount}} RSD"
      },
      "SCR": {
        "money_format": "Rs {{amount}}",
        "money_with_currency_format": "Rs {{amount}} SCR"
      },
      "SGD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} SGD"
      },
      "SYP": {
        "money_format": "S&pound;{{amount}}",
        "money_with_currency_format": "S&pound;{{amount}} SYP"
      },
      "ZAR": {
        "money_format": "R {{amount}}",
        "money_with_currency_format": "R {{amount}} ZAR"
      },
      "KRW": {
        "money_format": "&#8361;{{amount_no_decimals}}",
        "money_with_currency_format": "&#8361;{{amount_no_decimals}} KRW"
      },
      "LKR": {
        "money_format": "Rs {{amount}}",
        "money_with_currency_format": "Rs {{amount}} LKR"
      },
      "SEK": {
        "money_format": "{{amount_no_decimals}} kr",
        "money_with_currency_format": "{{amount_no_decimals}} kr SEK"
      },
      "CHF": {
        "money_format": "{{amount}} CHF",
        "money_with_currency_format": "{{amount}} CHF"
      },
      "TWD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} TWD"
      },
      "THB": {
        "money_format": "{{amount}} &#xe3f;",
        "money_with_currency_format": "{{amount}} &#xe3f; THB"
      },
      "TZS": {
        "money_format": "{{amount}} TZS",
        "money_with_currency_format": "{{amount}} TZS"
      },
      "TTD": {
        "money_format": "${{amount}}",
        "money_with_currency_format": "${{amount}} TTD"
      },
      "TND": {
        "money_format": "{{amount}}",
        "money_with_currency_format": "{{amount}} DT"
      },
      "TRY": {
        "money_format": "{{amount}}TL",
        "money_with_currency_format": "{{amount}}TL"
      },
      "UGX": {
        "money_format": "Ush {{amount_no_decimals}}",
        "money_with_currency_format": "Ush {{amount_no_decimals}} UGX"
      },
      "UAH": {
        "money_format": "₴{{amount}}",
        "money_with_currency_format": "{{amount}} UAH"
      },
      "AED": {
        "money_format": "Dhs. {{amount}}",
        "money_with_currency_format": "Dhs. {{amount}} AED"
      },
      "UYU": {
        "money_format": "${{amount_with_comma_separator}}",
        "money_with_currency_format": "${{amount_with_comma_separator}} UYU"
      },
      "VUV": {
        "money_format": "{{amount}} VT",
        "money_with_currency_format": "{{amount}} VT"
      },
      "VEF": {
        "money_format": "Bs. {{amount_with_comma_separator}}",
        "money_with_currency_format": "Bs. {{amount_with_comma_separator}} VEF"
      },
      "VND": {
        "money_format": "{{amount_no_decimals_with_comma_separator}}&#8363;",
        "money_with_currency_format": "{{amount_no_decimals_with_comma_separator}} VND"
      },
      "XBT": {
        "money_format": "{{amount_no_decimals}} BTC",
        "money_with_currency_format": "{{amount_no_decimals}} BTC"
      },
      "XOF": {
        "money_format": "CFA{{amount}}",
        "money_with_currency_format": "CFA{{amount}} XOF"
      },
      "ZMW": {
        "money_format": "K{{amount_no_decimals_with_comma_separator}}",
        "money_with_currency_format": "ZMW{{amount_no_decimals_with_comma_separator}}"
      }
    };

    var baseCurrency = window.theme.shopCurrency,
      newCurrency = document.querySelector('.currency-selector').value;

    (selector || document).querySelectorAll('[data-money-convertible]').forEach(function (item) {
      if (!item.hasAttribute('data-currency-' + baseCurrency)) {
        item.setAttribute('data-currency-' + baseCurrency, item.innerHTML);
      }

      // If the amount has already been converted, we leave it alone.
      if (item.getAttribute('data-currency') === newCurrency) {
        return;
      }

      var baseAmount = item.getAttribute('data-currency-' + baseCurrency);

      // If we are converting to a currency that we have saved, we will use the saved amount.
      if (item.hasAttribute('data-currency-' + newCurrency)) {
        item.innerHTML = item.getAttribute('data-currency-' + newCurrency);
      } else {
        var newFormat = moneyFormats[newCurrency][window.theme.currencyConversionMoneyFormat] || '{{amount}}';

        // We have to normalize by replacing dot by comma and comma by dot
        if (window.theme.moneyFormat.indexOf('with_comma_separator') !== -1) {
          baseAmount = baseAmount.replace(/[,.]/g, function (match) {
            // If `,` is matched return `.`, if `.` matched return `,`
            return match === ',' ? '.' : ',';
          });
        }

        // Converting to Y for the first time? Let's get to it!
        var cents = window.Currency.convert(parseFloat(baseAmount.replace(/^[^0-9]+|[^0-9.]/g, '', ''), 10) * 100, baseCurrency, newCurrency);

        if (window.theme.currencyConversionRoundAmounts) {
          cents = Math.round(cents / 100) * 100;
        }
        var newFormattedAmount = Utils.formatMoney(cents, newFormat);

        item.innerHTML = newFormattedAmount;
        item.setAttribute('data-currency-' + newCurrency, newFormattedAmount);
      }

      // We record the new currency locally.
      item.setAttribute('data-currency', newCurrency);
    });

    localStorage.setItem('currency', newCurrency);
  }

  function buildProductCount(data) {
    var fromProduct = (Globals.queryParams.page - 1) * Globals.queryParams.limit + 1;
    var toProduct = Math.min(fromProduct + (Globals.queryParams.limit - 1), data.total_product);
    var totalProduct = boostPFSConfig.label.showing_count.other;
    if (data.total_product == 1) {
      totalProduct = boostPFSConfig.label.showing_count.one;
    } else if (data.total_product == 0) {
      totalProduct = boostPFSConfig.label.showing_count.zero;
    }
    totalProduct = totalProduct.replace(/{{offset}}/g, fromProduct);
    totalProduct = totalProduct.replace(/{{page_size}}/g, toProduct);
    totalProduct = totalProduct.replace(/{{count}}/g, data.total_product);
    jQ('.boost-pfs-filter-total-product').each(function () {
      jQ(this).html(totalProduct);
    })
  }

  function buildSearchBreadcrumbs(data) {
    if (Globals.currentTerm) {
      var terms = Utils.escape(Globals.currentTerm.trim());
      var breadcrumbsText = boostPFSConfig.label.search_title_with_terms.replace(/{{terms}}/g, terms);
      jQ('.boost-pfs-breadcrumbs').each(function () {
        jQ(this).html(breadcrumbsText);
      })
    }
  }

  function buildDisplayType() {
    if (!Utils.isMobile()) {
      var selectedLayout = jQ('.is-selected[data-action="change-layout"]');
      if (selectedLayout.length > 0) {
        selectedLayout.removeClass('is-selected');
        selectedLayout.click();
      } else {
        jQ('[data-action="change-layout"]:first').click();
      }
    }
  }

  function styleFilterIcon(data) {
    var queryParams = Object.keys(Globals.queryParams);
    var prefix = Globals.queryParams['_'];
    var isFiltered = false;
    for (var i = 0; i < queryParams.length; i++) {
      var queryParam = queryParams[i];
      if (queryParam.startsWith(prefix)) {
        isFiltered = true;
        break;
      }
    }
    if (isFiltered) {
      jQ('.collection__filter-icon').addClass('collection__filter-icon--active');
    } else {
      jQ('.collection__filter-icon').removeClass('collection__filter-icon--active');
    }
  }

  // We use the afterRender function of FilterTree, it will be called after the filter tree is rendered
  FilterTree.prototype.afterRender = function () {
    var count = 0;

    this.filterOptions.forEach(function (filterOption) {
      // FilterOption has numberAppliedFilterItems field. We add those up.
      count += filterOption.numberAppliedFilterItems;
    })

    // We prepend the count number above the filter tree
    if (count > 0) {
      jQ('.collection-drawer__filter-count').html('(' + count + ')');
    } else {
      jQ('.collection-drawer__filter-count').html('');
    }
  }


})(); // Add this at the end
