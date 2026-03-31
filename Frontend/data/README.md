# Minh Long Book Web Scraper

Script Python để cào dữ liệu sách từ trang web minhlongbook.vn sử dụng Selenium.
Cấu trúc dữ liệu tương thích với mock-data-vn.js

## Yêu cầu

1. **Python 3.8+**
2. **Google Chrome** (đã cài đặt)
3. **ChromeDriver** (tự động tải qua webdriver-manager)

## Cài đặt

### Bước 1: Cài đặt Google Chrome
Tải và cài đặt Chrome từ: https://www.google.com/chrome/

### Bước 2: Cài đặt các thư viện Python
```bash
pip install -r requirements.txt
```

Hoặc cài đặt từng thư viện:
```bash
pip install selenium beautifulsoup4 lxml webdriver-manager
```

## Sử dụng

### Scraper cho Minh Long Book (Khuyến nghị):
```bash
cd Frontend/data
python scraper_minhlongbook.py
```

Script sẽ:
- Cào dữ liệu từ trang chủ minhlongbook.vn
- Tự động lấy danh sách các danh mục
- Cào dữ liệu từ tất cả các danh mục
- Lưu dữ liệu với cấu trúc giống mock-data-vn.js
- Tạo file .js để import trực tiếp vào React

### Scraper cho Barnes & Noble:
```bash
cd Frontend/data
python scraper_barnesandnoble.py
```

### Tùy chỉnh script:

Bạn có thể thêm các danh mục khác bằng cách uncomment hoặc thêm dòng trong hàm `main()`:

```python
# Ví dụ thêm danh mục Mystery
scraper.scrape_category("Mystery", "https://www.barnesandnoble.com/b/mystery/_/N-2z1a")

# Ví dụ thêm danh mục Romance
scraper.scrape_category("Romance", "https://www.barnesandnoble.com/b/romance/_/N-2z1e")
```

## Cấu trúc dữ liệu (theo mock-data-vn.js)

Mỗi sách được lưu với các thông tin:
- `id`: ID tự động tăng
- `title`: Tên sách
- `author`: Tác giả
- `price`: Giá (số nguyên, VNĐ)
- `genre`: Thể loại
- `coverUrl`: URL hình ảnh bìa sách
- `description`: Mô tả ngắn
- `isbn`: Mã ISBN
- `pages`: Số trang
- `publisher`: Nhà xuất bản
- `language`: Ngôn ngữ
- `rating`: Đánh giá (1-5)
- `reviews`: Số lượt đánh giá
- `inStock`: Còn hàng (true/false)

## Output

### Minh Long Book Scraper tạo ra 3 file:
1. `minhlongbook_data_YYYYMMDD_HHMMSS.json` - File với timestamp
2. `minhlongbook_latest.json` - File mới nhất
3. `minhlongbook-data.js` - File JavaScript để import trực tiếp

### Barnes & Noble Scraper tạo ra 2 file:
1. `barnesandnoble_books_YYYYMMDD_HHMMSS.json` - File với timestamp
2. `barnesandnoble_latest.json` - File mới nhất

## Lưu ý

- Script sử dụng **Selenium** để xử lý JavaScript và tránh bot detection
- Chạy ở chế độ **headless** (không hiện cửa sổ trình duyệt) mặc định
- Có delay ngẫu nhiên giữa các request để tránh bị chặn
- Tự động scroll trang để load lazy-loading images
- Barnes & Noble có thể thay đổi cấu trúc HTML, script có thể cần cập nhật

### Chế độ Debug
Để xem trình duyệt hoạt động, sửa dòng trong `main()`:
```python
scraper = BarnesAndNobleScraper(headless=False)  # Hiển thị trình duyệt
```

## Khắc phục sự cố

Nếu không cào được dữ liệu:
1. Kiểm tra kết nối internet
2. Kiểm tra xem Barnes & Noble có thay đổi cấu trúc website không
3. Tăng delay giữa các request nếu bị chặn
4. Sử dụng proxy hoặc VPN nếu IP bị block

## Sử dụng dữ liệu trong React

### Cách 1: Import file .js (Khuyến nghị cho Minh Long Book)
```javascript
import { mockBooks, mockGenres } from './data/minhlongbook-data';

// Sử dụng trong component
function BookList() {
  return (
    <div>
      {mockBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

### Cách 2: Import file JSON
```javascript
import booksData from './data/minhlongbook_latest.json';

// Sử dụng
const books = booksData.mockBooks;
```

### Thay thế mock-data-vn.js
Sau khi cào xong, bạn có thể:
1. Copy `minhlongbook-data.js` thành `mock-data-vn.js`
2. Hoặc sửa import trong code từ `mock-data-vn` thành `minhlongbook-data`
