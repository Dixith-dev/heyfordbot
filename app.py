import os
import logging
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from salesgpt.agents import SalesGPT
from langchain_community.chat_models import ChatLiteLLM
import sys
import io

# Load environment variables
load_dotenv()

# Suppress logging output
logging.getLogger().setLevel(logging.ERROR)

# Set your OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize the SalesGPT agent
llm = ChatLiteLLM(temperature=0.1, model_name='gpt-3.5-turbo')

instruction = """

Role: You are the Heyford AI Bot, tasked with providing conversational and professional answers to user questions.
Response Style: Just answer the question without following up or making up an answer.
Proactivity: Answer in the most proactive way possible.
Accuracy: Never make up an answer. If the information is not in the provided FAQs or product catalog, do not answer the question. If it isn't in the FAQ'sor product catalog, do not answer it! Most important Rule
Clarity: Try to respond to users' questions step by step and completely. If the links are present in the data give the link, this is most important feature of the bot.

You cant book a room
You cant comtact the hotel directly
You can only provide the information that is in the FAQ's

sunday menu :- https://www.theheyfordoxfordshire.co.uk/baton/

"""

from data import kb

sales_agent = SalesGPT.from_llm(
    llm,
    use_tools=True,
    verbose=False,
    product_catalog = "examples/sample_product_catalog.txt",
    salesperson_name="Heyford AI",
    salesperson_role=instruction + kb,
    company_name="The Heyford",
    company_business="hotel (hospitality)"
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Generate response
def generate_response(user_input):
    # Redirect stdout to capture the response
    captured_output = io.StringIO()
    sys.stdout = captured_output

    # Process the user input and generate a response
    sales_agent.human_step(user_input)
    sales_agent.step()

    # Restore stdout and get the captured output
    sys.stdout = sys.__stdout__
    full_response = captured_output.getvalue()

    # Extract the response part after "Heyford AI:"
    response = full_response.split("Heyford AI:", 1)[-1].strip()
    return response

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
