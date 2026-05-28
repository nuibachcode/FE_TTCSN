import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios"; // 1. Import Axios
import { API_URL } from "../../config";

const ChangePasswordModal = ({ show, onHide }) => {
  // State cho Form Đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", // Backend hiện tại chưa check cái này (cần nâng cấp sau), nhưng cứ để form cho đầy đủ
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Xử lý thay đổi input trong form mật khẩu
  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.id]: e.target.value });
    setPasswordStatus(null);
  };

  // Xử lý đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    const { newPassword, confirmPassword } = passwordForm;

    // --- VALIDATION LOGIC ---
    if (!newPassword || !confirmPassword) {
      setPasswordStatus({
        type: "danger",
        message: "Vui lòng điền mật khẩu mới và xác nhận mật khẩu.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "danger",
        message: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: "danger",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }
    // --- END VALIDATION ---

    try {
      // 2. Lấy thông tin User và Token từ LocalStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !user.id || !token) {
        setPasswordStatus({
          type: "danger",
          message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        return;
      }

      // 3. GỌI API THẬT
      // Gửi field "password" để khớp với logic mình vừa sửa ở userServices.js
      const res = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Kiểm tra phản hồi từ Server
      if (res.data && res.data.EC === 0) {
        setPasswordStatus({
          type: "success",
          message: "Mật khẩu đã được thay đổi thành công! 🔒",
        });

        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Đóng modal sau 1.5 giây
        setTimeout(() => {
          onHide();
          setPasswordStatus(null);
        }, 1500);
      } else {
        // Lỗi do Backend trả về (ví dụ: lỗi server)
        setPasswordStatus({
          type: "danger",
          message: res.data.EM || "Có lỗi xảy ra khi đổi mật khẩu.",
        });
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setPasswordStatus({
        type: "danger",
        message: "Lỗi kết nối Server. Vui lòng kiểm tra lại Backend.",
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-primary fw-bold">
          <i className="bi bi-key me-2"></i> Đổi Mật Khẩu
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {passwordStatus && (
          <Alert
            variant={passwordStatus.type}
            onClose={() => setPasswordStatus(null)}
            dismissible
          >
            {passwordStatus.message}
          </Alert>
        )}
        <Form onSubmit={handlePasswordSubmit}>
          {/* Mật khẩu hiện tại - Hiện tại chỉ để UI cho đẹp, cần backend check sau */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Mật khẩu hiện tại</Form.Label>
            <Form.Control
              type="password"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFormChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Xác nhận mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Group>

          <div className="d-grid mt-4">
            <Button variant="danger" type="submit">
              Lưu Mật Khẩu Mới
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
