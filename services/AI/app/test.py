import os
from google.auth import exceptions
from google.auth import load_credentials_from_file
from dotenv import load_dotenv
load_dotenv()

def check_google_credentials():
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not credentials_path:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS is not set in environment.")
        return
    
    print(f"🔍 Checking credentials at: {credentials_path}")
    if not os.path.exists(credentials_path):
        print(f"❌ File not found: {credentials_path}")
        return
    
    try:
        credentials, project = load_credentials_from_file(credentials_path)
        print(f"✅ Credentials loaded successfully. Project ID: {project}")
    except exceptions.DefaultCredentialsError as e:
        print(f"❌ Failed to load credentials: {e}")

check_google_credentials()
