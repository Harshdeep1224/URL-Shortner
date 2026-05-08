document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shorten-form');
    const input = document.getElementById('url-input');
    const errorMsg = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const shortUrlEl = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = input.value.trim();
        
        // Check if input is empty
        if (!url) {
            showError('Please enter a valid URL.');
            return;
        }

        // Basic URL pattern validation
        const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i;
        if (!urlPattern.test(url)) {
            showError('Please enter a valid URL format (e.g., example.com).');
            return;
        }

        hideError();
        form.classList.add('loading');
        resultContainer.classList.add('hidden');

        try {
            // Send API Request to backend
            const response = await fetch('/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            // Handle successful response
            if (response.ok) {
                shortUrlEl.textContent = data.short_url;
                shortUrlEl.href = data.short_url;
                resultContainer.classList.remove('hidden');
            } else {
                showError(data.error || 'An error occurred while shortening the URL.');
            }
        } catch (error) {
            showError('Network error. Please try again later.');
        } finally {
            form.classList.remove('loading');
        }
    });

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', () => {
        const urlToCopy = shortUrlEl.textContent;
        navigator.clipboard.writeText(urlToCopy).then(() => {
            copyBtn.classList.add('copied');
            
            // Swap icon to a checkmark temporarily
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="tooltip">Copied!</span>
            `;
            
            // Revert back after 2 seconds
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // Hide error when the user starts typing again
    input.addEventListener('input', () => {
        if (!errorMsg.classList.contains('hidden')) {
            hideError();
        }
    });

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.classList.add('hidden');
    }
});
