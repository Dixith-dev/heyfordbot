import logging
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# Suppress logging output
logging.getLogger().setLevel(logging.ERROR)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Generate response - simple echo function
def generate_response(user_input):
    # Just echo back what the user said
    return f"Echo: {user_input}"

# Flask routes
@app.route('/')
def home():
    return render_template('bannner.html')

@app.route('/get-response', methods=['POST'])
def get_response():
    user_input = request.json['message'].lower().strip()
    user_id = request.json.get('user_id')  # Get user/session identifier from the request
    if not user_id:
        return jsonify({'response': "Error: User ID is missing or invalid."})

    response = generate_response(user_input)  # Generate response from the AI
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
