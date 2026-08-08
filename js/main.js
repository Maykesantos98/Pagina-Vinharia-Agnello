const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const cartCount = document.querySelector('#cart-count');
const cartButton = document.querySelector('.cart-button');
const toast = document.querySelector('.toast');
const newsletter = document.querySelector('.newsletter-form');
const newsletterStatus = document.querySelector('#newsletter-status');

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') === 'false';
  menu.classList.toggle('open', opening);
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', opening);
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

let cart = Number.parseInt(localStorage.getItem('agnello-cart') || '0', 10);
if (!Number.isFinite(cart) || cart < 0) cart = 0;

function updateCart() {
  cartCount.textContent = String(cart);
  cartButton.setAttribute('aria-label', `Sacola com ${cart} ${cart === 1 ? 'item' : 'itens'}`);
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    cart += 1;
    localStorage.setItem('agnello-cart', String(cart));
    updateCart();
    showToast(`${button.dataset.addToCart} foi adicionado à sua sacola.`);
  });
});

cartButton.addEventListener('click', () => {
  showToast(cart === 0 ? 'Sua sacola está vazia.' : `Sua sacola tem ${cart} ${cart === 1 ? 'vinho' : 'vinhos'}. Checkout disponível em breve.`);
});

newsletter.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = newsletter.elements.email;
  if (!email.checkValidity()) {
    newsletterStatus.textContent = 'Digite um e-mail válido para continuar.';
    email.focus();
    return;
  }
  newsletterStatus.textContent = 'Obrigado! Sua inscrição foi confirmada.';
  newsletter.reset();
});

document.querySelector('#year').textContent = String(new Date().getFullYear());
updateCart();
