from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import text_gen, image_gen, voiceover, video_maker
import aiohttp
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Dependency to provide aiohttp session
async def get_aiohttp_session():
    async with aiohttp.ClientSession() as session:
        yield session

# Request model for ad generation
class AdRequest(BaseModel):
    productName: str
    audience: str

# Request model for image generation (Ad Poster)
class AdPosterRequest(BaseModel):
    productName: str
    audience: str

# POST endpoint to generate images (ad posters)
# POST endpoint to generate images (ad posters)
@router.post("/generate-ad-poster")
async def generate_ad_poster(
    request: AdPosterRequest, 
    session: aiohttp.ClientSession = Depends(get_aiohttp_session)
):
    try:
        script = text_gen.generate_script(request.productName, request.audience)

        # You can add 'platform' dynamically later, for now let's say facebook
        image_prompt = f"A beautiful poster showcasing {request.productName} for {request.audience}"
        ad_text = f"Discover {request.productName}"

        images = await image_gen.generate_images(image_prompt, ad_text, session, platform="facebook")

        return {
            "message": "Ad poster successfully generated",
            "script": script,
            "images": images
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ad poster: {str(e)}")

# POST endpoint to generate AI-based ad video
@router.post("/generate-ad-video")
async def generate_ad_video(
    request: AdRequest,
    session: aiohttp.ClientSession = Depends(get_aiohttp_session)
):
    try:
        # 1. Generate the script text
        script = text_gen.generate_script(request.productName, request.audience)

        # 2. Create prompts
        image_prompt = f"Scenes for an ad video promoting {request.productName} for {request.audience}"
        ad_text = f"Introducing {request.productName}"

        # 3. Generate visuals (images) for the video
        images = await image_gen.generate_images(image_prompt, ad_text, session)

        # 4. Generate voiceover from the script
        audio_path = voiceover.generate_voiceover(script)

        # 5. Stitch video from images and audio
        video_path = video_maker.create_video(images, audio_path)

        return {
            "message": "Ad video successfully generated",
            "script": script,
            "video_url": video_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ad video: {str(e)}")
