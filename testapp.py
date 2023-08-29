from flask import Flask,render_template,request, jsonify,send_from_directory
import openai
import os
import requests
import json
import pandas as pd
import numpy as np

import mimetypes
mimetypes.add_type('application/javascript', '.js')

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv('API_KEY')
current_language = "en"  # Set the default language

df = pd.read_csv('CICG2308.csv')

df["embedding"] = df.embedding.apply(eval).apply(np.array)

pd.set_option('display.max_colwidth', None)

from openai.embeddings_utils import get_embedding, cosine_similarity

def calculate_similarity(embedding, search_embedding):
    return cosine_similarity(embedding, search_embedding)

# search through the reviews for a specific product
def search_reviews(df, search, n=3, pprint=True):
    search_embedding  = get_embedding(
        search,
        engine="text-embedding-ada-002"
    )
    df["similarity"] = df.embedding.apply(lambda x: calculate_similarity(x, search_embedding))

    results = (
        df.sort_values("similarity", ascending=False).head(n).combined.tolist()
    )
    return results

@app.route('/')
def hello_world():
    return render_template("Index.html")

@app.route('/chat', methods=['POST'])
def chat():
        user_message = request.form['user_message']

        # Get the current language from the request
        current_language = request.form.get('current_language', 'en')
        # Call the search_reviews function to get similar reviews
        similar_reviews = search_reviews(df, user_message, n=5)  # You might need to adjust n

        # Construct the chat response with similar review text
        bot_response = "\n".join(similar_reviews) if similar_reviews else "No matching reviews found."

    #This using ChatCompletion gpt-3.5-turbo
    #     # Call OpenAI API to get the model's response
        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are helpful assistant. Your mission is to answer questions using data i provide you. If the answer is not in the data, don't provide any answer. If the answer is in data give the answer without any comment"}
            ,{"role": "user", "content": user_message},
        {"role": "assistant", "content": bot_response}],
        max_tokens=195,
        temperature = 0,
        top_p = 0.5
    )

        # {"role": "assistant", "content": f"Switch to {current_language}"}
        bot_reply = response['choices'][0]['message']['content'].strip()

        # return jsonify({'bot_reply': bot_response})
        return jsonify({'bot_reply': bot_reply})

@app.route('/change_language', methods=['POST'])
def change_language():
    selected_language = request.form['language']
    # You can store the selected language in a session or just update the global variable
    current_language = selected_language

    return jsonify({'success': True})

@app.route('/talk',methods =['POST'])
def talk():
    url = "https://api.convai.com/tts/"
    api_key =  os.getenv('API_CONVAI_KEY')  # Replace this with your ConvAI API key

    # Get the transcript from the POST request
    transcript = request.form.get('transcript')

    # Prepare the payload for the ConvAI TTS API
    payload = json.dumps({
        "transcript": transcript,
        "voice": "WUMale 1",  # You can change the voice according to your needs
        "filename": "testAudio",
        "encoding": "mp3"
    })

    headers = {
        'CONVAI-API-KEY': api_key,
        'Content-Type': 'application/json'
    }

     # Make the POST request to ConvAI TTS API
    response = requests.post(url, headers=headers, data=payload)

    if response.status_code == 200:
        # Return the audio data as response
        return response.content, 200, {'Content-Type': 'audio/mpeg'}
    else:
        return jsonify({'error': 'Failed to generate audio.'}), response.status_code

if __name__ == "__main__":
        app.run(debug=False)