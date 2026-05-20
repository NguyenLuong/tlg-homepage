## TLG Homepage
This is home page of TLG Company

## Deploy lên production

Vercel build **không** tự chạy Prisma migrations (đã tách `prisma migrate deploy` khỏi `postinstall` để tránh timeout advisory lock qua Neon pooler). Mỗi lần deploy có migration mới, cần chạy thủ công bước migrate trước khi push code lên `main`.

### Quy trình deploy

1. **Apply migrations lên production DB** — chạy local, dùng URL **unpooled / direct connection** của Neon (endpoint **không** có hậu tố `-pooler`):

   ```bash
   DATABASE_URL="<prod-unpooled-url>" npm run db:deploy
   ```

   Lấy URL unpooled từ một trong các nguồn:
   - Vercel → Project → Settings → Environment Variables → `DATABASE_URL_UNPOOLED`
   - Neon dashboard → branch production → Connection string → chọn "Direct connection"

2. **(Tùy chọn) Kiểm tra trạng thái migrations** để chắc chắn không sót:

   ```bash
   DATABASE_URL="<prod-unpooled-url>" npx prisma migrate status
   ```

3. **Push code lên `main`**:

   ```bash
   git push origin main
   ```

   Vercel sẽ build và deploy. `postinstall` chỉ chạy `prisma generate`, không động vào DB.

### Lưu ý

- **Luôn migrate trước, deploy code sau** nếu migration có breaking change (drop column, rename, …) để tránh runtime error giữa lúc code mới đã chạy nhưng schema cũ chưa được cập nhật.
- **Không** dùng URL có `-pooler` cho `prisma migrate deploy` — pgBouncer/pooler không hỗ trợ Postgres advisory lock, sẽ timeout sau 10s với lỗi `P1002`.
- Script `db:deploy` đã được thêm vào `package.json` để rút gọn lệnh.