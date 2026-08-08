const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const cartCount = document.querySelector('#cart-count');
const cartButton = document.querySelector('.cart-button');
const cartDrawer = document.querySelector('#cart-drawer');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const toast = document.querySelector('.toast');
const newsletter = document.querySelector('.newsletter-form');
const newsletterStatus = document.querySelector('#newsletter-status');
const CART_KEY = 'agnello-cart-v2';
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const productButtons = [...document.querySelectorAll('[data-add-to-cart]')];
const products = new Map(productButtons.map((button) => [button.dataset.addToCart, {
  name: button.dataset.addToCart,
  price: Number(button.dataset.price),
  image: button.dataset.image,
}]));

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

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((item) => {
      const product = products.get(item?.name);
      const quantity = Math.min(99, Math.max(0, Number.parseInt(item?.quantity, 10) || 0));
      return product && quantity ? [{ ...product, quantity }] : [];
    });
  } catch {
    return [];
  }
}

let cart = loadCart();
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function itemCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function buildCheckoutUrl() {
  const lines = cart.map((item) => `• ${item.quantity}x ${item.name} — ${currency.format(item.price * item.quantity)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Olá, Vinharia Agnello! Gostaria de confirmar este pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${currency.format(total)}\n\nPodem me informar o frete e as formas de pagamento?`;
  return `https://wa.me/555434559000?text=${encodeURIComponent(message)}`;
}

function renderCart() {
  const count = itemCount();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = String(count);
  cartButton.setAttribute('aria-label', `Sacola com ${count} ${count === 1 ? 'item' : 'itens'}`);
  cartTotal.textContent = currency.format(total);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><span aria-hidden="true">◇</span><h3>Sua sacola está vazia</h3><p>Escolha um rótulo para começar sua seleção.</p><a href="#vinhos" data-close-cart>Descobrir vinhos</a></div>';
    checkoutButton.setAttribute('aria-disabled', 'true');
    checkoutButton.removeAttribute('href');
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <article class="cart-item">
      <img src="${item.image}" width="90" height="90" alt="">
      <div class="cart-item-copy"><p>Tinto · 750 ml</p><h3>${item.name}</h3><strong>${currency.format(item.price)}</strong>
        <div class="quantity" aria-label="Quantidade de ${item.name}">
          <button type="button" data-decrease="${index}" aria-label="Diminuir quantidade de ${item.name}">−</button><span>${item.quantity}</span><button type="button" data-increase="${index}" aria-label="Aumentar quantidade de ${item.name}">＋</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${index}" aria-label="Remover ${item.name}">×</button>
    </article>`).join('');
  checkoutButton.setAttribute('href', buildCheckoutUrl());
  checkoutButton.removeAttribute('aria-disabled');
}

function openCart() {
  renderCart();
  cartDrawer.classList.add('open');
  document.querySelector('.cart-backdrop').classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  cartDrawer.querySelector('.cart-close').focus();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  document.querySelector('.cart-backdrop').classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

productButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const existing = cart.find((item) => item.name === button.dataset.addToCart);
    if (existing) existing.quantity += 1;
    else cart.push({ name: button.dataset.addToCart, price: Number(button.dataset.price), image: button.dataset.image, quantity: 1 });
    renderCart();
    showToast(`${button.dataset.addToCart} foi adicionado à sua sacola.`);
  });
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.increase !== undefined) cart[Number(button.dataset.increase)].quantity += 1;
  if (button.dataset.decrease !== undefined) {
    const index = Number(button.dataset.decrease);
    cart[index].quantity -= 1;
    if (cart[index].quantity === 0) cart.splice(index, 1);
  }
  if (button.dataset.remove !== undefined) cart.splice(Number(button.dataset.remove), 1);
  renderCart();
});

cartButton.addEventListener('click', openCart);
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-cart]')) closeCart();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closeCart();
  }
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
renderCart();
