import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);

  // State quản lý Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      let res = await axios.get(`${API_URL}/api/doctor-info`);

      if (res && res.data && res.data.EC === 0) {
        const rawData = res.data.DT;

        // --- XỬ LÝ LỌC TRÙNG LẶP ---
        // Sử dụng Map để lọc các bác sĩ có cùng ID (giả sử doctor.id là khóa chính)
        // Nếu trùng id, nó sẽ giữ lại người đầu tiên tìm thấy
        const uniqueDoctors = [
          ...new Map(rawData.map((item) => [item.id, item])).values(),
        ];

        setDoctors(uniqueDoctors);
      }
    } catch (error) {
      console.log("Lỗi lấy danh sách bác sĩ:", error);
    }
  };

  const handleViewDescription = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  return (
    <div
      className="doctor-page-container"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingBottom: "50px",
      }}
    >
      {/* Inject CSS Styles trực tiếp để tạo hiệu ứng Hover đẹp mắt */}
      <style>
        {`
          .doctor-card {
            transition: all 0.3s ease-in-out;
            border: none;
            border-radius: 15px;
            background: white;
            overflow: hidden;
          }
          .doctor-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
          }
          .btn-custom-primary {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border: none;
            color: white;
          }
          .btn-custom-primary:hover {
            background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
            color: white;
          }
          .modal-animation {
            animation: slideDown 0.4s ease-out;
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="container py-5">
        {/* Header Section */}
        <div className="text-center mb-5">
          <h2
            className="fw-bold"
            style={{ color: "#0056b3", fontSize: "2.5rem" }}
          >
            Đội Ngũ Chuyên Gia
          </h2>
          <div
            style={{
              width: "60px",
              height: "4px",
              backgroundColor: "#007bff",
              margin: "10px auto",
              borderRadius: "2px",
            }}
          ></div>
          <p
            className="text-muted fs-5 mt-3"
            style={{ maxWidth: "700px", margin: "0 auto" }}
          >
            Chúng tôi tự hào mang đến những bác sĩ tận tâm, giàu kinh nghiệm để
            chăm sóc sức khỏe toàn diện cho bạn và gia đình.
          </p>
        </div>

        <div className="row g-4">
          {doctors && doctors.length > 0 ? (
            doctors.map((doctor, index) => {
              let imageSrc = doctor.avatar
                ? doctor.avatar
                : "https://via.placeholder.com/300";
              let doctorName = doctor.User ? doctor.User.fullName : "Bác sĩ";
              let specialtyName = doctor.Specialty
                ? doctor.Specialty.nameSpecialty
                : "Chuyên khoa chung";

              return (
                <div key={index} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100 shadow-sm doctor-card">
                    {/* Phần ảnh */}
                    <div
                      style={{
                        overflow: "hidden",
                        height: "300px",
                        position: "relative",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={doctorName}
                        className="card-img-top w-100 h-100"
                        style={{
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "transform 0.5s ease",
                          objectPosition: "top center",
                        }}
                        onClick={() => handleViewDescription(doctor)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                    </div>

                    {/* Phần nội dung thẻ */}
                    <div className="card-body text-center d-flex flex-column">
                      <h5 className="card-title fw-bold text-dark mb-1">
                        {doctorName}
                      </h5>
                      <p className="card-text text-primary fw-medium mb-3">
                        {specialtyName}
                      </p>

                      <div className="mt-auto d-flex justify-content-center gap-3">
                        <a
                          href={`booking`}
                          className="btn btn-custom-primary px-4 py-2 rounded-pill shadow-sm"
                          style={{ textDecoration: "none" }}
                        >
                          Đặt lịch
                        </a>
                        <button
                          className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                          onClick={() => handleViewDescription(doctor)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted py-5">
              <h4>Hiện chưa có bác sĩ nào.</h4>
              <p>Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- PHẦN MODAL (POPUP) NÂNG CẤP --- */}
      {showModal && selectedDoctor && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div
            className="modal-animation"
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h4 className="fw-bold text-primary mb-0">
                {selectedDoctor.User?.fullName}
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="text-start">
              <div className="mb-3">
                <span className="badge bg-info text-dark fs-6">
                  {selectedDoctor.Specialty?.nameSpecialty || "Chuyên khoa"}
                </span>
              </div>

              <h6 className="fw-bold text-dark">Giới thiệu:</h6>
              <div
                className="bg-light p-3 rounded border"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  whiteSpace: "pre-line",
                  fontSize: "0.95rem",
                  color: "#555",
                }}
              >
                {selectedDoctor.bio || "Chưa có mô tả chi tiết về bác sĩ này."}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                className="btn btn-light text-secondary fw-bold"
                onClick={closeModal}
              >
                Đóng
              </button>
              <a
                href={`booking`}
                className="btn btn-primary px-4 fw-bold shadow-sm"
              >
                Đặt lịch ngay
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS in JS cho Modal Overlay
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Màu tối hơn chút để tập trung
    backdropFilter: "blur(4px)", // Hiệu ứng làm mờ nền đằng sau
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1050,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "16px", // Bo góc mềm mại hơn
    width: "90%",
    maxWidth: "550px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    position: "relative",
  },
};

export default Doctor;
