/**
 * Theme Manager for RSV Application
 * Handles dynamic theme switching, font loading, and persistence.
 */

const ThemeManager = {
    currentTheme: 'serika-dark',

    /**
     * Initialize theme on page load
     */
    async init() {
        // 1. Check localStorage first
        const savedTheme = localStorage.getItem('user-theme');
        if (savedTheme && window.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }

        // 2. Apply theme immediately (from localStorage or default)
        this.applyTheme(this.currentTheme);

        // 3. If user is logged in, try to fetch theme from DB to override
        const user = JSON.parse(localStorage.getItem('rsv_user') || 'null');
        const token = localStorage.getItem('rsv_token');
        if (user && token) {
            // Priority: if user object has theme, use it
            if (user.theme) {
                this.applyTheme(user.theme);
                localStorage.setItem('user-theme', user.theme);
                this.currentTheme = user.theme;
            }

            try {
                const response = await fetch('/api/v1/theme', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (result.success && result.data.theme) {
                    this.applyTheme(result.data.theme);
                    localStorage.setItem('user-theme', result.data.theme);
                    this.currentTheme = result.data.theme;
                }
            } catch (error) {
                console.error('Failed to fetch theme from DB:', error);
            }
        }
    },

    /**
     * Apply theme to the entire website
     * @param {string} themeName 
     */
    applyTheme(themeName) {
        const theme = window.themes[themeName];
        if (!theme) return;

        // Load fonts
        this.loadGoogleFont(theme.googleFont);

        // Apply CSS Variables
        const root = document.documentElement;
        Object.keys(theme.colors).forEach(property => {
            root.style.setProperty(property, theme.colors[property]);
        });

        // Set font family
        root.style.setProperty('--font-main', theme.font);

        this.currentTheme = themeName;
    },

    /**
     * Save theme to localStorage and DB if logged in
     * @param {string} themeName 
     */
    async saveTheme(themeName) {
        if (!window.themes[themeName]) return;

        // Update UI instantly
        this.applyTheme(themeName);

        // Save to localStorage
        localStorage.setItem('user-theme', themeName);

        // Save to DB if logged in
        const user = JSON.parse(localStorage.getItem('rsv_user') || 'null');
        const token = localStorage.getItem('rsv_token');
        if (user && token) {
            try {
                await fetch('/api/v1/theme', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ theme: themeName })
                });

                // Update theme in stored user object too
                user.theme = themeName;
                localStorage.setItem('rsv_user', JSON.stringify(user));
            } catch (error) {
                console.error('Failed to save theme to DB:', error);
            }
        }
    },

    /**
     * Dynamically load Google Font
     * @param {string} fontName 
     */
    loadGoogleFont(fontName) {
        const fontId = `google-font-${fontName}`;
        if (document.getElementById(fontId)) return;

        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700&display=swap`;
        document.head.appendChild(link);
    }
};

// Auto-init on script load if it's in the browser
if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
    });
}
