class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeStyle = document.getElementById('theme-style');
        this.currentTheme = localStorage.getItem('chess-theme') || 'light';
        
        this.initializeTheme();
        this.initializeEventListeners();
        // Signal theme toggle initialized
        try {
            const el = document.getElementById('status-toggle-theme');
            if (el) el.textContent = 'theme-toggle: initialized';
            console.log('ThemeToggle initialized (current theme:', this.currentTheme, ')');
        } catch (e) {
            console.warn('Could not update startup status for theme-toggle:', e);
        }
    }

    initializeEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            console.log('theme-toggle clicked');
            this.toggleTheme();
        });
    }

    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.updateToggleButton();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateToggleButton();
        localStorage.setItem('chess-theme', this.currentTheme);
    }

    applyTheme(theme) {
        const cssFile = theme === 'light' ? 'Styles/Light.css' : 'Styles/Dark.css';
        this.themeStyle.href = cssFile;
    }

    updateToggleButton() {
        this.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        this.themeToggle.setAttribute('title', 
            this.currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
        );
    }
}

// Initialize theme toggle when page loads (handles already-fired event)
function _onReadyTheme(fn) {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

_onReadyTheme(() => {
    try {
        new ThemeToggle();
    } catch (err) {
        console.error('Failed to initialize ThemeToggle:', err);
    }
});