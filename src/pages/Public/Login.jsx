// LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginRegisterLayout from "../../layout/LoginRegisterLayout";
import axios from "axios";
import { API_URL } from "../../config";
// import { toast } from "react-toastify";

const LoginPage = () => {
  // --- Khai báo State ---
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- Hàm xử lý Đăng nhập ---
  const handleLogin = async (event) => {
    event.preventDefault();

    // Validate cơ bản
    if (!account || !password) {
      alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }

    try {
      setIsLoading(true);

      // Gọi API
      const response = await axios.post(`${API_URL}/api/login`, {
        account: account,
        password: password,
      });

      const data = response.data;

      // Kiểm tra kết quả (EC = 0 là thành công)
      if (data && data.EC === 0) {
        // 1. Lưu thông tin user và token vào LocalStorage
        localStorage.setItem("token", data.DT.accessToken);
        localStorage.setItem("user", JSON.stringify(data.DT.user));

        // 2. Thông báo thành công
        alert(data.EM);

        // 3. ĐIỀU HƯỚNG THEO ROLE (Admin/Doctor/Patient)
        // Lấy roleId từ dữ liệu trả về
        const roleId = data.DT.user.roleId;

        if (roleId === 1) {
          // ADMIN -> Chuyển sang trang quản trị Admin
          navigate("/admin");
        } else if (roleId === 2) {
          // DOCTOR -> Chuyển sang trang quản lý của Bác sĩ
          navigate("/doctor");
        } else {
          // PATIENT (Bệnh nhân) -> Chuyển về trang chủ
          navigate("/");
        }

        // (Optional) Reload trang để cập nhật Header (nếu Header chưa tự nhận diện user mới login)
        // window.location.reload();
      } else {
        // Đăng nhập thất bại
        alert(data.EM);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginRegisterLayout>
      <h2 className="text-center text-primary mb-4">ĐĂNG NHẬP</h2>
      <form onSubmit={handleLogin}>
        {/* Email / Account */}
        <div className="mb-3 input-group shadow-sm rounded">
          <span className="input-group-text bg-primary text-white border-0">
            <i className="bi bi-person"></i>
          </span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Nhập email hoặc tài khoản"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>
        {/* Mật khẩu */}
        <div className="mb-3 input-group shadow-sm rounded">
          <span className="input-group-text bg-primary text-white border-0">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type="password"
            className="form-control border-0"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Ghi nhớ & quên mật khẩu */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="remember" />
            <label className="form-check-label" htmlFor="remember">
              Ghi nhớ
            </label>
          </div>
          <Link to="/account/forgot-password" className="text-decoration-none">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút đăng nhập */}
        <button
          type="submit"
          className="btn w-100 mb-3 text-white shadow"
          disabled={isLoading}
          style={{
            background: "linear-gradient(135deg, #00aaff, #5d1ec3ff)",
            borderRadius: "50px",
            padding: "10px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
        </button>
        <hr />

        {/* Nút đăng ký */}
        <Link
          to="/account/register"
          className="btn w-100 mt-3 text-white shadow text-decoration-none"
          style={{
            background: "linear-gradient(135deg, #00aaff, #0cbe44ff)",
            borderRadius: "50px",
            padding: "10px",
          }}
        >
          ĐĂNG KÝ
        </Link>
      </form>
    </LoginRegisterLayout>
  );
};

export default LoginPage;
