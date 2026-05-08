# Snip - Premium URL Shortener

Snip is an elegant, modern, and high-performance URL shortener built with Python (Flask) on the backend and pure HTML/CSS/JS with a Glassmorphism design system on the frontend.

## 🚀 How to Run the Project

Running the project takes just a few steps:

1. **Navigate to the application directory:**
   ```bash
   cd /Applications/url-shortner
   ```

2. **(Optional but Recommended) Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python app.py
   ```

5. **Open in browser:**
   Go to `http://127.0.0.1:5000/` in your browser to view the application!

---

## 📖 Detailed Code Explanation (Line by Line)

### 1. `app.py` (Backend - Flask)
This handles the logic, API, and Database of the app.

- `from flask import Flask, render_template...`: Imports the necessary web framework functions.
- `import string, random, sqlite3, os`: Standard Python tools for text generation and the SQLite Database.
- `app = Flask(__name__)`: Initializes our Flask application.
- `DB_FILE = 'urls.db'`: Points our application to our database file.

**`init_db()` Function:**
- `conn = sqlite3.connect(DB_FILE)`: Connects to the SQL database.
- `c.execute('''CREATE TABLE IF NOT EXISTS urls ...''')`: Creates a table with `id`, `original_url`, and `short_id` if it doesn't already exist.

**`generate_short_id()` Function:**
- `chars = string.ascii_letters + string.digits`: Defines available characters (A-Z, a-z, 0-9).
- `return ''.join(random.choice(chars) ...)`: Selects 6 random characters from the pool to form our short link ID (e.g., "aB3dE1").

**`@app.route('/')`:**
- Connects the root URL (http://localhost:5000/) to the `index()` function.
- `return render_template('index.html')`: Serves our frontend HTML page.

**`@app.route('/shorten', methods=['POST'])`:**
- Handles the API request triggered when a user clicks the "Shorten" button.
- `data = request.get_json()`: Extracts the JSON payload submitted by JS.
- `if not original_url.startswith(...)`: Checks if the user provided `http://` or `https://` prefix, and adds it if they didn't.
- *Database Logic*: We query the DB to see if the URL was already shortened. If not, we generate a short ID, verify it is unique, and `INSERT` it into the Database.
- `short_url = request.host_url + short_id`: Joins our base URL with the 6-character code (e.g. `http://localhost:5000/xYz123`).
- `return jsonify({'short_url': short_url})`: Returns the result as JSON to the frontend.

**`@app.route('/<short_id>')`:**
- This listens for any URL path (like `/xYz123`).
- It connects to the Database and searches for the `short_id`.
- `if result: return redirect(result[0])`: If a match is found, Flask redirects the user to the `original_url`.
- `return 'URL not found', 404`: Shows a 404 error if the code doesn't exist.

**`if __name__ == '__main__':`:**
- `init_db()`: Prepares the Database when the app boots.
- `app.run(...)`: Starts the local development server on port `5000`.

---

### 2. `templates/index.html` (Structure)
- The HTML incorporates modern semantic tags like `<main>` and `<header>`.
- We import Google Fonts (`Outfit`) to give it premium typography.
- Background abstract circles (`div.shape`) are injected here for CSS to style as floating ambient elements.
- Uses SVG inline icons for pixel-perfect clarity.
- Forms are equipped with `id`s allowing Javascript to interact with them without a full page refresh.

### 3. `static/style.css` (Premium Design)
- **CSS Variables (`:root`)**: Defines a cohesive light-green and white color palette (`--primary`, `--primary-light`, etc.).
- **Background Shapes**: `.shape` classes are styled with `border-radius: 50%` and heavy `filter: blur(80px)` to create soft glow effects. An `@keyframes float` animation shifts them infinitely.
- **Glassmorphism**: `.glass-panel` achieves the frosted-glass look by utilizing `background: rgba(255, 255, 255, 0.7)` and `backdrop-filter: blur(16px)`.
- **Micro-animations**: `.arrow-icon` transitions when hovering over the Submit button, and `button[type="submit"]:active` triggers a slight shrinking scale to mimic a physical button press.

### 4. `static/script.js` (Interactivity)
- `document.addEventListener('DOMContentLoaded', ...)`: Waits for the HTML to fully load.
- `form.addEventListener('submit', async (e) => ...)`: Intercepts the form submission to prevent the page from refreshing.
- `const urlPattern = /.../`: A Regular Expression that validates whether the text entered is structurally a web URL.
- `const response = await fetch('/shorten', ...)`: Dispatches the user's long URL securely via POST request to our Flask backend.
- `shortUrlEl.textContent = data.short_url`: Injects the received Short URL into the Result box.
- `navigator.clipboard.writeText(...)`: Modern browser API that securely copies the shortened URL to the user's system clipboard when the Copy button is pressed. It then temporarily swaps the icon to a Checkmark to indicate success.
