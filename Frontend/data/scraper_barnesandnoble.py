"""
Barnes & Noble Web Scraper
Cào dữ liệu sách từ Barnes & Noble và lưu vào file JSON
Sử dụng Selenium để xử lý JavaScript và tránh bot detection
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import json
import time
import os
from datetime import datetime
import random

class BarnesAndNobleScraper:
    def __init__(self, headless=True):
        self.base_url = "https://minhlongbook.vn/"
        self.books = []
        self.driver = self._setup_driver(headless)
        
    def _setup_driver(self, headless=True):
        """Thiết lập Selenium WebDriver với Chrome"""
        chrome_options = Options()
        
        if headless:
            chrome_options.add_argument('--headless')
        
        # Các options để tránh bị phát hiện là bot
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Tắt các cảnh báo
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            # Thêm script để ẩn WebDriver
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            print("✓ Đã khởi tạo Chrome WebDriver")
            return driver
        except Exception as e:
            print(f"Lỗi khi khởi tạo WebDriver: {e}")
            print("\nVui lòng đảm bảo đã cài đặt Chrome và ChromeDriver")
            raise
        
    def get_page(self, url, wait_time=10, scroll=True):
        """Lấy nội dung trang web bằng Selenium"""
        try:
            print(f"Đang truy cập: {url}")
            self.driver.get(url)
            
            # Đợi trang load
            time.sleep(random.uniform(2, 4))
            
            # Scroll xuống để load lazy-loading images
            if scroll:
                self._scroll_page()
            
            # Đợi nội dung load
            try:
                WebDriverWait(self.driver, wait_time).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
            except TimeoutException:
                print(f"Timeout khi đợi trang load")
            
            # Thêm delay ngẫu nhiên
            time.sleep(random.uniform(1, 2))
            
            return self.driver.page_source
            
        except Exception as e:
            print(f"Lỗi khi truy cập {url}: {e}")
            return None
    
    def _scroll_page(self):
        """Scroll trang để load nội dung lazy-loading"""
        try:
            # Scroll từ từ xuống
            total_height = self.driver.execute_script("return document.body.scrollHeight")
            for i in range(1, 6):
                scroll_to = total_height * i // 5
                self.driver.execute_script(f"window.scrollTo(0, {scroll_to});")
                time.sleep(0.5)
            
            # Scroll về đầu trang
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.5)
        except Exception as e:
            print(f"Lỗi khi scroll: {e}")
    
    def scrape_bestsellers(self):
        """Cào dữ liệu từ trang Bestsellers"""
        print("\n" + "="*50)
        print("Đang cào dữ liệu từ trang Bestsellers...")
        print("="*50)
        url = f"{self.base_url}/b/books/_/N-29Z8q8"
        
        page_source = self.get_page(url)
        if not page_source:
            print("Không thể truy cập trang Bestsellers")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, "Bestsellers")
    
    def scrape_new_releases(self):
        """Cào dữ liệu từ trang New Releases"""
        print("\n" + "="*50)
        print("Đang cào dữ liệu từ trang New Releases...")
        print("="*50)
        url = f"{self.base_url}/b/new-releases/_/N-2pqw"
        
        page_source = self.get_page(url)
        if not page_source:
            print("Không thể truy cập trang New Releases")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, "New Releases")
    
    def scrape_fiction(self):
        """Cào dữ liệu từ danh mục Fiction"""
        print("\n" + "="*50)
        print("Đang cào dữ liệu từ danh mục Fiction...")
        print("="*50)
        url = f"{self.base_url}/b/fiction/_/N-2z13"
        
        page_source = self.get_page(url)
        if not page_source:
            print("Không thể truy cập trang Fiction")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, "Fiction")
    
    def scrape_category(self, category_name, category_url):
        """Cào dữ liệu từ một danh mục cụ thể"""
        print("\n" + "="*50)
        print(f"Đang cào dữ liệu từ danh mục {category_name}...")
        print("="*50)
        
        page_source = self.get_page(category_url)
        if not page_source:
            print(f"Không thể truy cập trang {category_name}")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, category_name)
    
    def _parse_book_grid(self, soup, category):
        """Parse thông tin sách từ grid layout"""
        # Tìm các phần tử chứa thông tin sách
        # Barnes & Noble sử dụng nhiều class/selector khác nhau
        
        selectors = [
            ('div', {'class': 'product-shelf-tile'}),
            ('div', {'class': 'product-info-wrapper'}),
            ('div', {'class': 'product-shelf-info'}),
            ('li', {'class': 'book-item'}),
            ('article', {'class': 'product'}),
            ('div', {'data-testid': 'product-card'}),
        ]
        
        book_items = []
        for tag, attrs in selectors:
            book_items = soup.find_all(tag, attrs)
            if book_items:
                print(f"✓ Tìm thấy {len(book_items)} items với selector {tag} {attrs}")
                break
        
        if not book_items:
            # Thử tìm bất kỳ div nào chứa img và link
            print("Đang thử fallback selector...")
            all_divs = soup.find_all('div')
            book_items = [div for div in all_divs if div.find('img') and div.find('a', href=True)]
            print(f"Tìm thấy {len(book_items)} items với fallback selector")
        
        print(f"\nĐang parse {len(book_items)} sách trong {category}...")
        
        parsed_count = 0
        for item in book_items:
            try:
                book_data = self._extract_book_info(item, category)
                if book_data:
                    self.books.append(book_data)
                    parsed_count += 1
                    print(f"  [{parsed_count}] ✓ {book_data['title'][:60]}")
            except Exception as e:
                # print(f"  ✗ Lỗi khi parse: {e}")
                continue
        
        print(f"\n✓ Đã parse thành công {parsed_count}/{len(book_items)} sách")
    
    def _extract_book_info(self, item, category):
        """Trích xuất thông tin chi tiết của một cuốn sách"""
        book = {
            'category': category,
            'scraped_at': datetime.now().isoformat()
        }
        
        # Title
        title_elem = item.find('h3', class_='product-shelf-title') or \
                     item.find('a', class_='product-title') or \
                     item.find('h2', class_='product-title')
        if title_elem:
            book['title'] = title_elem.get_text(strip=True)
        else:
            # Thử tìm bất kỳ link nào có thể là title
            link = item.find('a')
            if link:
                book['title'] = link.get_text(strip=True)
        
        # Author
        author_elem = item.find('p', class_='product-shelf-author') or \
                      item.find('a', class_='product-author') or \
                      item.find('span', class_='contributors')
        if author_elem:
            book['author'] = author_elem.get_text(strip=True).replace('by ', '')
        
        # Price
        price_elem = item.find('div', class_='price') or \
                     item.find('span', class_='current-price') or \
                     item.find('div', class_='product-shelf-price')
        if price_elem:
            price_text = price_elem.get_text(strip=True)
            book['price'] = price_text
        
        # Image URL
        img_elem = item.find('img')
        if img_elem:
            book['image_url'] = img_elem.get('src', '') or img_elem.get('data-src', '')
        
        # Product URL
        link_elem = item.find('a', href=True)
        if link_elem:
            href = link_elem['href']
            if not href.startswith('http'):
                href = self.base_url + href
            book['url'] = href
        
        # Rating (nếu có)
        rating_elem = item.find('div', class_='rating') or \
                      item.find('span', class_='stars')
        if rating_elem:
            book['rating'] = rating_elem.get_text(strip=True)
        
        # Chỉ trả về nếu có ít nhất title
        if 'title' in book and book['title']:
            return book
        return None
    
    def scrape_homepage_featured(self):
        """Cào dữ liệu từ các mục nổi bật trên trang chủ"""
        print("\n" + "="*50)
        print("Đang cào dữ liệu từ trang chủ...")
        print("="*50)
        url = self.base_url
        
        page_source = self.get_page(url)
        if not page_source:
            print("Không thể truy cập trang chủ")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, "Featured")
    
    def close(self):
        """Đóng WebDriver"""
        if self.driver:
            self.driver.quit()
            print("\n✓ Đã đóng WebDriver")
    
    def save_to_json(self, output_dir='.'):
        """Lưu dữ liệu vào file JSON trong thư mục hiện tại"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'barnesandnoble_books_{timestamp}.json'
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.books, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Đã lưu {len(self.books)} sách vào {filepath}")
        
        # Lưu thêm file latest.json để dễ sử dụng
        latest_filepath = os.path.join(output_dir, 'barnesandnoble_latest.json')
        with open(latest_filepath, 'w', encoding='utf-8') as f:
            json.dump(self.books, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Đã cập nhật {latest_filepath}")
        
        return filepath
    
    def get_summary(self):
        """Hiển thị thống kê tóm tắt"""
        print("\n" + "="*50)
        print("THỐNG KÊ DỮ LIỆU")
        print("="*50)
        print(f"Tổng số sách: {len(self.books)}")
        
        # Đếm theo category
        categories = {}
        for book in self.books:
            cat = book.get('category', 'Unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        print("\nPhân loại theo danh mục:")
        for cat, count in categories.items():
            print(f"  - {cat}: {count} sách")
        
        print("="*50 + "\n")


def main():
    """Hàm chính"""
    print("\n" + "="*60)
    print(" " * 15 + "BARNES & NOBLE WEB SCRAPER")
    print(" " * 18 + "(Powered by Selenium)")
    print("="*60 + "\n")
    
    scraper = None
    try:
        # Khởi tạo scraper (headless=False để xem trình duyệt, True để chạy nền)
        scraper = BarnesAndNobleScraper(headless=True)
        
        # Cào dữ liệu từ các trang khác nhau
        scraper.scrape_homepage_featured()
        scraper.scrape_bestsellers()
        scraper.scrape_new_releases()
        scraper.scrape_fiction()
        
        # Có thể thêm các danh mục khác
        # scraper.scrape_category("Mystery", "https://www.barnesandnoble.com/b/mystery/_/N-2z1a")
        # scraper.scrape_category("Romance", "https://www.barnesandnoble.com/b/romance/_/N-2z1e")
        # scraper.scrape_category("Biography", "https://www.barnesandnoble.com/b/biography/_/N-2z0z")
        
        # Lưu dữ liệu vào thư mục hiện tại
        scraper.save_to_json()
        
        # Hiển thị thống kê
        scraper.get_summary()
        
    except KeyboardInterrupt:
        print("\n\n⚠ Đã dừng bởi người dùng")
    except Exception as e:
        print(f"\n\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if scraper:
            scraper.close()


if __name__ == "__main__":
    main()
