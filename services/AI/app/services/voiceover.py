import os
import uuid
from google.cloud import texttospeech
from dotenv import load_dotenv

load_dotenv()

def generate_voiceover(script: str) -> str:
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=script)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    audio_dir = "/tmp/voiceovers"
    os.makedirs(audio_dir, exist_ok=True)
    audio_path = os.path.join(audio_dir, f"{uuid.uuid4()}.mp3")

    with open(audio_path, "wb") as out:
        out.write(response.audio_content)

    return audio_path
