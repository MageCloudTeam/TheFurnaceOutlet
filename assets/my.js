// let cartPopupWrap = document.querySelector('.mini-cart-popup'),
//     btnAddToCart = document.querySelector('.product-form__add-button'),
//     isMiniCartPopupOpen = false;

// btnAddToCart.addEventListener('click', onProductAdded)
// window.addEventListener('click', closeMiniCartPopup)
// window.addEventListener('keydown', _checkMiniCartClosePopup)

// function openMiniCartPopup() {
        
//     cartPopupWrap.setAttribute('aria-hidden', 'false');
//     isMiniCartPopupOpen = true;
//   }

// function closeMiniCartPopup() {

//     cartPopupWrap.setAttribute('aria-hidden', 'true');
//     document.querySelector('.click_block').style.display = "none";
    
//     isMiniCartPopupOpen = false;
//     document.body.classList.remove('no-mobile-scroll');
//   }

// function _checkMiniCartClosePopup(event) {
//     if (!isMiniCartPopupOpen) {
//       return;
//     }

//     if(event){
//       event.preventDefault();

//       if(event.key === 'Escape'){
//         closeMiniCartPopup();
//       }
//     }
//   }



// function updateQuantity(event, target) {
//     var _this = this;

//     var parsedQuantity = 1;

//     if (target.tagName === 'INPUT') {
//       parsedQuantity = parseInt(target.value);
//     } else {
//       parsedQuantity = parseInt(target.getAttribute('data-quantity'));
//     } // If we are in "page" mode, we reload the page instead of doing that in Ajax to have a better compatibility with apps

//     if (window.theme.cartType === 'page') {
//       if (target.hasAttribute('data-href')) {
//         window.location.href = target.getAttribute('data-href');
//       } else {
//         window.location.href = "".concat(window.routes.cartChangeUrl, "?line=").concat(target.getAttribute('data-line'), "&quantity=").concat(parsedQuantity);
//       }

//       return;
//     }

//     document.dispatchEvent(new CustomEvent('theme:loading:start'));
//     fetch("".concat(window.routes.cartChangeUrl, ".js"), {
//       body: JSON.stringify({
//         line: target.getAttribute('data-line'),
//         quantity: parsedQuantity
//       }),
//       credentials: 'same-origin',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header

//       }
//     }).then(function (cart) {
//       cart.json().then(function (content) {

//         _this.itemCount = content['item_count'];

//         rerenderPopup(false).then(function () {
//           document.dispatchEvent(new CustomEvent('theme:loading:end'));
//         });
//       });
//     });
//     event.preventDefault();
//   }


//   function blockEnterKey(event) {
//     if (event.key === 'Enter') {
//       return false;
//     }
//   }

//   function rerenderPopup() {

//     return fetch('/cart?section_id=mini-cart-popup', {
//       credentials: 'same-origin',
//       method: 'GET',
//       headers: {
//         'Cache-Control': 'no-cache'
//       }
//     }).then(function (content) {

//       content.text().then(function (html) {

//         console.log(html)

//         var myDiv = document.createElement('div');
//           myDiv.innerHTML = html;

//         //   _this2.element.querySelector('.header__cart-count').textContent = _this2.itemCount;

//         if (window.theme.cartType !== 'page') {
//           if (window.theme.pageType !== 'cart') {

//             var tempElement = document.createElement('div');
//             tempElement.innerHTML = html;

//             cartPopupWrap.innerHTML = tempElement.querySelector('.mini-cart-popup').innerHTML;

//             let quantitySelectors = cartPopupWrap.querySelectorAll('.quantity-selector--product');

//             // fetch('/cart.js', {
//             //   credentials: 'same-origin',
//             //   method: 'GET'
//             // }).then(function (content) {
//             //   content.json().then(function (cartObj) {
//             //     let itemsCartArr = cartObj['items'];
//             //     new QuantityPickerAccessoriesPopup(quantitySelectors, _this2);

//             //     quantitySelectors.forEach((quantitySelector) => {
//             //       let quantityTarget = quantitySelector.querySelector('[name="quantity"]');

//             //       itemsCartArr.forEach((itemCart) => {
//             //         let productJsonElementAccessories = quantitySelector.querySelector('[data-product-json-accessories]');
//             //         let jsonDataAccessories = JSON.parse(productJsonElementAccessories.innerHTML);
//             //         if(itemCart['id'] == jsonDataAccessories['product-accessories']){
//             //           quantityTarget.value = itemCart['quantity'];
//             //         }
//             //       })
//             //     })
//             //   })
//             // })

//           } else {
//             var _tempElement = document.createElement('div');

//             _tempElement.innerHTML = html;
//             var originalCart = document.querySelector('[data-section-type="cart"]');
//             originalCart.innerHTML = _tempElement.querySelector('[data-section-type="cart"]').innerHTML;

//             if (scrollToTop) {
//               window.scrollTo({
//                 top: 0,
//                 behavior: 'smooth'
//               });
//             }
//           }
//         }
//       });
//     });
//   }
  
//   function onProductAdded(event) {
    
//     this.itemCount += event.detail.quantity;

//     fetch('/cart?section_id=mini-cart-popup', {
//       credentials: 'same-origin',
//       method: 'GET',
//       headers: {
//         'Cache-Control': 'no-cache'
//       }
//     }).then(function (response) {
      
