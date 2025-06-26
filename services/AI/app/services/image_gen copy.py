import os
import uuid
import aiohttp
import asyncio
from openai import AsyncOpenAI

# Initialize the OpenAI Async Client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def fetch_image_url(prompt: str) -> str:
    """Generates a single image and returns the URL."""
    try:
        response = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,  # DALL·E 3 allows only 1
            size="1024x1024"
        )
        return response.data[0].url
    except Exception as e:
        raise Exception(f"Error generating image URL: {str(e)}")

async def download_image(session, url, save_path):
    """Downloads an image from URL and saves it."""
    try:
        async with session.get(url) as resp:
            if resp.status == 200:
                content = await resp.read()
                with open(save_path, 'wb') as f:
                    f.write(content)
            else:
                raise Exception(f"Failed to download image, status code: {resp.status}")
    except Exception as e:
        raise Exception(f"Error downloading image: {str(e)}")

async def generate_images(prompt: str) -> list:
    """Generates multiple images asynchronously."""
    images_dir = "/tmp/generated_images"
    os.makedirs(images_dir, exist_ok=True)

    try:
        # Step 1: Fetch image URLs concurrently
        fetch_tasks = [fetch_image_url(prompt) for _ in range(3)]
        image_urls = await asyncio.gather(*fetch_tasks)

        # Step 2: Download images concurrently
        async with aiohttp.ClientSession() as session:
            download_tasks = []
            image_paths = []

            for url in image_urls:
                img_path = os.path.join(images_dir, f"{uuid.uuid4()}.png")
                image_paths.append(img_path)
                download_tasks.append(download_image(session, url, img_path))

            await asyncio.gather(*download_tasks)

        return image_paths

    except Exception as e:
        raise Exception(f"Error generating images: {str(e)}")
