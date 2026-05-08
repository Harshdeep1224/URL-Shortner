from flask import Flask, render_template, request, jsonify, redirect
import string
import random
import sqlite3
import os

app = Flask(__name__)
DB_FILE = 'urls.db'

def init_db():
    """Initializes the SQLite database and creates the urls table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS urls
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  original_url TEXT NOT NULL,
                  short_id TEXT NOT NULL UNIQUE)''')
    conn.commit()
    conn.close()

def generate_short_id(length=6):
    """Generates a random string of fixed length to use as a short ID."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.route('/')
def index():
    """Renders the main index page."""
    return render_template('index.html')

@app.route('/shorten', methods=['POST'])
def shorten_url():
    """API endpoint to shorten a given URL."""
    data = request.get_json()
    original_url = data.get('url')
    
    if not original_url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Ensure the URL has a scheme (http:// or https://)
    if not original_url.startswith(('http://', 'https://')):
        original_url = 'https://' + original_url

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Check if the URL has already been shortened to avoid duplicates
    c.execute('SELECT short_id FROM urls WHERE original_url = ?', (original_url,))
    result = c.fetchone()
    
    if result:
        short_id = result[0]
    else:
        # Generate a unique short ID
        while True:
            short_id = generate_short_id()
            c.execute('SELECT id FROM urls WHERE short_id = ?', (short_id,))
            if not c.fetchone():
                break
        
        # Save to database
        c.execute('INSERT INTO urls (original_url, short_id) VALUES (?, ?)', (original_url, short_id))
        conn.commit()
        
    conn.close()
    
    # Construct the full shortened URL
    short_url = request.host_url + short_id
    return jsonify({'short_url': short_url})

@app.route('/<short_id>')
def redirect_url(short_id):
    """Redirects the short ID to its original URL."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT original_url FROM urls WHERE short_id = ?', (short_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return redirect(result[0])
    return 'URL not found', 404

if __name__ == '__main__':
    # Initialize the database and run the Flask application
    init_db()
    app.run(debug=True, port=5001)
