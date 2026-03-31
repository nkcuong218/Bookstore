"""
Minh Long Book Web Scraper
Cào dữ liệu sách từ minhlongbook.vn và lưu vào file JSON
Sử dụng Selenium để xử lý JavaScript
Cấu trúc dữ liệu theo mock-data-vn.js
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
import re

class MinhLongBookScraper:
    def __init__(self, headless=True):
        self.base_url = "https://minhlongbook.vn"
        self.books = []
        self.genres_map = {}
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
    
    def scrape_categories(self):
        """Lấy danh sách các danh mục sách"""
        print("\n" + "="*60)
        print("Đang lấy danh sách danh mục...")
        print("="*60)
        
        page_source = self.get_page(self.base_url)
        if not page_source:
            return []
        
        soup = BeautifulSoup(page_source, 'html.parser')
        categories = []
        
        # Tìm menu danh mục
        menu_items = soup.find_all(['a', 'li'], class_=re.compile(r'(menu|nav|category)', re.I))
        
        for item in menu_items:
            link = item if item.name == 'a' else item.find('a')
            if link and link.get('href'):
                href = link['href']
                if '/danh-muc' in href or '/category' in href or '/the-loai' in href:
                    category_name = link.get_text(strip=True)
                    if category_name and len(category_name) > 0:
                        if not href.startswith('http'):
                            href = self.base_url + href
                        categories.append({'name': category_name, 'url': href})
                        print(f"  ✓ {category_name}: {href}")
        
        return categories
    
    def scrape_homepage(self):
        """Cào dữ liệu từ trang chủ"""
        print("\n" + "="*60)
        print("Đang cào dữ liệu từ trang chủ...")
        print("="*60)
        
        page_source = self.get_page(self.base_url)
        if not page_source:
            print("Không thể truy cập trang chủ")
            return
        
        soup = BeautifulSoup(page_source, 'html.parser')
        self._parse_book_grid(soup, "Trang chủ")
    
    def scrape_category(self, category_name, category_url, max_pages=3):
        """Cào dữ liệu từ một danh mục"""
        print("\n" + "="*60)
        print(f"Đang cào dữ liệu từ danh mục: {category_name}")
        print("="*60)
        
        for page in range(1, max_pages + 1):
            # Thử các format URL phân trang khác nhau
            urls_to_try = [
                f"{category_url}?page={page}",
                f"{category_url}&page={page}",
                f"{category_url}/page/{page}",
                category_url if page == 1 else None
            ]
            
            for url in urls_to_try:
                if url:
                    page_source = self.get_page(url)
                    if page_source:
                        soup = BeautifulSoup(page_source, 'html.parser')
                        books_before = len(self.books)
                        self._parse_book_grid(soup, category_name)
                        books_added = len(self.books) - books_before
                        
                        if books_added > 0:
                            print(f"  → Trang {page}: Thêm {books_added} sách")
                            break
                    
                    time.sleep(random.uniform(1, 2))
    
    def _parse_book_grid(self, soup, category):
        """Parse thông tin sách từ grid layout"""
        # Tìm các phần tử chứa thông tin sách
        selectors = [
            ('div', {'class': re.compile(r'product|item|book', re.I)}),
            ('article', {'class': re.compile(r'product|item|book', re.I)}),
            ('li', {'class': re.compile(r'product|item|book', re.I)}),
        ]
        
        book_items = []
        for tag, attrs in selectors:
            items = soup.find_all(tag, attrs)
            if items:
                # Lọc các item có hình ảnh và link
                book_items = [item for item in items if item.find('img') and item.find('a', href=True)]
                if book_items:
                    print(f"✓ Tìm thấy {len(book_items)} items với selector {tag}")
                    break
        
        if not book_items:
            print("Không tìm thấy sản phẩm nào")
            return
        
        print(f"Đang parse {len(book_items)} sách...")
        
        parsed_count = 0
        for item in book_items:
            try:
                book_data = self._extract_book_info(item, category)
                if book_data and book_data not in self.books:
                    # Kiểm tra trùng lặp theo title
                    if not any(b['title'] == book_data['title'] for b in self.books):
                        self.books.append(book_data)
                        parsed_count += 1
                        print(f"  [{len(self.books)}] ✓ {book_data['title'][:60]}")
            except Exception as e:
                continue
        
        print(f"✓ Đã parse thành công {parsed_count} sách mới")
    
    def _extract_book_info(self, item, category):
        """Trích xuất thông tin chi tiết của một cuốn sách theo cấu trúc mock-data-vn.js"""
        book = {
            'id': len(self.books) + 1,
            'genre': category,
            'inStock': True,
            'language': 'Tiếng Việt'
        }
        
        # Title
        title_selectors = [
            item.find('h3'),
            item.find('h2'),
            item.find('h4'),
            item.find('a', class_=re.compile(r'title|name|product-name', re.I)),
            item.find(class_=re.compile(r'title|name|product-name', re.I))
        ]
        
        for elem in title_selectors:
            if elem:
                title = elem.get_text(strip=True)
                if title and len(title) > 3:
                    book['title'] = title
                    break
        
        # Author
        author_selectors = [
            item.find(class_=re.compile(r'author|tac-gia', re.I)),
            item.find('span', string=re.compile(r'Tác giả|Author', re.I)),
        ]
        
        for elem in author_selectors:
            if elem:
                author = elem.get_text(strip=True).replace('Tác giả:', '').replace('Author:', '').strip()
                if author:
                    book['author'] = author
                    break
        
        if 'author' not in book:
            book['author'] = 'Đang cập nhật'
        
        # Price
        price_selectors = [
            item.find(class_=re.compile(r'price|gia|cost', re.I)),
            item.find('span', class_=re.compile(r'price|gia', re.I)),
            item.find('div', class_=re.compile(r'price|gia', re.I)),
        ]
        
        for elem in price_selectors:
            if elem:
                price_text = elem.get_text(strip=True)
                # Trích xuất số từ text (ví dụ: "150.000₫" -> 150000)
                price_match = re.search(r'([\d,\.]+)', price_text.replace('.', '').replace(',', ''))
                if price_match:
                    try:
                        book['price'] = int(price_match.group(1))
                        break
                    except:
                        pass
        
        if 'price' not in book:
            book['price'] = 0
        
        # Image URL
        img = item.find('img')
        if img:
            img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if img_url:
                if not img_url.startswith('http'):
                    img_url = self.base_url + img_url
                book['coverUrl'] = img_url
        
        if 'coverUrl' not in book:
            book['coverUrl'] = 'https://via.placeholder.com/200x300?text=No+Image'
        
        # Product URL
        link = item.find('a', href=True)
        if link:
            href = link['href']
            if not href.startswith('http'):
                href = self.base_url + href
            book['url'] = href
        
        # Description (nếu có)
        desc_elem = item.find(class_=re.compile(r'description|desc|mo-ta', re.I))
        if desc_elem:
            book['description'] = desc_elem.get_text(strip=True)[:300]
        else:
            book['description'] = f"Cuốn sách {book.get('title', 'này')} thuộc thể loại {category}."
        
        # Default values theo mock-data-vn.js
        book['isbn'] = '978-0000000000'
        book['pages'] = 300
        book['publisher'] = 'Đang cập nhật'
        book['rating'] = round(random.uniform(4.0, 4.9), 1)
        book['reviews'] = random.randint(100, 30000)
        
        # Chỉ trả về nếu có title
        if 'title' in book and book['title']:
            return book
        return None
    
    def scrape_all(self, max_categories=10, max_pages_per_category=2):
        """Cào toàn bộ dữ liệu từ website"""
        print("\n" + "="*60)
        print("BẮT ĐẦU CÀO DỮ LIỆU TOÀN BỘ WEBSITE")
        print("="*60)
        
        # Cào trang chủ
        self.scrape_homepage()
        
        # Lấy danh sách categories
        categories = self.scrape_categories()
        
        if categories:
            print(f"\nTìm thấy {len(categories)} danh mục")
            for i, cat in enumerate(categories[:max_categories], 1):
                print(f"\n[{i}/{min(len(categories), max_categories)}] Đang cào: {cat['name']}")
                self.scrape_category(cat['name'], cat['url'], max_pages=max_pages_per_category)
                time.sleep(random.uniform(2, 4))
        else:
            print("\nKhông tìm thấy danh mục, chỉ cào trang chủ")
    
    def save_to_json(self, output_dir='.'):
        """Lưu dữ liệu vào file JSON theo định dạng mock-data-vn.js"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Chuẩn bị dữ liệu theo format mock-data-vn.js
        output_data = {
            'mockBooks': self.books,
            'mockGenres': list(set(book['genre'] for book in self.books)),
            'scraped_at': datetime.now().isoformat(),
            'total_books': len(self.books)
        }
        
        # File với timestamp
        filename = f'minhlongbook_data_{timestamp}.json'
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Đã lưu {len(self.books)} sách vào {filepath}")
        
        # File latest
        latest_filepath = os.path.join(output_dir, 'minhlongbook_latest.json')
        with open(latest_filepath, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Đã cập nhật {latest_filepath}")
        
        # Lưu thêm file .js để import trực tiếp (giống mock-data-vn.js)
        js_filepath = os.path.join(output_dir, 'minhlongbook-data.js')
        with open(js_filepath, 'w', encoding='utf-8') as f:
            f.write("// Dữ liệu sách từ minhlongbook.vn\n")
            f.write(f"// Cào ngày: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("export const mockBooks = ")
            json.dump(self.books, f, ensure_ascii=False, indent=2)
            f.write("\n\nexport const mockGenres = ")
            json.dump(output_data['mockGenres'], f, ensure_ascii=False, indent=2)
            f.write("\n")
        
        print(f"✓ Đã tạo file JS: {js_filepath}")
        
        return filepath
    
    def get_summary(self):
        """Hiển thị thống kê tóm tắt"""
        print("\n" + "="*60)
        print("THỐNG KÊ DỮ LIỆU")
        print("="*60)
        print(f"Tổng số sách: {len(self.books)}")
        
        # Đếm theo thể loại
        genres = {}
        for book in self.books:
            genre = book.get('genre', 'Khác')
            genres[genre] = genres.get(genre, 0) + 1
        
        print("\nPhân loại theo thể loại:")
        for genre, count in sorted(genres.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {genre}: {count} sách")
        
        # Thống kê giá
        prices = [book['price'] for book in self.books if book['price'] > 0]
        if prices:
            print(f"\nThống kê giá:")
            print(f"  - Giá thấp nhất: {min(prices):,}đ")
            print(f"  - Giá cao nhất: {max(prices):,}đ")
            print(f"  - Giá trung bình: {sum(prices)//len(prices):,}đ")
        
        print("="*60 + "\n")
    
    def close(self):
        """Đóng WebDriver"""
        if self.driver:
            self.driver.quit()
            print("\n✓ Đã đóng WebDriver")


def main():
    """Hàm chính"""
    print("\n" + "="*60)
    print(" " * 15 + "MINH LONG BOOK WEB SCRAPER")
    print(" " * 18 + "(Powered by Selenium)")
    print("="*60 + "\n")
    
    scraper = None
    try:
        # Khởi tạo scraper
        scraper = MinhLongBookScraper(headless=True)
        
        # Cào toàn bộ dữ liệu
        # max_categories: số danh mục tối đa để cào
        # max_pages_per_category: số trang tối đa mỗi danh mục
        scraper.scrape_all(max_categories=15, max_pages_per_category=3)
        
        # Lưu dữ liệu
        scraper.save_to_json()
        
        # Hiển thị thống kê
        scraper.get_summary()
        
        print("\n" + "="*60)
        print("HOÀN THÀNH!")
        print("="*60)
        print("\nĐể sử dụng dữ liệu trong React:")
        print("1. Copy file minhlongbook-data.js vào src/apis/")
        print("2. Import: import { mockBooks } from './apis/minhlongbook-data'")
        print("="*60 + "\n")
        
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
