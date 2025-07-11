// Управление темами сайта
class ThemeManager {
  static init() {
    this.setupThemeSwitch();
    this.setupMessageHandlers();
    this.loadSavedTheme();
  }

  static setupThemeSwitch() {
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
      themeSwitch.addEventListener('change', () => {
        const theme = themeSwitch.checked ? 'dark' : 'light';
        this.applyTheme(theme, true);
      });
    }
  }

  static setupMessageHandlers() {
    // Обработчик сообщений от дочерних окон
    window.addEventListener('message', (event) => {
      if (event.data.type === 'SET_THEME') {
        this.applyTheme(event.data.theme, false);
      }
    });
  }

  static loadSavedTheme() {
  // Устанавливаем светлую тему по умолчанию
  const defaultTheme = 'light';
  const savedTheme = localStorage.getItem('theme') || defaultTheme;

  // Принудительно устанавливаем светлую тему при первой загрузке
  if (!localStorage.getItem('theme')) {
    this.applyTheme(defaultTheme, true);
  } else {
    this.applyTheme(savedTheme, true);
  }

  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) {
    themeSwitch.checked = savedTheme === 'dark';
  }
}

  static applyTheme(theme, notifyFrames = true) {
    // Устанавливаем атрибут темы
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Обновляем изображения
    this.updateThemeImages(theme);

    // Обновляем переключатель
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
      themeSwitch.checked = theme === 'dark';
    }
    
    // Уведомляем фреймы/родительское окно
    if (notifyFrames) {
      if (window.parent !== window) {
        // Если это фрейм - уведомляем родителя
        window.parent.postMessage({ type: 'SET_THEME', theme: theme }, '*');
      } else {
        // Если это главное окно - уведомляем все фреймы
      this.notifyAllFrames(theme);
      }
    }
  }

  static updateThemeImages(theme) {
    document.querySelectorAll('img[data-theme-image]').forEach(img => {
      try {
        const baseSrc = img.dataset.themeImage;
        img.src = theme === 'dark' 
          ? baseSrc.replace('.svg', '_dark.svg')
          : baseSrc;
      } catch (e) {
        console.error('Error updating theme image:', e);
      }
    });
  }

  static notifyAllFrames(theme) {
    document.querySelectorAll('iframe').forEach(iframe => {
      const sendTheme = () => {
        try {
          iframe.contentWindow?.postMessage({ 
            type: 'SET_THEME', 
            theme: theme 
          }, '*');
        } catch (e) {
          console.error("Error sending theme to iframe:", e);
        }
      };

      if (iframe.contentWindow) {
        sendTheme();
      } else {
        iframe.onload = sendTheme;
      }
      
      // Дублируем отправку для надежности
      setTimeout(sendTheme, 100);
      setTimeout(sendTheme, 300);
    });
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

// Для случаев, когда скрипт загружается после DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  ThemeManager.init();
}