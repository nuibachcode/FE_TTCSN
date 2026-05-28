import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios"; // Nhớ import axios
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";

const PatientProfile = () => {
  const navigate = useNavigate();

  // State lưu dữ liệu user
  const [userData, setUserData] = useState({
    fullName: "",
    account: "",
    email: "",
    phone: "",
    address: "",
    gender: "", // Thêm nếu backend có trả về
  });

  const [initialData, setInitialData] = useState(userData); // Để chức năng Hủy hoạt động
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // State id của user để gọi API
  const [userId, setUserId] = useState(null);

  // --- 1. USE EFFECT: CHẠY 1 LẦN KHI VÀO TRANG ---
  useEffect(() => {
    // Lấy thông tin từ LocalStorage (đã lưu lúc Login)
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const userObj = JSON.parse(storedUser);
      setUserId(userObj.id); // Lưu ID để dùng cho nút Lưu sau này

      // Gọi API lấy dữ liệu mới nhất từ Database
      fetchUserProfile(userObj.id, token);
    } else {
      // Nếu chưa login thì đá về trang login
      navigate("/account/login");
    }
  }, []);

  // Hàm gọi API lấy thông tin
  const fetchUserProfile = async (id, token) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Gửi kèm Token để qua được protectedRoute
      });

      if (res.data && res.data.EC === 0) {
        // Backend trả về: fullName, email, account, address, phone...
        // Map dữ liệu từ backend vào state của frontend
        const dataFromDB = res.data.DT;
        const profileData = {
          fullName: dataFromDB.fullName || "",
          account: dataFromDB.account || "",
          email: dataFromDB.email || "",
          phone: dataFromDB.phone || "",
          address: dataFromDB.address || "",
          // Mapping thêm trường name cho khớp giao diện cũ của bạn
          name: dataFromDB.fullName || "",
          username: dataFromDB.account || "",
        };

        setUserData(profileData);
        setInitialData(profileData);
      } else {
        setStatus({
          type: "danger",
          message: "Không tải được thông tin người dùng",
        });
      }
    } catch (error) {
      console.log(error);
      setStatus({ type: "danger", message: "Lỗi kết nối server" });
    }
  };

  // --- 2. XỬ LÝ UPDATE ---
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  const handleEditClick = () => {
    setInitialData(userData);
    setIsEditing(true);
    setStatus(null);
  };

  const handleCancel = () => {
    setUserData(initialData);
    setIsEditing(false);
    setStatus(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Lấy token
    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    try {
      // Chuẩn bị dữ liệu update (Backend userController update nhận req.body)
      const dataToUpdate = {
        fullName: userData.name, // Input id="name" map vào fullName
        address: userData.address,
        phone: userData.phone,
        // Account và Email thường không cho sửa, backend sẽ tự bỏ qua hoặc user không sửa được
      };

      const res = await axios.put(
        `${API_URL}/api/users/${userId}`,
        dataToUpdate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.EC === 0) {
        setStatus({
          type: "success",
          message: "Cập nhật thông tin thành công! 🎉",
        });

        // Cập nhật lại LocalStorage để Header hiển thị đúng tên mới
        const oldUserStorage = JSON.parse(localStorage.getItem("user"));
        const newUserStorage = { ...oldUserStorage, fullName: userData.name };
        localStorage.setItem("user", JSON.stringify(newUserStorage));

        // Cập nhật state
        setInitialData(userData);
        setIsEditing(false);

        // Reload nhẹ trang hoặc dispatch event để Header cập nhật tên (Optional)
        window.dispatchEvent(new Event("storage"));
      } else {
        setStatus({
          type: "danger",
          message: res.data.EM || "Cập nhật thất bại",
        });
      }
    } catch (error) {
      console.log(error);
      setStatus({ type: "danger", message: "Lỗi khi cập nhật thông tin" });
    }
  };

  return (
    <Container className="my-5 pt-5">
      <h1 className="text-primary fw-bold mb-4">
        <i className="bi bi-person-circle me-2"></i> Hồ Sơ Cá Nhân
      </h1>

      {status && (
        <Alert
          variant={status.type}
          onClose={() => setStatus(null)}
          dismissible
        >
          {status.message}
        </Alert>
      )}

      <Card className="shadow-lg border-0">
        <Card.Body>
          <Form onSubmit={handleSave}>
            <Row>
              {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
              <Col md={6} className="border-end pe-md-4">
                <h4 className="mb-3 text-secondary">Thông tin Cơ bản</h4>

                {/* HỌ VÀ TÊN */}
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-person me-2"></i>Họ và Tên
                    </Form.Label>
                    <Form.Control
                      id="name" // Map với userData.name
                      value={userData.name || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Row>

                {/* SỐ ĐIỆN THOẠI */}
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-telephone me-2"></i>Số điện thoại
                    </Form.Label>
                    <Form.Control
                      id="phone"
                      value={userData.phone || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Row>

                {/* ĐỊA CHỈ */}
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-geo-alt me-2"></i>Địa chỉ
                    </Form.Label>
                    <Form.Control
                      id="address"
                      value={userData.address || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Row>
              </Col>

              {/* CỘT PHẢI: TÀI KHOẢN VÀ BẢO MẬT */}
              <Col md={6} className="ps-md-4">
                <h4 className="mb-3 text-secondary">Tài khoản & Bảo mật</h4>

                {/* USERNAME - KHÔNG CHO SỬA */}
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-at me-2"></i>Tên tài khoản
                    </Form.Label>
                    <Form.Control
                      id="username"
                      value={userData.username || ""}
                      disabled // Luôn disable
                      className="bg-light"
                    />
                  </Form.Group>
                </Row>

                {/* EMAIL - KHÔNG CHO SỬA */}
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-envelope me-2"></i>Email
                    </Form.Label>
                    <Form.Control
                      id="email"
                      value={userData.email || ""}
                      disabled
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Email và Tên tài khoản không thể thay đổi.
                    </Form.Text>
                  </Form.Group>
                </Row>

                {/* NÚT ĐỔI MẬT KHẨU */}
                <Row className="mb-3 pt-3">
                  <Col md="12">
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={() => setShowModal(true)}
                    >
                      <i className="bi bi-lock me-2"></i> Đổi Mật Khẩu
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>

            <hr className="my-4" />

            {/* Nút Hành động */}
            <div className="text-end mt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    className=" me-2"
                    style={{ marginTop: "15px" }}
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                  <Button variant="primary" type="submit">
                    <i className="bi bi-save me-2"></i> Lưu Thay Đổi
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleEditClick}>
                  <i className="bi bi-pencil-square me-2"></i> Chỉnh sửa Hồ sơ
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <ChangePasswordModal
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </Container>
  );
};

export default PatientProfile;
