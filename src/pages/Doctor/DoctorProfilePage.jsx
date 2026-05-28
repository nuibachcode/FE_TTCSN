import React, { useState, useEffect } from "react";
import { Form, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    specialtyId: "",
    specialtyName: "",
    qualification: "", // lever
    description: "", // bio
  });

  const [specialties, setSpecialties] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      // Gọi song song API lấy Chuyên khoa và Thông tin Bác sĩ
      const [resSpec, resDoc] = await Promise.all([
        axios.get(`${API_URL}/api/specialties`),
        axios.get(`${API_URL}/api/doctor-info/${user.id}`),
      ]);

      if (resSpec.data.EC === 0) {
        setSpecialties(resSpec.data.DT);
      }

      // Load dữ liệu bác sĩ
      if (resDoc.data && resDoc.data.EC === 0 && resDoc.data.DT) {
        const data = resDoc.data.DT;
        const userInfo = data.User || {};
        const specialtyInfo = data.Specialty || {};

        setProfile({
          id: userInfo.id || user.id,
          fullName: userInfo.fullName || user.fullName || "",
          email: userInfo.email || user.email || "",
          phone: userInfo.phone || user.phone || "", // Ưu tiên lấy từ User trong DB
          address: userInfo.address || user.address || "",
          specialtyId: data.specialtyId || "",
          specialtyName: specialtyInfo.nameSpecialty || "Chưa cập nhật",
          qualification: data.lever || "",
          description: data.bio || "",
        });
      } else {
        // Trường hợp bác sĩ mới chưa có trong bảng DoctorInfo
        setProfile((prev) => ({
          ...prev,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
        }));
      }
    } catch (error) {
      console.log("Lỗi lấy dữ liệu:", error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Chặn reload trang
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Payload gửi lên Backend
      const payload = {
        doctorId: profile.id,
        specialtyId: profile.specialtyId,
        lever: profile.qualification,
        bio: profile.description,
        // Gửi thông tin cá nhân để update bảng User
        phone: profile.phone,
        address: profile.address,
        fullName: profile.fullName, // <--- QUAN TRỌNG: Gửi tên mới lên
      };

      console.log("Đang gửi dữ liệu:", payload); // Debug xem log có chạy không

      const res = await axios.put(
        `${API_URL}/api/doctor-info`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.EC === 0) {
        setStatus({ type: "success", msg: "Cập nhật thông tin thành công!" });
        setIsEditing(false);

        // Cập nhật lại localStorage để Header hiển thị tên mới ngay lập tức
        const oldUser = JSON.parse(localStorage.getItem("user"));
        const newUser = { ...oldUser, fullName: profile.fullName };
        localStorage.setItem("user", JSON.stringify(newUser));

        // Load lại dữ liệu từ server cho chắc
        fetchData();
      } else {
        setStatus({ type: "danger", msg: res.data.EM || "Có lỗi xảy ra" });
      }
    } catch (error) {
      console.log("Lỗi lưu:", error);
      setStatus({ type: "danger", msg: "Lỗi kết nối server" });
    }

    setIsLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-primary border-bottom pb-2">
        <i className="bi bi-person-gear me-2"></i> Quản lý Hồ sơ Bác sĩ
      </h3>

      {status && (
        <Alert variant={status.type} className="mb-4 shadow-sm">
          <i
            className={`bi ${
              status.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-triangle-fill"
            } me-2`}
          ></i>
          {status.msg}
        </Alert>
      )}

      <Card className="shadow border-0 rounded-4">
        <Card.Header className="bg-white fw-bold py-3 border-bottom text-uppercase text-secondary">
          Thông tin Cá nhân & Chuyên môn
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSave}>
            {/* Hàng 1: Tên & Email */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="fullName">
                  <Form.Label className="fw-semibold">Họ và Tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    readOnly={!isEditing} // Cho phép sửa khi bấm nút Sửa
                    className={!isEditing ? "bg-light" : ""}
                  />
                  {isEditing && (
                    <Form.Text className="text-muted small">
                      Bạn có thể đổi tên hiển thị.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Hàng 2: SĐT & Địa chỉ */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-light" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="address">
                  <Form.Label className="fw-semibold">
                    Địa chỉ liên hệ
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-light" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Hàng 3: Chuyên khoa & Học vị */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="specialtyId">
                  <Form.Label className="fw-semibold">Chuyên khoa</Form.Label>
                  {isEditing ? (
                    <Form.Select
                      name="specialtyId"
                      value={profile.specialtyId}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn chuyên khoa --</option>
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameSpecialty}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      value={profile.specialtyName}
                      readOnly
                      className="bg-light"
                    />
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="qualification">
                  <Form.Label className="fw-semibold">
                    Học vị / Chức danh
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="qualification"
                    value={profile.qualification}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-light" : ""}
                    placeholder="VD: Thạc sĩ, Bác sĩ Chuyên khoa I..."
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Bio */}
            <Form.Group controlId="description" className="mb-4">
              <Form.Label className="fw-semibold">
                Giới thiệu bản thân (Bio)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={profile.description}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-light" : ""}
              />
            </Form.Group>

            {/* Nút bấm */}
            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              {isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    style={{ height: "40px", marginTop: "15px" }}
                    onClick={() => {
                      setIsEditing(false);
                      fetchData(); // Hủy thì reset lại data cũ
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i> Hủy bỏ
                  </Button>
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i> Lưu Thay Đổi
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="warning" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil-square me-1"></i> Chỉnh Sửa Hồ Sơ
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfilePage;
