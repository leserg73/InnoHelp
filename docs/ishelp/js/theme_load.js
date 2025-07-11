// Обработчик сообщений от дочерних окон
window.addEventListener('message', function(event) {
  if (event.data.type === 'SET_THEME') {
    handleThemeChange(event.data.theme);
  }
});

// Функция для применения темы и рассылки
function handleThemeChange(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Ждём загрузки всех iframe перед отправкой сообщений
  document.querySelectorAll('iframe').forEach(iframe => {
    iframe.onload = function() {
      try {
        iframe.contentWindow.postMessage({
          type: 'SET_THEME',
          theme: theme
        }, '*');
      } catch (e) {
        console.error("Ошибка отправки темы в iframe:", e);
      }
    };

    // Если iframe уже загружен, отправляем сразу
    if (iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({
          type: 'SET_THEME',
          theme: theme
        }, '*');
      } catch (e) {
        console.error("Ошибка отправки темы в iframe:", e);
      }
    }
  });
}