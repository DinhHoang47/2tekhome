import { NextResponse } from "next/server";
import type { Product } from "@/shared/schema";

const products: Product[] = [
  {
    id: "1",
    name: "Robot hút bụi Xiaomi X10",
    description:
      "Robot hút bụi thông minh với khả năng tự động đổ rác, lập bản đồ và điều khiển qua ứng dụng.",
    price: "8990000.00",
    category: "robot-vacuum",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5475/306286/robot-hut-bui-xiaomi-x10-pro-ultra-den-1-1.jpg",
    specifications: {
      Công_suất: "55W",
      Dung_lượng_pin: "5200 mAh",
      Diện_tích_làm_sạch: "200 m²",
    },
    stock: 20,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Robot hút bụi Ecovacs Deebot T20 Omni",
    description:
      "Robot hút bụi và lau nhà 2 trong 1, hệ thống làm sạch thông minh và tự động rửa giẻ lau.",
    price: "15990000.00",
    category: "robot-vacuum",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5475/308178/robot-hut-bui-ecovacs-deebot-t20-omni-trang-1-1.jpg",
    specifications: {
      Công_suất: "60W",
      Dung_lượng_pin: "5200 mAh",
      Tính_năng: "Tự giặt khăn, tự đổ rác",
    },
    stock: 10,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Máy lọc không khí Xiaomi Air Purifier 4 Pro",
    description:
      "Lọc bụi mịn PM2.5, kết nối thông minh với ứng dụng Mi Home, diện tích phòng lên đến 48 m².",
    price: "4990000.00",
    category: "smart-device",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5473/272258/may-loc-khong-khi-xiaomi-air-purifier-4-pro-1-1.jpg",
    specifications: {
      Công_suất: "45W",
      Độ_ồn: "33-64 dB",
      Bộ_lọc: "HEPA ba lớp",
    },
    stock: 15,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Đèn thông minh Yeelight Smart LED Bulb",
    description:
      "Đèn LED đổi màu thông minh điều khiển bằng giọng nói, hỗ trợ Google Assistant và Alexa.",
    price: "390000.00",
    category: "smart-device",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5472/272288/den-thong-minh-yeelight-smart-led-bulb-1-1.jpg",
    specifications: {
      Công_suất: "10W",
      Màu_sắc: "16 triệu màu",
      Kết_nối: "Wi-Fi / Bluetooth",
    },
    stock: 100,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Robot hút bụi Dreame L20 Ultra",
    description:
      "Robot hút bụi cao cấp với hệ thống lau xoay kép, tự nâng giẻ và trạm sạc thông minh.",
    price: "18990000.00",
    category: "robot-vacuum",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5475/309996/robot-hut-bui-dreame-l20-ultra-den-1-1.jpg",
    specifications: {
      Công_suất: "60W",
      Tính_năng: "Tự giặt, tự sấy khăn, tự đổ rác",
    },
    stock: 5,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Ổ cắm thông minh Xiaomi Smart Plug 2",
    description:
      "Điều khiển thiết bị từ xa qua app, hẹn giờ bật/tắt, theo dõi điện năng tiêu thụ.",
    price: "290000.00",
    category: "smart-device",
    imageUrl:
      "https://cdn.tgdd.vn/Products/Images/5474/304665/o-cam-thong-minh-xiaomi-smart-plug-2-1-1.jpg",
    specifications: {
      Công_suất_tối_đa: "2200W",
      Kết_nối: "Wi-Fi 2.4GHz",
      Tương_thích: "Mi Home / Google Home / Alexa",
    },
    stock: 50,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET() {
  return NextResponse.json(products);
}
