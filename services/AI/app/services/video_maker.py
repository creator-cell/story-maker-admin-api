import os
import uuid
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, CompositeAudioClip
from dotenv import load_dotenv

load_dotenv()

def create_video(image_paths: list, audio_path: str) -> str:
    clips = []
    for path in image_paths:
        img = ImageClip(path, duration=3)
        clips.append(img)

    # Combine video
    video = concatenate_videoclips(clips, method="compose")

    # Load audio
    audio = AudioFileClip(audio_path)

    # 🔥 Attach audio properly
    video.audio = CompositeAudioClip([audio])

    project_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(project_dir, "final_videos")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, f"{uuid.uuid4()}.mp4")
    video.write_videofile(output_path, fps=24)

    return output_path
