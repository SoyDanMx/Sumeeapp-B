#!/usr/bin/env python3

"""
Truper Image URL Finder

Searches for Truper product images and attempts to find direct image URLs.

Since the Truper image bank doesn't allow easy automated downloads,
this script will help identify which products have images available.
"""

import os
import time
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
TRUPER_BANK_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/index"
LOG_FILE = Path("./truper_image_search_log.json")
WAIT_TIME = 1  # Seconds between searches


class TruperImageFinder:
    def __init__(self):
        self.log_file = LOG_FILE
        self.results = self.load_log()
    
    def load_log(self):
        """Load previous results from log file"""
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                return json.load(f)
        return {"found": [], "not_found": [], "errors": []}
    
    def save_log(self):
        """Save results log"""
        with open(self.log_file, 'w') as f:
            json.dump(self.results, f, indent=2)
    
    def search_product(self, page, sku):
        """Search for a product and check if it exists"""
        try:
            print(f"Searching: {sku}...", end=" ")
            
            # Navigate to search page
            page.goto(TRUPER_BANK_URL, wait_until="domcontentloaded", timeout=30000)
            time.sleep(1)
            
            # Search for the SKU
            search_box = page.locator("#buscador")
            search_box.fill(sku)
            
            # Click search button
            search_button = page.locator("button.btn-primary")
            search_button.click()
            
            # Wait for results
            time.sleep(2)
            
            # Check if product found
            checkboxes = page.locator("input[type='checkbox'][id]").all()
            
            if len(checkboxes) == 0:
                print("❌ Not found")
                self.results["not_found"].append(sku)
                return False
            
            # Get product ID
            product_id = checkboxes[0].get_attribute("id")
            print(f"✓ Found (ID: {product_id})")
            
            self.results["found"].append({
                "sku": sku,
                "product_id": product_id
            })
            return True
            
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}")
            self.results["errors"].append({"sku": sku, "error": str(e)})
            return False
    
    def process_batch(self, skus):
        """Process a batch of SKUs"""
        with sync_playwright() as p:
            # Launch browser (headless for speed)
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = context.new_page()
            
            for i, sku in enumerate(skus):
                # Skip if already processed
                found_skus = [item["sku"] for item in self.results.get("found", [])]
                if sku in found_skus or sku in self.results.get("not_found", []):
                    print(f"[{i+1}/{len(skus)}] {sku} - Already processed")
                    continue
                
                print(f"[{i+1}/{len(skus)}] ", end="")
                self.search_product(page, sku)
                
                # Save log after each search
                self.save_log()
                
                # Wait between searches
                if i < len(skus) - 1:
                    time.sleep(WAIT_TIME)
            
            browser.close()
            
            print(f"\n{'='*60}")
            print(f"✅ Batch complete!")
            print(f"Found: {len(self.results.get('found', []))}")
            print(f"Not found: {len(self.results.get('not_found', []))}")
            print(f"Errors: {len(self.results.get('errors', []))}")
            print(f"{'='*60}")


def main():
    """Main function"""
    # Read SKUs from file
    skus_file = Path("./truper_skus.txt")
    
    if not skus_file.exists():
        print("❌ Error: truper_skus.txt not found")
        return
    
    with open(skus_file, 'r') as f:
        skus = [line.strip() for line in f if line.strip()]
    
    print(f"📦 Found {len(skus)} SKUs to process\n")
    
    # Create finder
    finder = TruperImageFinder()
    
    # Process all SKUs
    finder.process_batch(skus)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"Total SKUs: {len(skus)}")
    print(f"Found in Truper bank: {len(finder.results.get('found', []))}")
    print(f"Not found: {len(finder.results.get('not_found', []))}")
    print(f"Errors: {len(finder.results.get('errors', []))}")
    print(f"\nResults saved to: {LOG_FILE}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()

