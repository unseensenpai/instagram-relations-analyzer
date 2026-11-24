async function injectModal() {
  if (document.getElementById('ig-relations-modal-overlay')) return;

  try {
    const cssUrl = chrome.runtime.getURL('src/ui/modal.css');
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = cssUrl;
    document.head.appendChild(linkElement);

    const htmlUrl = chrome.runtime.getURL('src/ui/modal.html');
    const response = await fetch(htmlUrl);
    const htmlText = await response.text();
    
    const container = document.createElement('div');
    container.innerHTML = htmlText;
    document.body.appendChild(container);

    const jsUrl = chrome.runtime.getURL('src/ui/modal.js');
    const scriptElement = document.createElement('script');
    scriptElement.src = jsUrl;
    scriptElement.type = 'module';
    document.body.appendChild(scriptElement);

    createFloatingButton();
  } catch (err) {
    console.error(err);
  }
}

const FLOAT_MINIMIZED_KEY = 'ig_relations_float_minimized';

function createFloatingButton() {
  if (document.getElementById('ig-relations-float-wrap')) return;

  const wrap = document.createElement('div');
  wrap.id = 'ig-relations-float-wrap';

  const btn = document.createElement('button');
  btn.id = 'ig-relations-float-trigger';
  btn.type = 'button';
  btn.innerHTML = '<span class="ig-float-icon">📊</span><span class="ig-float-label"> IG Relations</span>';

  const minBtn = document.createElement('button');
  minBtn.id = 'ig-relations-float-minimize';
  minBtn.type = 'button';
  minBtn.title = 'Minimize / Expand';

  const applyMinimized = (isMin) => {
    wrap.classList.toggle('minimized', isMin);
    minBtn.textContent = isMin ? '‹' : '›';
    try {
      localStorage.setItem(FLOAT_MINIMIZED_KEY, isMin ? '1' : '0');
    } catch {
      // ignore
    }
  };

  let initialMin = false;
  try {
    initialMin = localStorage.getItem(FLOAT_MINIMIZED_KEY) === '1';
  } catch {
    // ignore
  }
  applyMinimized(initialMin);

  btn.addEventListener('click', () => {
    const overlay = document.getElementById('ig-relations-modal-overlay');
    if (overlay) {
      overlay.classList.toggle('ig-relations-hidden');
    }
  });

  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyMinimized(!wrap.classList.contains('minimized'));
  });

  wrap.appendChild(btn);
  wrap.appendChild(minBtn);
  document.body.appendChild(wrap);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectModal();
} else {
  window.addEventListener('DOMContentLoaded', injectModal);
}