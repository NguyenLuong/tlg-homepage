---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/brainstorming/brainstorming-session-2026-02-03.md
date: 2026-02-04
author: Luong
status: complete
---

# Product Brief: TLG Homepage

## 1. Tổng quan Dự án (Project Overview)

**Tên dự án:** TLG Homepage  
**Ngày tạo:** 2026-02-04  
**Người tạo:** Luong  

### Mô tả ngắn gọn
Xây dựng trang web giới thiệu (Homepage) cho công ty **TLG** - công ty chuyên cung cấp dịch vụ giới thiệu nhân lực nước ngoài cho thị trường Nhật Bản. Trang web nhằm mục đích xây dựng niềm tin với đối tác Nhật Bản và thu hút người lao động tiềm năng.

---

## 2. Tầm nhìn & Vấn đề cần giải quyết (Vision & Problem Statement)

### Vấn đề hiện tại
- Công ty TLG cần một kênh trực tuyến chuyên nghiệp để giới thiệu dịch vụ và năng lực.
- Người lao động cần một nơi đáng tin cậy để tìm kiếm cơ hội việc làm tại Nhật Bản.
- Đối tác Nhật Bản cần xác minh uy tín và năng lực của công ty trước khi hợp tác.

### Tầm nhìn sản phẩm
Tạo ra một trang web chuyên nghiệp, đa ngôn ngữ (Tiếng Việt/Tiếng Nhật), đáp ứng mượt mà trên mọi thiết bị, giúp:
- **Xây dựng niềm tin (Trust)** thông qua thông tin minh bạch về công ty, thành tựu và đối tác.
- **Thu hút ứng viên (Conversion)** thông qua hiển thị tin tuyển dụng hấp dẫn.
- **Duy trì kết nối (Engagement)** thông qua tin tức cập nhật liên tục.

### Giá trị độc đáo (Unique Value Proposition)
Một cửa ngõ số hóa chuyên nghiệp kết nối người lao động Việt Nam với cơ hội việc làm tại Nhật Bản, được hỗ trợ bởi giao diện song ngữ và CMS đơn giản cho quản trị viên.

---

## 3. Đối tượng Người dùng (Target Users)

### Persona 1: Người lao động Việt Nam
- **Đặc điểm:** Thanh niên (18-35 tuổi), muốn tìm việc tại Nhật Bản, thường dùng điện thoại di động.
- **Nhu cầu:** Tìm kiếm cơ hội việc làm uy tín, thông tin rõ ràng về lương, địa điểm, đãi ngộ.
- **Nỗi lo:** Sợ bị lừa đảo, chi phí ẩn, không rõ quy trình.
- **Hành trình:** Truy cập trang chủ → Xem tin tuyển dụng nổi bật → Click xem chi tiết → Liên hệ/Nộp hồ sơ.

### Persona 2: Đối tác/Doanh nghiệp Nhật Bản
- **Đặc điểm:** Quản lý nhân sự tại các công ty Nhật, thường dùng PC/Tablet, cần nội dung tiếng Nhật.
- **Nhu cầu:** Tìm đối tác cung ứng nhân lực uy tín, xác minh năng lực và thành tựu của TLG.
- **Hành trình:** Truy cập trang chủ (JP) → Xem giới thiệu công ty → Xem thành tựu & đối tác → Liên hệ.

### Persona 3: Quản trị viên (Admin)
- **Đặc điểm:** Nhân viên TLG quản lý nội dung website.
- **Nhu cầu:** Đăng/chỉnh sửa/xóa tin tuyển dụng và tin tức một cách dễ dàng, sắp xếp thứ tự hiển thị.
- **Hành trình:** Đăng nhập Admin → Quản lý tin tuyển dụng/tin tức → Lưu & Xuất bản.

---

## 4. Phạm vi MVP (MVP Scope)

### Trong phạm vi (In Scope)

#### A. Trang Người dùng (Public Website)

| Section | Mô tả | Chi tiết |
|---------|-------|----------|
| **Header** | Điều hướng chính | Logo TLG, Menu (Trang chủ, Về chúng tôi, Tin tức, Tuyển dụng, Liên hệ), Nút chuyển đổi ngôn ngữ VI/JP |
| **Hero Section** | Ấn tượng đầu tiên | Banner lớn + Slogan công ty |
| **Giới thiệu công ty** | Xây dựng niềm tin | Thông tin cơ bản về TLG |
| **Thành tựu & Đối tác** | Social Proof | Các hợp đồng đã ký kết, Logo đối tác chiến lược |
| **Tin tức** | Cập nhật hoạt động | Hiển thị dạng danh sách (List), mỗi dòng là link tiêu đề, click → trang chi tiết tin tức |
| **Tuyển dụng** | Chức năng cốt lõi | Hiển thị tối đa 3 Job Cards (Ảnh, Tiêu đề, Địa điểm, Lương, Đãi ngộ), Nút "Xem thêm" → danh sách đầy đủ |
| **Footer** | Thông tin bổ sung | Mục About Us tóm tắt, Thông tin liên hệ, Icon Social Links (Facebook, Zalo, LinkedIn...), Copyright |

