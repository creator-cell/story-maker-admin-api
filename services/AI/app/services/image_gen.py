import os
import uuid
import base64
import openai
from openai import AsyncOpenAI
from PIL import Image, ImageDraw, ImageFont
import aiohttp
from dotenv import load_dotenv

load_dotenv()

# Enable debug logging for OpenAI
openai.logging = "debug"

# Initialize OpenAI async client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SOCIAL_MEDIA_SIZES = {
    "facebook": (1200, 628),
    "instagram": (1080, 1080),
    "twitter": (1600, 900),
    "google": (1200, 628),
    "snapchat": (1080, 1920),
}

async def generate_images(prompt: str, ad_text: str, session: aiohttp.ClientSession, platform: str = "facebook") -> list:
    try:
        print("👉 Step 1: Requesting image from OpenAI...")
        print(f"👉 Using prompt: {prompt}")
        
        response = await client.images.generate(
            model="dall-e-2",   # switched to DALL-E 2
            prompt=prompt,
            n=1,
            size="1024x1024",
            response_format="url"
        )

        print(f"✅ Step 1 complete: Response received: {response}")

        image_url = response.data[0].url
        print(f"👉 Step 2: Image URL: {image_url}")

        if not image_url:
            raise Exception("No image URL returned from OpenAI")

        print("👉 Step 3: Downloading image...")
        async with session.get(image_url) as resp:
            print(f"HTTP status for image download: {resp.status}")
            if resp.status != 200:
                raise Exception(f"Failed to download image, status code: {resp.status}")
            img_bytes = await resp.read()

        output_dir = "generated_images"
        os.makedirs(output_dir, exist_ok=True)
        raw_filename = f"{uuid.uuid4()}.png"
        raw_img_path = os.path.join(output_dir, raw_filename)

        print(f"👉 Step 4: Saving raw image to {raw_img_path}")
        with open(raw_img_path, "wb") as f:
            f.write(img_bytes)

        print("👉 Step 5: Opening downloaded image...")
        img = Image.open(raw_img_path).convert("RGBA")

        width, height = SOCIAL_MEDIA_SIZES.get(platform.lower(), (1024, 1024))
        print(f"👉 Step 6: Resizing image to {width}x{height}")
        img = img.resize((width, height), Image.LANCZOS)

        print(f"👉 Step 7: Drawing ad text: '{ad_text}'")
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", size=60)
        except Exception as font_err:
            print(f"⚠️ Font loading failed, using default font: {font_err}")
            font = ImageFont.load_default()

        # Correct way to measure text
        bbox = draw.textbbox((0, 0), ad_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (width - text_width) / 2
        y = 50  # Top margin

        # Draw shadow
        shadow_color = "black"
        for offset in [(2,2), (-2,2), (2,-2), (-2,-2)]:
            draw.text((x+offset[0], y+offset[1]), ad_text, font=font, fill=shadow_color)

        # Draw white text
        draw.text((x, y), ad_text, font=font, fill="white")

        final_poster_path = os.path.join(output_dir, f"poster_{raw_filename}")
        print(f"👉 Step 8: Saving final poster to {final_poster_path}")
        img.save(final_poster_path)

        print("✅ Step 9: Poster generation completed successfully!")

        return [final_poster_path]

    except Exception as e:
        print(f"❌ Error occurred: {e}")
        raise Exception(f"Failed to generate ad poster: {str(e)}")
