import React, { useState, useEffect } from "react";
import axios from "axios"; // 1. Import Axios
import { API_URL } from "../../../config";

// Bỏ các import Dr_David_Lee... đi vì giờ lấy ảnh từ DB
import khachhang1 from "../../../assets/images/khachhang3.jpg";
import khachhang2 from "../../../assets/images/khachhang4.jpg";

export default function TeamAndTestimonials() {
  // 2. Tạo state lưu danh sách bác sĩ
  const [doctors, setDoctors] = useState([]);

  // 3. Gọi API khi component load
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      // Thay cổng 8080 bằng cổng backend thực tế của bạn
      let res = await axios.get(`${API_URL}/api/doctor-info`);
      if (res && res.data && res.data.EC === 0) {
        setDoctors(res.data.DT);
      }
    } catch (error) {
      console.log("Lỗi lấy data bác sĩ:", error);
    }
  };

  return (
    <section className="py-5 bg-light" id="team">
      <div className="container">
        {/* TIÊU ĐỀ */}
        <div className="text-center mb-5">
          <h2 className="fw-bold">Đội Ngũ Bác Sĩ</h2>
          <p className="text-muted">Chuyên môn cao – Tận tâm – Thân thiện</p>
        </div>

        {/* ĐỘI NGŨ BÁC SĨ - Render động từ DB */}
        <div className="row g-4 mb-5">
          {doctors && doctors.length > 0 ? (
            // Dùng slice(0, 3) để chỉ lấy 3 bác sĩ đầu tiên cho đẹp đội hình 3 cột
            doctors.slice(0, 3).map((doctor, index) => {
              let imageSrc = doctor.avatar
                ? doctor.avatar
                : "https://via.placeholder.com/150";

              return (
                <div
                  key={index}
                  className="col-md-4 d-flex flex-column align-items-center text-center"
                >
                  <img
                    src={imageSrc}
                    className="rounded-circle mb-3 shadow"
                    alt={doctor.User ? doctor.User.fullName : "Bác sĩ"}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  {/* Lấy tên từ bảng User */}
                  <h6 className="fw-bold mb-1">
                    {doctor.User ? doctor.User.fullName : "Bác sĩ"}
                  </h6>
                  {/* Lấy chuyên khoa từ bảng Specialty */}
                  <small className="text-muted">
                    {doctor.Specialty
                      ? doctor.Specialty.nameSpecialty
                      : "Chuyên khoa"}
                  </small>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted">
              Đang tải thông tin đội ngũ bác sĩ...
            </div>
          )}
        </div>

        <hr className="my-5" />

        {/* CẢM NHẬN KHÁCH HÀNG (Giữ nguyên phần tĩnh này) */}
        <div className="text-center mb-4">
          <h3 className="fw-bold">Khách Hàng Nói Gì?</h3>
          <p className="text-muted">
            Hơn 5000+ khách hàng đã tin tưởng lựa chọn
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
              <p className="mb-4 fst-italic">
                "Tôi rất ấn tượng với cách bác sĩ tư vấn và chăm sóc. Mọi thứ
                đều sạch sẽ và hiện đại!"
              </p>
              <div className="d-flex flex-column align-items-center">
                <img
                  src={khachhang2}
                  className="rounded shadow mb-3"
                  alt="Khách hàng 1"
                  style={{ width: "350px", objectFit: "cover" }}
                />
                <div className="text-center">
                  <h6 className="mb-0 fw-semibold">Nguyễn Thị Mai</h6>
                  <small className="text-muted">Khách hàng</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
              <p className="mb-4 fst-italic">
                "Lần đầu niềng răng nhưng không hề lo lắng, phòng khám hỗ trợ
                rất tận tâm, chi tiết!"
              </p>
              <div className="d-flex flex-column align-items-center">
                <img
                  src={khachhang1}
                  className="rounded shadow mb-3"
                  alt="Khách hàng 2"
                  style={{
                    width: "350px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
                <div className="text-center">
                  <h6 className="mb-0 fw-semibold">Trần Thanh Thảo</h6>
                  <small className="text-muted">Khách hàng</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
