/* ============================================================
   theme.js — Core logic for Light/Dark mode implementation
   ============================================================ */

(function () {
    const THEME_KEY = 'rsv-user-theme';
    const html = document.documentElement;

    /**
     * Applies the given theme to the document and persists it
     * @param {'light' | 'dark'} mode 
     */
    const setTheme = (mode) => {
        html.setAttribute('data-theme', mode);
        localStorage.setItem(THEME_KEY, mode);
        updateToggleIcons(mode);
    };

    /**
     * Updates all theme toggle buttons to show the correct icon
     */
    const updateToggleIcons = (mode) => {
        const buttons = document.querySelectorAll('.theme-toggle');
        buttons.forEach(btn => {
            const icon = btn.querySelector('svg');
            if (icon) {
                // If light theme, show Moon (to switch to dark)
                // If dark theme, show Sun (to switch to light)
                if (mode === 'dark') {
                    // Sun Icon
                    icon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zM5.99 18.01l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c-.39-.39-.39-1.03 0-1.41s-1.03-.39-1.41 0z"></path>';
                } else {
                    // Moon Icon
                    icon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path>';
                }
            }
        });
    };

    /**
     * Toggles between light and dark themes
     */
    const toggleTheme = () => {
        const current = html.getAttribute('data-theme') || 'light';
        setTheme(current === 'light' ? 'dark' : 'light');
    };

    // Initialize theme based on preference or system settings
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Apply initial theme immediately (prevents flash of unstyled content if script is in <head>)
    setTheme(initialTheme);

    // Setup event listeners after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Look for any theme toggle buttons and attach listeners
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                toggleTheme();
            }
        });

        // Initial icon update
        updateToggleIcons(initialTheme);
    });

    // Expose toggle to window object
    window.toggleTheme = toggleTheme;
})();
