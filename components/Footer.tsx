import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SmartHome Store</h3>
            <p className="text-sm text-muted-foreground">
              Chuyên cung cấp robot hút bụi và thiết bị gia dụng thông minh cao
              cấp
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Sản Phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=robot-vacuum"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-robot-vacuum"
                >
                  Robot Hút Bụi
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smart-device"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-smart-device"
                >
                  Thiết Bị Thông Minh
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Hotline: 1900-xxxx</li>
              <li className="text-muted-foreground">
                Email: support@smarthome.vn
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Giờ Làm Việc</h4>
            <p className="text-sm text-muted-foreground">
              Thứ 2 - Thứ 6: 8:00 - 18:00
              <br />
              Thứ 7: 8:00 - 17:00
              <br />
              Chủ Nhật: Nghỉ
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 SmartHome Store. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
