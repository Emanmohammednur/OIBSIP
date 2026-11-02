const form = document.querySelector('#converter-form');
const input = document.querySelector('#temperature');
const inputWrap = document.querySelector('#temperature-wrap');
const unitSelect = document.querySelector('#unit');
const message = document.querySelector('#message');
const resultState = document.querySelector('#result-state');
const resultCards = [...document.querySelectorAll('.result-card')];

const ABSOLUTE_ZERO = {
  C: { value: -273.15, label: '−273.15°C' },
  F: { value: -459.67, label: '−459.67°F' },
  K: { value: 0, label: '0 K' },
};

const DECIMAL_NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

function formatTemperature(value) {
  const rounded = value.toFixed(2);
  return Number(rounded) === 0 ? '0.00' : rounded;
}

function toCelsius(value, unit) {
  if (unit === 'F') return (value - 32) * (5 / 9);
  if (unit === 'K') return value - 273.15;
  return value;
}

function displayError(text) {
  message.textContent = text;
  message.classList.remove('success');
  inputWrap.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  resultState.classList.remove('is-ready');
  resultState.innerHTML = '<span></span> NEEDS ATTENTION';
  input.focus();
}

function clearError() {
  message.textContent = '';
  message.classList.remove('success');
  inputWrap.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
}

function convert(event) {
  event.preventDefault();
  clearError();

  const rawValue = input.value.trim();
  if (rawValue === '') {
    displayError('Add a temperature value to see all three readings.');
    return;
  }

  if (!DECIMAL_NUMBER.test(rawValue)) {
    displayError('That value doesn’t look numeric. Try a number like 24 or -5.5.');
    return;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    displayError('That number is too large to convert. Try a smaller value.');
    return;
  }

  const unit = unitSelect.value;
  const zero = ABSOLUTE_ZERO[unit];
  if (value < zero.value) {
    displayError(`That’s below absolute zero. ${unit === 'K' ? 'Kelvin cannot be negative.' : `The lowest possible reading is ${zero.label}.`}`);
    return;
  }

  const celsius = toCelsius(value, unit);
  const readings = {
    C: celsius,
    F: celsius * (9 / 5) + 32,
    K: celsius + 273.15,
  };

  resultCards.forEach((card, index) => {
    const key = card.dataset.unit;
    card.querySelector('.result-value').textContent = formatTemperature(readings[key]);
    card.classList.remove('is-updated');
    // Restart the entrance animation so repeated conversions feel responsive.
    void card.offsetWidth;
    card.style.animationDelay = `${index * 70}ms`;
    card.classList.add('is-updated');
  });

  resultState.classList.add('is-ready');
  resultState.innerHTML = '<span></span> CONVERTED';
  message.textContent = 'Converted with absolute-zero limits applied.';
  message.classList.add('success');
}

form.addEventListener('submit', convert);
input.addEventListener('input', () => {
  if (inputWrap.classList.contains('invalid')) clearError();
});
unitSelect.addEventListener('change', () => {
  if (inputWrap.classList.contains('invalid')) clearError();
});

