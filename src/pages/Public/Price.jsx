import React, { useState, useEffect } from "react";
import axios from "axios"; // 1. Import thư viện gọi API
import { API_URL } from "../../config";

export default function PricePage() {
  // 2. State lưu danh sách dịch vụ
  const [services, setServices] = useState([]);

  // 3. Gọi API khi trang load
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Thay đổi cổng 8081
      let res = await axios.get(`${API_URL}/api/services`);
      if (res && res.data && res.data.EC === 0) {
        setServices(res.data.DT);
      }
    } catch (error) {
      console.log("Lỗi lấy bảng giá:", error);
    }
  };

  // 4. Hàm format tiền tệ (VND)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div style={{ marginTop: "80px" }}>
      {/* Banner */}
      <section
        className="text-center text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#CFF4FC",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "250px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-5 fw-bold" style={{ color: "#000000b5" }}>
            Bảng giá dịch vụ
          </h1>
          <p style={{ color: "#000000a5", fontSize: "20px" }}>
            Minh bạch – Hợp lý – Cạnh tranh
          </p>
        </div>
      </section>

      {/* Price Table */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: "#3ec9c9ff" }}>
            Giá dịch vụ nha khoa
          </h2>
          <p className="text-muted">
            Cam kết giá niêm yết rõ ràng, không phát sinh thêm chi phí.
          </p>
        </div>

        <div className="table-responsive shadow rounded-4">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-info text-center">
              <tr>
                <th style={{ width: "40%" }}>Dịch vụ</th>
                <th style={{ width: "20%" }}>Giá niêm yết</th>
                <th style={{ width: "40%" }}>Thông tin chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {services && services.length > 0 ? (
                services.map((item, index) => (
                  <tr key={item.id || index}>
                    {/* Tên dịch vụ */}
                    <td className="fw-semibold text-primary">
                      {item.nameService}
                      {/* Hiển thị thêm badge chuyên khoa nếu có */}
                      {item.Specialty && (
                        <div className="mt-1">
                          <span className="badge bg-light text-secondary border">
                            {item.Specialty.nameSpecialty}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Giá tiền */}
                    <td className="text-center fw-bold text-danger fs-5">
                      {item.price ? formatCurrency(item.price) : "Liên hệ"}
                    </td>

                    {/* Ghi chú / Mô tả */}
                    <td className="text-muted small">
                      {/* Cắt ngắn mô tả nếu dài quá để bảng đỡ bị vỡ */}
                      {item.description.length > 100
                        ? item.description.substring(0, 100) + "..."
                        : item.description}
                      <div className="mt-1">
                        <i className="far fa-clock me-1"></i>
                        Thời gian: {item.duration}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang cập nhật bảng giá...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
