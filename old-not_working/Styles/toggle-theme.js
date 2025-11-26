class ThemeToggle {
    constructor() {
        console.log('ThemeToggle constructor called');
        
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeStyle = document.getElementById('theme-style');
        
        if (!this.themeToggle || !this.themeStyle) {
            console.error('Theme toggle elements not found!');
            return;
        }
        
        this.currentTheme = localStorage.getItem('chess-theme') || 'light';
        
        this.initializeTheme();
        this.initializeEventListeners();
        
        // Signal theme toggle initialized
        this.updateStatus('status-toggle-theme', 'theme-toggle: initialized');
        console.log('ThemeToggle initialized (current theme:', this.currentTheme, ')');
    }

    updateStatus(id, text) {
        try {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        } catch (e) {
            // Ignore if element doesn't exist
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
        console.log('Theme changed to:', this.currentTheme);
    }

    applyTheme(theme) {
        const cssFile = theme === 'light' ? './Styles/Light.css' : './Styles/Dark.css';
        this.themeStyle.href = cssFile;
    }

    updateToggleButton() {
        this.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        this.themeToggle.setAttribute('title', 
            this.currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
        );
    }
}

// Wait for DOM to load, then initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ThemeToggle...');
    try {
        window.themeToggle = new ThemeToggle();
    } catch (err) {
        console.error('Failed to initialize ThemeToggle:', err);
    }
});

console.log('Styles/toggle-theme.js loaded');