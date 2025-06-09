// Dark mode toggle functionality
(function() {
  'use strict';

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply the saved theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Create theme toggle button
  function createThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    
    const updateToggleButton = (theme) => {
      if (theme === 'dark') {
        toggleButton.innerHTML = '<span class="theme-icon">☀️</span>Light Mode';
      } else {
        toggleButton.innerHTML = '<span class="theme-icon">🌙</span>Dark Mode';
      }
    };

    // Set initial button state
    updateToggleButton(currentTheme);

    // Add click event listener
    toggleButton.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Apply new theme
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save preference
      localStorage.setItem('theme', newTheme);
      
      // Update button
      updateToggleButton(newTheme);
      
      // Dispatch custom event for any other components that might need to know
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: newTheme } 
      }));
    });

    // Add to page
    document.body.appendChild(toggleButton);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggle);
  } else {
    createThemeToggle();
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update button if it exists
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
          if (newTheme === 'dark') {
            toggleButton.innerHTML = '<span class="theme-icon">☀️</span>Light Mode';
          } else {
            toggleButton.innerHTML = '<span class="theme-icon">🌙</span>Dark Mode';
          }
        }
      }
    });

    // Set initial theme based on system preference if no saved preference
    if (!localStorage.getItem('theme') && mediaQuery.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
})();
