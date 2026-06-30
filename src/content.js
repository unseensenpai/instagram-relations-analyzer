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

function createFloatingButton() {
  const btn = document.createElement('button');
  btn.id = 'ig-relations-float-trigger';
  btn.innerText = '📊 IG Relations';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    const overlay = document.getElementById('ig-relations-modal-overlay');
    if (overlay) {
      overlay.classList.toggle('ig-relations-hidden');
    }
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectModal();
} else {
  window.addEventListener('DOMContentLoaded', injectModal);
}