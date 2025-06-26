import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

# No need for load_dotenv() here if you already did it in main.py
# Only needed if running this file independently
# load_dotenv()

# Create an OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_script(product_name: str, audience: str) -> str:
    prompt = f"Write a short, emotional and catchy advertisement script for a product '{product_name}' targeting '{audience}'."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        raise Exception(f"Error generating script: {str(e)}")
