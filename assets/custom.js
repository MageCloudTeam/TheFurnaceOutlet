let wrapContainer = document.querySelector('[data-gift-note-html]'),
  opacityBlock = wrapContainer.querySelector('.click_block'),
  btnClose = wrapContainer.querySelector('.close-popup'),
  checkboxInput = wrapContainer.querySelector('.input-checkbox'),
  content = wrapContainer.querySelector('.checkbox-content'),
  labelLink = wrapContainer.querySelector('.link-title');

document.querySelector('.section--shipping-address').appendChild(wrapContainer);


labelLink.addEventListener('click', ()=>{
  openPopup();
})

btnClose.addEventListener('click', () => {
  closePopup();
})

checkboxInput.addEventListener('click', ()=>{
  if(checkboxInput.hasAttribute('checked')){
    checkboxInput.removeAttribute('checked')
  }else{
    checkboxInput.setAttribute('checked', '')
    openPopup();
  }
})

function openPopup(){
  content.classList.add('showPopup');
  opacityBlock.style.display = 'block';
  checkedPopup = true;
};

function closePopup(){
  content.classList.remove('showPopup');
  opacityBlock.style.display = 'none';
  checkedPopup = false;
};






