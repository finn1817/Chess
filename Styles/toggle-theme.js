class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeStyle = document.getElementById('theme-style');
        this.currentTheme = localStorage.getItem('chess-theme') || 'light';
        
        this.initializeTheme();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.themeToggle.addEventListener('click', () => {
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

// Initialize theme toggle when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ThemeToggle();
});