#### B. Trang Chi tiết

| Trang | Mô tả |
|-------|-------|
| **Chi tiết Tin tức** | Hiển thị nội dung đầy đủ của bài tin tức |
| **Chi tiết Tuyển dụng** | Hiển thị đầy đủ thông tin việc làm: mô tả chi tiết, yêu cầu, quyền lợi, quy trình ứng tuyển |
| **Danh sách Tuyển dụng** | Trang hiển thị tất cả tin tuyển dụng (khi click "Xem thêm") |

#### C. Trang Admin (CMS)

| Chức năng | Mô tả | Trường dữ liệu |
|-----------|-------|----------------|
| **Quản lý Tin tuyển dụng** | CRUD (Tạo, Đọc, Sửa, Xóa) | Tiêu đề, Ảnh đại diện, Tỉnh làm việc (Nhật), Mức lương, Đãi ngộ tóm tắt, Nội dung chi tiết, Trạng thái hiển thị, Thứ tự hiển thị |
| **Quản lý Tin tức** | CRUD | Tiêu đề, Nội dung, Ngày đăng, Ảnh thumbnail (tùy chọn), Trạng thái hiển thị |

#### D. Yêu cầu Phi chức năng

| Yêu cầu | Mô tả |
|---------|-------|
| **Responsive Design** | Mobile-First, hoạt động mượt mà trên điện thoại và máy tính |
| **Đa ngôn ngữ** | Hỗ trợ Tiếng Việt và Tiếng Nhật, chuyển đổi qua Header |
| **SEO cơ bản** | Meta tags, tiêu đề trang chuẩn SEO |

### Ngoài phạm vi MVP (Out of Scope)

- ❌ Hệ thống nộp hồ sơ trực tuyến (Online Application Form)
- ❌ Tài khoản người dùng / Đăng ký / Đăng nhập cho ứng viên
- ❌ Tracking lượt xem, thống kê, phân tích hành vi người dùng
- ❌ Tích hợp thanh toán
- ❌ Chat trực tuyến / Chatbot
- ❌ Tìm kiếm nâng cao / Lọc việc làm

---

## 5. Các tính năng nâng cao từ Brainstorming (Nice-to-have)

Các ý tưởng từ phiên SCAMPER có thể xem xét cho phiên bản sau:

| Ý tưởng | Mô tả | Ưu tiên |
|---------|-------|---------|
| **Icon phân loại tin tức** | Thay bullet bằng icon (✈️ xuất cảnh, 🤝 ký kết, 📢 thông báo) | Thấp |
| **Badge Hot/Gấp trên Job Card** | Huy hiệu tạo sự khẩn cấp | Trung bình |
| **Quy đổi lương VNĐ** | Hiển thị mức lương quy đổi sang VNĐ | Trung bình |

---

## 6. Luồng Người dùng Chính (User Flow)

```
[Truy cập trang chủ]
        │
        ▼
┌───────────────────┐
│     HEADER        │ ← Logo, Menu, Language Switch (VI/JP)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   HERO SECTION    │ ← Banner + Slogan
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  GIỚI THIỆU TLG   │ ← Thông tin cơ bản + Thành tựu + Đối tác
└───────────────────┘
        │
        ▼
┌───────────────────┐
│     TIN TỨC       │ ← Danh sách tiêu đề (click → chi tiết)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   TUYỂN DỤNG      │ ← 3 Job Cards + Nút "Xem thêm"
│                   │   (click card → chi tiết việc làm)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│     FOOTER        │ ← About Us, Liên hệ, Social Links
└───────────────────┘
```

---

## 7. Tiêu chí Thành công (Success Criteria)

| Tiêu chí | Mô tả |
|----------|-------|
| **Hoàn thành chức năng** | Tất cả các section trên Homepage hiển thị đúng, điều hướng hoạt động |
| **Responsive** | Giao diện hiển thị tốt trên mobile (iPhone, Android) và desktop |
| **Đa ngôn ngữ** | Chuyển đổi VI/JP hoạt động cho các nội dung tĩnh |
| **Admin CMS** | Admin có thể đăng/sửa/xóa tin tuyển dụng và tin tức dễ dàng |
| **Hiệu suất** | Trang tải nhanh, không lỗi console nghiêm trọng |

---

## 8. Tài liệu Tham khảo

- [Brainstorming Session](../brainstorming/brainstorming-session-2026-02-03.md) - Phiên brainstorm gốc sử dụng Mind Mapping & SCAMPER
