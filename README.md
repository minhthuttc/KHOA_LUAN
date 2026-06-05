# Đề tài: Xây dựng website tích hợp AI gợi ý số sim phù hợp với nhu cầu người sử dụng

Dự án này là hệ thống ứng dụng trí tuệ nhân tạo (AI/Thuật toán) nhằm giới thiệu, định giá và gợi ý những chiếc thẻ sim điện thoại phù hợp nhất với mong muốn, điểm sở thích, và phong thủy của từng khách hàng.

---

## Kiến trúc Hệ thống (System Architecture)

Dự án được xây dựng dựa trên mô hình **Client-Server (Frontend - Backend tách biệt)** hoàn toàn nhằm đảm bảo hiệu suất, khả năng bảo trì và dễ dàng mở rộng (Scalability).

### 1. Frontend (Giao diện người dùng)
- **Framework chính**: **Next.js 14** (App Router) dựa trên React.js. Tối ưu cực tốt cho SEO và cung cấp tốc độ render rất nhanh.
- **Thư viện UI/UX**: **Tailwind CSS v4**. Xây dựng theo thiết kế tĩnh kiểu Glassmorphism (hiệu ứng kính mờ), tông màu tối cao cấp kết hợp với Gold/Amber sang trọng, phù hợp cho lĩnh vực phong thủy. Lấy icon từ `lucide-react`.
- **Nhiệm vụ**: Thu thập Input của người dùng trong thời gian thực, giao tiếp với API Backend qua Axios và hiển thị ra các kết quả (Sim + Box giải thích Explainable AI).

### 2. Backend (Máy chủ xử lý AI & Business Logic)
- **Ngôn ngữ & Framework**: **Node.js** kết hợp với **Express.js**. Đây là một framework RESTful API gọn nhẹ, hiệu năng cao và có thể tiếp nhận nhiều lượt request.
- **Thuật toán AI Scoring (Cốt lõi)**: AI tính điểm mức độ phù hợp (Suitability Score) bằng các trọng số đa chiều (W1, W2, W3).
  - Tích hợp logic tìm kiếm sim theo chuỗi số may mắn hoặc thông tin năm sinh.
  - Tính điểm Phong Thủy theo định luật Ngũ Hành và Điểm Hệ Nút Cơ Bản.
  - Cho ra tính năng **Explainable AI (AI có khả năng giải thích)**: Chỉ rõ cho người dùng vì sao thuật toán lại đẩy số SIM này lên đầu tiên.

### 3. Database (Cơ sở dữ liệu)
- **Hệ quản trị**: **MySQL Server**.
- **Nhiệm vụ**: Lưu trữ thông tin có cấu trúc của lượng lớn dữ liệu kho Sim (Bao gồm số điện thoại, giá tiền, nhà mạng, phân loại sim, trạng thái kho).
- **Thư viện kết nối**: `mysql2` trong Node.js, sử dụng mô hình Connection Pool để tăng tốc query.

---

## Công cụ sử dụng (Tools)

Để phục vụ lập trình, gỡ lỗi và quản lý dự án, những công cụ sau đã được sử dụng:
- **Tạo và Quản lý RESTful API**: Node.js + Postman/Trình duyệt web.
- **Hệ quản trị CSDL MySQL**: Sử dụng qua trình chạy Localhost ảo như DBeaver, XAMPP hoặc Laragon (với username `root` cơ bản).
- **Trình chỉnh sửa mã (Code Editor)**: VS Code / Cursor tích hợp cùng trí tuệ nhân tạo (AI Agent).
- **Quản lý mã nguồn**: Git và GitHub (`minhthuttc/KHOA_LUAN`).

---

## Hướng dẫn cài đặt và chạy hệ thống

### Bước 1: Khởi tạo dữ liệu (Database)
- Đảm bảo MySQL Server đang chạy (Service hoặc qua Laragon/XAMPP).
- Sử dụng công cụ tương tác MySQL để chạy nội dung file `init-db.sql` được đặt ở thư mục gốc, hệ thống sẽ tự sinh ra DB `ai_sim_db` cùng danh sách SIM mẫu.
- (Hoặc) Chuyển vào thư mục `backend/` và chạy `node seed.js` để tự động kích hoạt.

### Bước 2: Chạy Backend App (API Server)
Mở một cửa sổ Terminal (dòng lệnh) và điều hướng vào thư mục backend, khởi chạy server:
```bash
cd backend
node index.js
```
*Server chạy thành công sẽ thông báo lắng nghe tại `http://localhost:5000`.*

### Bước 3: Chạy Frontend App (Giao diện Next.js)
Mở cửa sổ Terminal thứ hai và điều hướng vào thư mục frontend:
```bash
cd frontend
npm run dev
```
*Giao diện người dùng sẽ chạy tại `http://localhost:3000`.* Bạn chỉ cần truy cập vào đường link này bằng trình duyệt để trải nghiệm tính năng Gợi ý Sim AI.
