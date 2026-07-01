const A1_PRICE = 14;
const DELIVERY_FEE = 10;
const PROFILE_KEY = 'traco-a1-cliente';
let deliveryMode = 'Entrega';
let accessMode = 'entrar';

const fields = {
  clientName: document.querySelector('#clientName'),
  phone: document.querySelector('#phone'),
  projectType: document.querySelector('#projectType'),
  printType: document.querySelector('#printType'),
  finishing: document.querySelector('#finishing'),
  deadline: document.querySelector('#deadline'),
  copies: document.querySelector('#copies'),
  address: document.querySelector('#address'),
  file: document.querySelector('#file'),
  total: document.querySelector('#total'),
  whatsapp: document.querySelector('#whatsapp'),
  email: document.querySelector('#email'),
  addressField: document.querySelector('#addressField'),
  pickupNote: document.querySelector('#pickupNote'),
  accountName: document.querySelector('#accountName'),
  accountEmail: document.querySelector('#accountEmail'),
  accountPhone: document.querySelector('#accountPhone'),
  accountCompany: document.querySelector('#accountCompany'),
  accessForm: document.querySelector('#accessForm'),
  googleButton: document.querySelector('#googleButton'),
  accessSubmit: document.querySelector('#accessSubmit'),
  accessFeedback: document.querySelector('#accessFeedback'),
};

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function copies() {
  return Math.max(1, Number(fields.copies.value || 1));
}

function total() {
  return copies() * A1_PRICE + (deliveryMode === 'Entrega' ? DELIVERY_FEE : 0);
}

function message() {
  const fileName = fields.file.files && fields.file.files[0] ? fields.file.files[0].name : '';
  return [
    'Olá, quero imprimir um projeto em A1.',
    `Nome: ${fields.clientName.value || 'informar'}`,
    `WhatsApp: ${fields.phone.value || 'informar'}`,
    `Tipo de projeto: ${fields.projectType.value}`,
    `Impressão: ${fields.printType.value}`,
    `Acabamento: ${fields.finishing.value}`,
    `Quantidade: ${copies()} copia${copies() > 1 ? 's' : ''}`,
    `Valor A1: ${money(A1_PRICE)} por prancha`,
    `Subtotal da impressão: ${money(copies() * A1_PRICE)}`,
    `Prazo desejado: ${fields.deadline.value}`,
    `Recebimento: ${deliveryMode}`,
    deliveryMode === 'Entrega' ? `Taxa de entrega: ${money(DELIVERY_FEE)}` : 'Taxa de entrega: não se aplica',
    deliveryMode === 'Entrega' ? `Endereço: ${fields.address.value || 'informar'}` : 'Retirada: busco na loja',
    `Total estimado: ${money(total())}`,
    `Arquivo: ${fileName || 'vou anexar o PDF/DWG na conversa'}`,
  ].join('\n');
}

function refresh() {
  fields.total.textContent = money(total());
  const text = encodeURIComponent(message());
  fields.whatsapp.href = `https://wa.me/?text=${text}`;
  fields.email.href = `mailto:?subject=${encodeURIComponent('Pedido de impressão A1')}&body=${text}`;
}

function showAccessFeedback(text) {
  if (!fields.accessFeedback) return;
  fields.accessFeedback.textContent = text;
  fields.accessFeedback.hidden = false;
}

function applyProfile(profile) {
  fields.accountName.value = profile.name || '';
  fields.accountEmail.value = profile.email || '';
  fields.accountPhone.value = profile.phone || '';
  fields.accountCompany.value = profile.company || '';
  if (profile.name && !fields.clientName.value) fields.clientName.value = profile.name;
  if (profile.phone && !fields.phone.value) fields.phone.value = profile.phone;
  refresh();
}

function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) applyProfile(JSON.parse(saved));
  } catch {
    localStorage.removeItem(PROFILE_KEY);
  }
}

function saveProfile() {
  const profile = {
    name: fields.accountName.value.trim(),
    email: fields.accountEmail.value.trim(),
    phone: fields.accountPhone.value.trim(),
    company: fields.accountCompany.value.trim(),
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  applyProfile(profile);
  showAccessFeedback(accessMode === 'entrar' ? 'Dados encontrados e aplicados no pedido A1.' : 'Cadastro salvo e pronto para usar no pedido A1.');
}

function setAccessMode(mode) {
  accessMode = mode;
  document.querySelectorAll('.access-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.access === mode);
  });
  document.querySelectorAll('[data-register-only]').forEach((item) => {
    item.hidden = mode !== 'cadastrar';
  });
  fields.accessSubmit.textContent = mode === 'entrar' ? 'Entrar e preencher pedido' : 'Criar cadastro';
}

document.querySelectorAll('.choice').forEach((button) => {
  button.addEventListener('click', () => {
    deliveryMode = button.dataset.mode;
    document.querySelectorAll('.choice').forEach((item) => item.classList.toggle('active', item === button));
    fields.addressField.hidden = deliveryMode !== 'Entrega';
    fields.pickupNote.hidden = deliveryMode === 'Entrega';
    refresh();
  });
});

document.querySelectorAll('.access-tab').forEach((button) => {
  button.addEventListener('click', () => setAccessMode(button.dataset.access));
});

fields.accessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  saveProfile();
});

fields.googleButton.addEventListener('click', () => {
  showAccessFeedback('Botão do Google preparado. Para ativar o login real, falta conectar a chave Google/Firebase.');
});

Object.values(fields).forEach((field) => {
  if (field && ('addEventListener' in field)) {
    field.addEventListener('input', refresh);
    field.addEventListener('change', refresh);
  }
});

setAccessMode('entrar');
loadProfile();
refresh();