//       if(response.status == 200){
//         fetch('/cart.js', {
//             credentials: 'same-origin',
//             method: 'GET'
//           }).then(function (content) {
//             content.json().then(function (cartObj) {
//               if(cartObj.item_count > 0){
//                 onCartRefreshPopup().then(function () {
//                   if (window.theme.pageType !== 'cart') {
//                     openMiniCartPopup();
//                     document.querySelector('.click_block').style.display = "block";
//                   }
//                 });
//               }
//             })
//           })
        
//       }
//     })
//   }
  
  
//   function onCartRefreshPopup() {
//     return rerenderPopup();
//   }



//   function onWindowClickPopup(event) {
//     if (this.miniCartPopupElement && this.isMiniCartPopupOpen && !this.element.contains(event.target)) {
//       closeMiniCartPopup();
//     }
//   }

// var QuantityPickerAccessoriesPopup = /*#__PURE__*/function () {
//   function QuantityPickerAccessoriesPopup(element, context) {
//     _classCallCheck(this, QuantityPickerAccessoriesPopup);

//     if (!element) {
//       return;
//     }

//     if(element[0] != undefined){
//       element.forEach((item) => {
//         item.addEventListener('click', (e) => {
//           let target = e.target;
//           if (target.parentElement.classList.contains('quantity-selector--product')) {
//             let attribute = target.getAttribute("data-action");
//             let targetParentElement = target.parentNode;
//             this.element = targetParentElement;
//             this.inputElement = this.element.querySelector('[name="quantity"]');

//             if(attribute == "increase-picker-quantity"){
//               onIncrease(this.inputElement, item, context);
//             }else if(attribute == "decrease-picker-quantity") {
//               onDecrease(this.inputElement, item, context);
//             }else{
//               return;
//             }
//           }
//         });

//         item.addEventListener('keyup', (e) => {
//           let target = e.target;
//           if (target.parentElement.classList.contains('quantity-selector--product')) {
//             let targetParentElement = target.parentNode;
//             this.element = targetParentElement;
//             this.inputElement = this.element.querySelector('[name="quantity"]');

//             onInputValueChanged(this.inputElement);
//           }
//         })
//       });  
//     }  

//     function onIncrease(input, item, context) {
//       input.value = parseInt(input.value) + 1;

//       let _this = context;
//       let itemsArr = [];
//       let productJsonElementAccessories = item.querySelector('[data-product-json-accessories]');
//       let jsonDataAccessories = JSON.parse(productJsonElementAccessories.innerHTML);

//       fetch('/cart.js', {
//         credentials: 'same-origin',
//         method: 'GET',
//         headers: {
//           'Cache-Control': 'no-cache'
//         }
//       }).then(function (content) {

//         content.json().then(function (cartObj) {
//           let items = cartObj['items'];

//           items.every((i) => {
//             if(i['id'] == jsonDataAccessories['product-accessories']){
//               fetch('/cart/change.js', {
//                 body: JSON.stringify({
//                   id: JSON.stringify(jsonDataAccessories['product-accessories']),
//                   quantity: i['quantity'] + 1
//                 }),
//                 credentials: 'same-origin',
//                 method: 'POST',
//                 headers: {
//                   'Content-Type': 'application/json',
//                   'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
//                 }
//               }).then(function(){
//                 _this.itemCount = _this.itemCount + 1;

//                 _this._rerender(false).then(function () {
//                   document.dispatchEvent(new CustomEvent('theme:loading:end'));
//                 });
//               })
              
//             }else{

//               itemsArr.push({
//                 'id': JSON.stringify(jsonDataAccessories['product-accessories']),
//                 'quantity': 1
//               })

//               let productDataAccess = {
//                 'items': itemsArr
//               };

//               fetch('/cart/add.js', {
//                 body: JSON.stringify(productDataAccess),
//                 method: 'POST',
//                 credentials: 'same-origin', 
//                 headers: {
//                 'Content-Type': 'application/json',
//                 'X-Requested-With': 'XMLHttpRequest'
//                 }
//               }).then(function(){
//                 _this.itemCount = _this.itemCount + 1;

//                 _this._rerender(false).then(function () {
//                   document.dispatchEvent(new CustomEvent('theme:loading:end'));
//                 });
//               })
//             }

//           })
//         })
//       })
//     }

//     function onDecrease(input, item, context) {
//       input.value = Math.max(0, parseInt(input.value) - 1);

//       let _this2 = context;

//       let productJsonElementAccessories = item.querySelector('[data-product-json-accessories]');
//       let jsonDataAccessories = JSON.parse(productJsonElementAccessories.innerHTML);

//       fetch('/cart.js', {
//         credentials: 'same-origin',
//         method: 'GET',
//         headers: {
//           'Cache-Control': 'no-cache'
//         }
//       }).then(function (content) {

//         content.json().then(function (cartObj) {
//           let items = cartObj['items'];

//           items.forEach((i) => {
//             if(i['id'] == jsonDataAccessories['product-accessories']){
//               fetch('/cart/change.js', {
//                 body: JSON.stringify({
//                   id: JSON.stringify(jsonDataAccessories['product-accessories']),
//                   quantity: i['quantity'] - 1
//                 }),
//                 credentials: 'same-origin',
//                 method: 'POST',
//                 headers: {
//                   'Content-Type': 'application/json',
//                   'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
//                 }
//               }).then(function(){
//                 _this2.itemCount = _this2.itemCount - 1;

//                 _this2._rerender(false).then(function () {
//                   document.dispatchEvent(new CustomEvent('theme:loading:end'));
//                 });
//               })
//             }
//           })
//         })
//       })
//     }
//   }

//   return QuantityPickerAccessoriesPopup;
// }();
