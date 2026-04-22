# CÔNG NGHỆ VÀ CÔNG CỤ SỬ DỤNG

## Dự án: MINHTHUSIM - Hệ thống gợi ý Sim số đẹp bằng AI

**Sinh viên thực hiện:** 110122174_NGUYENVOMINHTHU

---

## 1. FRONTEND

### Framework & Libraries
- **Next.js 16.2.2** - React Framework với Server-Side Rendering
- **React 19.2.4** - Thư viện UI hiện đại
- **Tailwind CSS 4** - Framework CSS utility-first
- **Axios** - HTTP Client để gọi API
- **Lucide React** - Thư viện icon SVG

### Tính năng Frontend
- Responsive Design (tương thích mọi thiết bị)
- Server-Side Rendering (SSR) cho SEO tốt hơn
- Client-Side Navigation mượt mà
- Component-based Architecture

---

## 2. BACKEND & DATABASE

### Backend
- **Node.js** - JavaScript Runtime Environment
- **Express.js 5.2.1** - Web Framework cho Node.js
- **CORS** - Xử lý Cross-Origin Resource Sharing
- **dotenv** - Quản lý biến môi trường

### Database
- **MySQL 8.0** - Hệ quản trị cơ sở dữ liệu quan hệ
- **MySQL2 3.20.0** - Driver kết nối MySQL cho Node.js
- **Connection Pooling** - Tối ưu hiệu năng kết nối database

### Cấu trúc Database
```sql
Table: sim_cards
- id (INT, PRIMARY KEY)
- sim_number (VARCHAR)
- network (VARCHAR) - Nhà mạng
- price (DECIMAL)
- category (VARCHAR) - Loại sim
- total_nodes (INT) - Tổng nút phong thủy
- status (VARCHAR) - Trạng thái
```

---

## 3. THUẬT TOÁN AI

### Công thức tính điểm Sim

```
S = w1 × P + w2 × I + w3 × B
```

**Trong đó:**

#### S (Suitability Score)
- Điểm phù hợp tổng thể của số sim đối với người dùng
- Thang điểm: 0-10

#### P (Feng Shui Point) - Điểm Phong Thủy
- Thang điểm: 0-10
- Tính toán dựa trên:
  - **Ngũ hành tương sinh, tương khắc**
    - Ngũ hành trùng bản mệnh: +5 điểm
    - Ngũ hành tương sinh: +3 điểm
  - **Quẻ dịch**
  - **Tổng số nút** (total_nodes)
    - Tổng nút > 7: +2 điểm
    - Mỗi nút: +1 điểm
  - **Loại sim đặc biệt**
    - Sim thần tài: +2 điểm
    - Sim lộc phát: +2 điểm

#### I (Interest Point) - Điểm Sở thích
- Thang điểm: 0-10
- Phản ánh mức độ trùng khớp với:
  - **Ngày sinh**: Sim chứa 4 số cuối năm sinh: +10 điểm
  - **Số may mắn**: Mỗi số may mắn trùng: +2 điểm
  - **Ngày kỷ niệm**: Sim chứa ngày/tháng kỷ niệm: +5 điểm

#### B (Behavior Point) - Điểm Hành vi
- Thang điểm: 0-10
- AI chấm dựa trên:
  - Lịch sử tìm kiếm
  - Loại sim thường quan tâm (Tam hoa, Tứ quý, Lộc phát...)
  - Hành vi người dùng trên hệ thống

#### Trọng số (Weights)
- **w1 = 0.5** (Phong thủy - 50%)
- **w2 = 0.4** (Sở thích - 40%)
- **w3 = 0.1** (Hành vi - 10%)
- **Tổng: w1 + w2 + w3 = 1**

### Explainable AI
Hệ thống cung cấp giải thích chi tiết cho mỗi gợi ý:
- Lý do sim được chọn
- Điểm số từng tiêu chí
- Các yếu tố phong thủy phù hợp

---

## 4. KIẾN TRÚC HỆ THỐNG

### Architecture Pattern
- **Client-Server Architecture**
- **RESTful API Design**
- **MVC Pattern** (Model-View-Controller)

### API Endpoints

#### 1. POST /api/recommend
Gợi ý sim dựa trên thông tin người dùng
```json
Request:
{
  "birthDate": "1995-03-12",
  "luckyNumbers": ["39", "79", "68"],
  "priceLimit": 5000000,
  "expectedNetwork": "Viettel"
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sim_number": "0987654321",
      "network": "Viettel",
      "price": 3500000,
      "fengShuiPoint": 8,
      "interestPoint": 7,
      "behaviorPoint": 6,
      "suitabilityScore": 7.5,
      "explainableAI": [
        "Điểm nút sim là 8/10",
        "Sim chứa 2 con số may mắn của bạn"
      ]
    }
  ]
}
```

#### 2. GET /api/sims
Lấy danh sách tất cả sim
```json
Response:
{
  "success": true,
  "data": [...]
}
```

---

## 5. TÍNH NĂNG NỔI BẬT

### Bộ lọc thông minh
- Lọc theo nhà mạng (Viettel, Vinaphone, Mobifone)
- Lọc theo loại sim (Tam hoa, Tứ quý, Thần tài, Lộc phát)
- Lọc theo khoảng giá tùy chỉnh
- Tìm kiếm số đặc biệt (ngày sinh, số may mắn)
- Tìm theo ngày kỷ niệm

### Phân tích phong thủy
- Tính toán Ngũ hành tự động
- Phân tích tổng số nút
- Đánh giá Quẻ dịch
- Gợi ý sim phù hợp bản mệnh

### Cá nhân hóa
- Gợi ý dựa trên ngày sinh
- Tìm sim chứa số may mắn
- Học hành vi người dùng
- Điều chỉnh trọng số linh hoạt

---

## 6. BẢO MẬT & HIỆU NĂNG

### Bảo mật
- **Environment Variables (.env)** - Bảo vệ thông tin nhạy cảm
- **SQL Injection Prevention** - Sử dụng Prepared Statements
- **CORS Configuration** - Kiểm soát truy cập API
- **Input Validation** - Kiểm tra dữ liệu đầu vào

### Hiệu năng
- **Database Connection Pooling** - Tối ưu kết nối database
- **Query Optimization** - Tối ưu câu truy vấn SQL
- **Caching Strategy** - Lưu cache kết quả
- **Lazy Loading** - Tải dữ liệu theo nhu cầu

---

## 7. DEPLOYMENT & DEVELOPMENT

### Development Tools
- **Git** - Version Control System
- **VS Code / Kiro IDE** - Code Editor
- **Postman** - API Testing
- **MySQL Workbench** - Database Management

### Environment Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
node index.js
```

### Environment Variables (.env)
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_sim_db
PORT=5000
```

---

## 8. TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express.js 5 |
| Database | MySQL 8.0 |
| AI/Algorithm | Custom Weighted Scoring System |
| API | RESTful API |
| Security | CORS, Environment Variables, SQL Prevention |
| Performance | Connection Pooling, Query Optimization |

---

## 9. FUTURE ENHANCEMENTS

### Planned Features
- Machine Learning model cho Behavior Point
- Real-time recommendation
- User authentication & profile
- Payment integration
- Admin dashboard
- Mobile app (React Native)

### AI Improvements
- Deep Learning cho phân tích phong thủy
- Collaborative Filtering
- A/B Testing cho trọng số
- Sentiment Analysis từ feedback

---

**Phát triển bởi:** 110122174_NGUYENVOMINHTHU  
**Ngày tạo:** 2025  
**Công nghệ:** Next.js + Node.js + MySQL + AI Algorithm
