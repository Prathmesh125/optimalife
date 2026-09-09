import os
import asyncio
import aiohttp
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

# Base directory for saving scraped data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PAGES = {
    "blog_probiotic": "https://www.optimalife.in/why-the-same-probiotic-works-brilliantly-on-one-farm-does-absolutely-nothing/",
    "blog_cure_medicines": "https://www.optimalife.in/cure-medicines-acquisition/",
    "blog_vietnam_offsite": "https://www.optimalife.in/optivision-vietnam-2026-offsite/",
    "blog_optivision_sales": "https://www.optimalife.in/optivision-2026-annual-sales-meet/",
    "blog_optivision_leadership": "https://www.optimalife.in/optivision-leadership-workshop/",
    "blog_care_center": "https://www.optimalife.in/care-center-for-animal-research-and-excellence/",
    "blog_dubai_symposium": "https://www.optimalife.in/optima-life-sciences-at-dubai-poultry-technology-innovation-symposium-2025/",
    "blog_14_years": "https://www.optimalife.in/14-years-of-excellence/",
    "blog_new_plant": "https://www.optimalife.in/inauguration-of-optima-life-sciences-new-manufacturing-plant/",
    "blog_reviving_earth": "https://www.optimalife.in/reviving-the-barren-earth/",
}

async def download_image(session, img_url, save_path):
    # Some images might already be data URIs, skip downloading them via http
    if img_url.startswith('data:'):
        return False
        
    try:
        async with session.get(img_url, timeout=15) as response:
            if response.status == 200:
                with open(save_path, 'wb') as f:
                    f.write(await response.read())
                return True
    except Exception as e:
        print(f"Failed to download {img_url}: {e}")
    return False

def sanitize_filename(url):
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    if not filename:
        filename = "image_" + str(abs(hash(url))) + ".png"
    
    valid_chars = "-_.() abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    filename = ''.join(c for c in filename if c in valid_chars)
    return filename

def extract_all_images_from_html(html_content, base_url):
    soup = BeautifulSoup(html_content, 'html.parser')
    image_urls = []
    
    for img in soup.find_all('img'):
        # Look for data-src, data-lazy-src, data-srcset, or standard src
        src = img.get('data-src') or img.get('data-lazy-src')
        
        if not src:
            srcset = img.get('data-srcset')
            if srcset:
                # Take the highest resolution from srcset (usually the last or first, let's take first for simplicity if comma separated)
                src = srcset.split(',')[0].split()[0]
                
        if not src:
            src = img.get('src')
            
        # Ignore 1x1 blank placeholders
        if src and "data:image/gif;base64" not in src:
            if src.startswith('/'):
                 src = urljoin(base_url, src)
            image_urls.append(src)
            
    # Remove duplicates
    return list(set(image_urls))

async def process_page(crawler, session, page_name, url):
    print(f"\\n--- Processing {page_name} ({url}) ---")
    page_dir = os.path.join(BASE_DIR, page_name)
    images_dir = os.path.join(page_dir, "images")
    
    os.makedirs(images_dir, exist_ok=True)
    
    js_scroll = """
    window.scrollTo(0, document.body.scrollHeight);
    setTimeout(() => { window.scrollTo(0, 0); }, 500);
    """
    
    config = CrawlerRunConfig(
        page_timeout=60000,
        remove_overlay_elements=True,
        word_count_threshold=0, # bypass anti-bot on small pages
        js_code=js_scroll,
        cache_mode=CacheMode.BYPASS # bypass cache to ensure full load
    )
    
    # Retry mechanism for anti-bot / load failures
    max_retries = 3
    result = None
    
    for attempt in range(max_retries):
        try:
            result = await crawler.arun(url, config=config)
            if result.success:
                break
            else:
                print(f"Attempt {attempt+1} failed: {getattr(result, 'error_message', 'Unknown error')}")
                await asyncio.sleep(2)
        except Exception as e:
            print(f"Attempt {attempt+1} exception: {e}")
            await asyncio.sleep(2)
    
    if not result or not result.success:
        print(f"❌ Completely failed to crawl {url} after {max_retries} attempts.")
        return
        
    print(f"✅ Successfully crawled {url}")
    
    # Save textual contents
    with open(os.path.join(page_dir, "content.md"), "w", encoding="utf-8") as f:
        f.write(result.markdown)
        
    with open(os.path.join(page_dir, "raw.html"), "w", encoding="utf-8") as f:
        f.write(result.html)
        
    # Extract images using BeautifulSoup for robustness against lazy-loading
    image_urls = extract_all_images_from_html(result.html, url)
    print(f"Found {len(image_urls)} true images on {page_name} using HTML parsing.")
    
    download_tasks = []
    downloaded_filenames = set()
    
    for i, img_url in enumerate(image_urls):
        base_filename = sanitize_filename(img_url)
        if not base_filename or base_filename in downloaded_filenames:
            base_filename = f"img_{i}_{sanitize_filename(img_url)}"
            if not base_filename:
                 base_filename = f"img_{i}.jpg"
                 
        downloaded_filenames.add(base_filename)
        save_path = os.path.join(images_dir, base_filename)
        
        # skip if already exists from previous run and size > 0
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            continue
            
        download_tasks.append(download_image(session, img_url, save_path))
        
    if download_tasks:
        results = await asyncio.gather(*download_tasks)
        success_count = sum(1 for r in results if r)
        print(f"📥 Downloaded {success_count}/{len(download_tasks)} NEW images for {page_name}")
    else:
         print(f"📥 All found images for {page_name} are already downloaded or none found.")

async def main():
    print("Starting Bulletproof Optima Life scraping process...")
    
    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    )
    
    async with aiohttp.ClientSession() as session:
        async with AsyncWebCrawler(config=browser_config) as crawler:
            for page_name, url in PAGES.items():
                await process_page(crawler, session, page_name, url)
                await asyncio.sleep(2)  # Respectful delay between pages
                
    print("\\n🎉 All bulletproof scraping completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
