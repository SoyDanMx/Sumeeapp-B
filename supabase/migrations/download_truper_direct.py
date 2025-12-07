#!/usr/bin/env python3
"""
Truper Image Downloader - Direct URL Pattern
Downloads product images from Truper using the pattern:
https://www.truper.com/media/import/imagenes/{SKU}.jpg
"""

import os
import time
import json
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
IMAGE_URL_PATTERN = "https://www.truper.com/media/import/imagenes/{sku}.jpg"
OUTPUT_DIR = Path("../../public/images/marketplace/truper")
LOG_FILE = Path("./truper_download_log.json")
SQL_OUTPUT_FILE = Path("./20251207_update_product_images.sql")
MAX_WORKERS = 5  # Concurrent downloads
TIMEOUT = 10  # Seconds

class TruperImageDownloader:
    def __init__(self):
        self.output_dir = OUTPUT_DIR
        self.log_file = LOG_FILE
        self.results = {"downloaded": [], "failed": [], "skipped": []}
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load previous log if exists
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                self.results = json.load(f)
    
    def save_log(self):
        """Save download log"""
        with open(self.log_file, 'w') as f:
            json.dump(self.results, f, indent=2)
    
    def download_image(self, sku):
        """Download image for a single SKU"""
        image_path = self.output_dir / f"{sku}.jpg"
        
        # Skip if already downloaded
        if image_path.exists():
            return {"sku": sku, "status": "skipped", "reason": "already_exists"}
        
        url = IMAGE_URL_PATTERN.format(sku=sku)
        
        try:
            # Create request with headers
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            
            # Download the image
            with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
                if response.status == 200:
                    image_data = response.read()
                    
                    # Verify it's actually an image (check for JPEG header)
                    if image_data[:2] == b'\xff\xd8':  # JPEG magic bytes
                        with open(image_path, 'wb') as f:
                            f.write(image_data)
                        return {"sku": sku, "status": "downloaded", "path": str(image_path)}
                    else:
                        return {"sku": sku, "status": "failed", "reason": "not_a_valid_image"}
                else:
                    return {"sku": sku, "status": "failed", "reason": f"http_{response.status}"}
                    
        except urllib.error.HTTPError as e:
            return {"sku": sku, "status": "failed", "reason": f"http_{e.code}"}
        except urllib.error.URLError as e:
            return {"sku": sku, "status": "failed", "reason": str(e.reason)}
        except Exception as e:
            return {"sku": sku, "status": "failed", "reason": str(e)}
    
    def download_all(self, skus):
        """Download images for all SKUs"""
        total = len(skus)
        downloaded = 0
        failed = 0
        skipped = 0
        
        print(f"📦 Starting download of {total} images...")
        print(f"📁 Output directory: {self.output_dir.absolute()}")
        print(f"🔗 URL pattern: {IMAGE_URL_PATTERN}")
        print(f"{'='*60}\n")
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(self.download_image, sku): sku for sku in skus}
            
            for i, future in enumerate(as_completed(futures), 1):
                result = future.result()
                sku = result["sku"]
                status = result["status"]
                
                if status == "downloaded":
                    print(f"[{i}/{total}] ✅ {sku} - Downloaded")
                    self.results["downloaded"].append(sku)
                    downloaded += 1
                elif status == "skipped":
                    print(f"[{i}/{total}] ⏭️  {sku} - Skipped (already exists)")
                    self.results["skipped"].append(sku)
                    skipped += 1
                else:
                    print(f"[{i}/{total}] ❌ {sku} - Failed ({result.get('reason', 'unknown')})")
                    self.results["failed"].append({"sku": sku, "reason": result.get("reason", "unknown")})
                    failed += 1
                
                # Save log periodically
                if i % 20 == 0:
                    self.save_log()
        
        # Final save
        self.save_log()
        
        print(f"\n{'='*60}")
        print(f"✅ DOWNLOAD COMPLETE")
        print(f"{'='*60}")
        print(f"Downloaded: {downloaded}")
        print(f"Skipped: {skipped}")
        print(f"Failed: {failed}")
        print(f"Total: {total}")
        
        return downloaded, skipped, failed
    
    def generate_sql(self):
        """Generate SQL to update product images in database"""
        downloaded_skus = self.results.get("downloaded", []) + self.results.get("skipped", [])
        
        if not downloaded_skus:
            print("No images to update.")
            return
        
        sql_lines = [
            "-- Update product images based on downloaded Truper images",
            "-- Generated automatically",
            ""
        ]
        
        for sku in downloaded_skus:
            image_path = f"/images/marketplace/truper/{sku}.jpg"
            # Update products where title starts with the SKU
            sql_lines.append(f"""
UPDATE marketplace_products 
SET images = ARRAY['{image_path}']
WHERE title LIKE '{sku} -%' OR title LIKE '{sku}%';
""")
        
        sql_content = "\n".join(sql_lines)
        
        with open(SQL_OUTPUT_FILE, 'w') as f:
            f.write(sql_content)
        
        print(f"\n📝 SQL file generated: {SQL_OUTPUT_FILE}")
        print(f"   Contains {len(downloaded_skus)} UPDATE statements")


def main():
    """Main function"""
    # Read SKUs from file
    skus_file = Path("./truper_skus.txt")
    
    if not skus_file.exists():
        print("❌ Error: truper_skus.txt not found")
        return
    
    with open(skus_file, 'r') as f:
        skus = [line.strip() for line in f if line.strip()]
    
    print(f"🔍 Found {len(skus)} SKUs to process\n")
    
    # Create downloader and start
    downloader = TruperImageDownloader()
    downloaded, skipped, failed = downloader.download_all(skus)
    
    # Generate SQL update file
    if downloaded > 0 or skipped > 0:
        downloader.generate_sql()
    
    print(f"\n✨ Done! Check the log file for details: {LOG_FILE}")


if __name__ == "__main__":
    main()
