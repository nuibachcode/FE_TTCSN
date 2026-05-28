import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import service1 from "../../assets/images/anhservice.png";
import service2 from "../../assets/images/anh_herodetail5.png";
import service3 from "../../assets/images/anh_herodetail6.png";
import service4 from "../../assets/images/anh_herodetail4.webp";

export default function ServicesDetail() {
  const [services, setServices] = useState([]);

  // Ảnh dùng cho Top 3 dịch vụ nổi bật
  const serviceImages = [service2, service3, service4];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      let res = await axios.get(`${API_URL}/api/services`);
      if (res && res.data && res.data.EC === 0) {
        setServices(res.data.DT);
      }
    } catch (error) {
      console.log("Lỗi lấy danh sách dịch vụ:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // TÁCH DỮ LIỆU
  const featuredServices = services.slice(0, 3); // 3 cái đầu có ảnh
  const otherServices = services.slice(3); // Những cái sau dạng danh sách

  return (
    <div style={{ marginTop: "80px" }}>
      <div style={{ backgroundColor: "#f8f9fa" }}>
        {/* --- 1. BANNER --- */}
        <section
          className="text-center text-white d-flex align-items-center justify-content-center"
          style={{
            backgroundImage: `url(${service1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "300px",
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          ></div>
          <div className="container position-relative" style={{ zIndex: 2 }}>
            <h1 className="display-4 fw-bold">
              Dịch vụ nha khoa chuyên nghiệp
            </h1>
            <p className="lead">
              Tận tâm – Hiện đại – Mang lại nụ cười tự tin cho bạn
            </p>
          </div>
        </section>

        <section className="container py-5">
          {/* --- 2. CÁC DỊCH VỤ NỔI BẬT (TOP 3 - CÓ ẢNH) --- */}
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#3ec9c9ff" }}>
              Các dịch vụ nổi bật
            </h2>
            <p className="text-muted">
              Công nghệ hiện đại, bác sĩ chuyên môn cao.
            </p>
          </div>

          {featuredServices &&
            featuredServices.map((item, index) => {
              let rowClass =
                index % 2 !== 0
                  ? "row align-items-center mb-5 flex-md-row-reverse"
                  : "row align-items-center mb-5";
              let imgDisplay = serviceImages[index % serviceImages.length];

              return (
                <div className={rowClass} key={item.id || index}>
                  <div className="col-md-6 mb-4 mb-md-0">
                    <img
                      src={imgDisplay}
                      alt={item.nameService}
                      className="img-fluid rounded-4 shadow"
                      style={{
                        width: "100%",
                        objectFit: "cover",
                        maxHeight: "350px",
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h3 className="fw-bold mb-3">{item.nameService}</h3>
                    {item.Specialty && (
                      <span className="badge bg-info mb-2">
                        {item.Specialty.nameSpecialty}
                      </span>
                    )}
                    <p
                      className="text-muted"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {item.description}
                    </p>
                    <ul className="list-unstyled mt-3">
                      <li className="mb-2">
                        <i className="fas fa-clock me-2 text-primary"></i>
                        <strong>Thời gian:</strong> {item.duration}
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-tag me-2 text-primary"></i>
                        <strong>Chi phí:</strong>{" "}
                        {item.price ? formatCurrency(item.price) : "Liên hệ"}
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}

          {/* --- 3. DANH SÁCH CÁC DỊCH VỤ KHÁC (KHÔNG ẢNH - LIST VIEW) --- */}
          {otherServices && otherServices.length > 0 && (
            <div className="mt-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-secondary">
                  Bảng giá dịch vụ khác
                </h3>
                <p className="text-muted">
                  Tham khảo thêm các dịch vụ chăm sóc toàn diện
                </p>
              </div>

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                  {otherServices.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4 border-bottom hover-bg-light transition"
                      style={{
                        backgroundColor: index % 2 === 0 ? "#fff" : "#fcfcfc",
                      }} // Tạo màu nền xen kẽ cho dễ nhìn
                    >
                      {/* Cột Tên & Mô tả ngắn */}
                      <div className="mb-3 mb-md-0" style={{ flex: 2 }}>
                        <h5 className="fw-bold text-primary mb-1">
                          {item.nameService}
                        </h5>
                        <p className="text-muted small mb-0">
                          {item.Specialty?.nameSpecialty && (
                            <span className="badge bg-light text-dark border me-2">
                              {item.Specialty.nameSpecialty}
                            </span>
                          )}
                          {item.description.length > 100
                            ? item.description.substring(0, 100) + "..."
                            : item.description}
                        </p>
                      </div>

                      {/* Cột Thời gian */}
                      <div
                        className="mb-3 mb-md-0 text-center px-4"
                        style={{ flex: 1 }}
                      >
                        <small className="text-muted d-block">Thời gian</small>
                        <span className="fw-semibold">
                          <i className="far fa-clock me-1"></i>
                          {item.duration}
                        </span>
                      </div>

                      {/* Cột Giá & Nút */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- 4. CAM KẾT --- */}
        <section className="bg-white py-5 text-center border-top">
          <div className="container">
            <h3 className="fw-bold mb-3" style={{ color: "#3ec9c9ff" }}>
              Cam kết của chúng tôi
            </h3>
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              {/* ... Nội dung cam kết (giữ nguyên) ... */}
              <div
                className="p-4 shadow rounded-3 bg-light"
                style={{ maxWidth: "300px" }}
              >
                <h5 className="fw-bold mb-2">
                  100% bác sĩ có chứng chỉ quốc tế
                </h5>
                <p className="text-muted small">
                  Được đào tạo chuyên sâu và cập nhật kỹ thuật tiên tiến.
                </p>
              </div>
              <div
                className="p-4 shadow rounded-3 bg-light"
                style={{ maxWidth: "300px" }}
              >
                <h5 className="fw-bold mb-2">Trang thiết bị hiện đại</h5>
                <p className="text-muted small">
                  Hệ thống máy X-quang, máy tẩy trắng, ghế nha khoa cao cấp.
                </p>
              </div>
              <div
                className="p-4 shadow rounded-3 bg-light"
                style={{ maxWidth: "300px" }}
              >
                <h5 className="fw-bold mb-2">Chính sách bảo hành rõ ràng</h5>
                <p className="text-muted small">
                  Khách hàng được theo dõi định kỳ và hỗ trợ miễn phí khi cần.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
