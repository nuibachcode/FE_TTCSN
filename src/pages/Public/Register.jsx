import React, { useState } from "react";
import LoginRegisterLayout from "../../layout/LoginRegisterLayout";
import "./Register.css"; // Đảm bảo bạn đã có file css này
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";

const Register = () => {
  const navigate = useNavigate();

  // 1. Khởi tạo State khớp 100% với userServices.js
  const [userData, setUserData] = useState({
    fullName: "",
    account: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "", // Cái này chỉ dùng để check ở frontend
    address: "",
  });

  // 2. Hàm cập nhật input
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // 3. Xử lý Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();

    // -- Validate dữ liệu --
    if (
      !userData.email ||
      !userData.password ||
      !userData.account ||
      !userData.fullName ||
      !userData.phone
    ) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      // -- Chuẩn bị dữ liệu gửi đi --
      // Loại bỏ confirmPassword vì backend không cần
      const { confirmPassword, ...dataToSend } = userData;

      console.log("Dữ liệu gửi đi:", dataToSend); // Bật F12 xem log này

      // -- Gọi API --
      // URL dựa trên file api.js: router.post("/users", createNewUser);
      const response = await axios.post(
        `${API_URL}/api/users`,
        dataToSend
      );

      if (response.data && response.data.EC === 0) {
        alert("Đăng ký thành công! Hãy đăng nhập ngay.");
        navigate("/account/login"); // Chuyển hướng về trang Login
      } else {
        // Hiện lỗi từ Backend trả về (ví dụ: "Email đã tồn tại")
        alert(response.data.EM);
      }
    } catch (error) {
      if (error.response) {
        console.log("Server trả lỗi:", error.response.data);
        alert(error.response.data.EM || "Có lỗi xảy ra từ phía server");
      } else {
        console.error("Lỗi mạng:", error);
        alert(
          "Không thể kết nối đến server (Kiểm tra lại Backend đã chạy chưa)"
        );
      }
    }
  };

  return (
    <LoginRegisterLayout>
      <h2 className="text-center text-primary mb-4">ĐĂNG KÝ</h2>
      <form className="register-form" onSubmit={handleRegister}>
        {/* Họ và tên (fullName) */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-person-fill"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Họ và tên"
            name="fullName"
            value={userData.fullName}
            onChange={handleChange}
          />
        </div>

        {/* Tài khoản (account) */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-person-badge-fill"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tài khoản"
            name="account"
            value={userData.account}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-envelope-fill"></i>
          </span>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            name="email"
            value={userData.email}
            onChange={handleChange}
          />
        </div>

        {/* Số điện thoại (phone) */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-telephone-fill"></i>
          </span>
          <input
            type="tel"
            className="form-control"
            placeholder="Số điện thoại"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Mật khẩu (password) */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-lock-fill"></i>
          </span>
          <input
            type="password"
            className="form-control"
            placeholder="Mật khẩu"
            name="password"
            value={userData.password}
            onChange={handleChange}
          />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-lock-fill"></i>
          </span>
          <input
            type="password"
            className="form-control"
            placeholder="Xác nhận mật khẩu"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Địa chỉ (address) */}
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-geo-alt-fill"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Địa chỉ"
            name="address"
            value={userData.address}
            onChange={handleChange}
          />
        </div>

        {/* Nút đăng ký */}
        <button type="submit" className="btn-register">
          ĐĂNG KÝ
        </button>

        <Link
          to="/account/login"
          className="btn w-100 mt-3 text-white shadow text-decoration-none"
          style={{
            background: "linear-gradient(135deg, #00aaff, #0cbe44ff)",
            borderRadius: "50px",
            padding: "10px",
          }}
        >
          QUAY LẠI ĐĂNG NHẬP
        </Link>
      </form>
    </LoginRegisterLayout>
  );
};

export default Register;
