import React, { useState, useEffect, useMemo } from "react"; // 1. Thêm useMemo
import {
  Card,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Row,
  Col,
  Modal,
  Spinner,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";

// 2. Hàm hỗ trợ bỏ dấu Tiếng Việt (Để tìm "Đạt" khi gõ "dat")
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Một số bộ gõ kết hợp
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};

const DoctorManagementPage = () => {
  // --- STATE ---
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    specialtyId: "",
  });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- INIT DATA ---
  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lấy danh sách Bác sĩ
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.EC === 0) {
        const uniqueDoctors = [];
        const map = new Map();
        for (const item of res.data.DT) {
          if (!map.has(item.id)) {
            map.set(item.id, true);
            uniqueDoctors.push(item);
          }
        }
        uniqueDoctors.sort((a, b) => b.id - a.id);
        setDoctors(uniqueDoctors);
      }
    } catch (error) {
      console.log("Lỗi lấy ds bác sĩ:", error);
    }
    setIsLoading(false);
  };

  const fetchSpecialties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/specialties`);
      if (res.data.EC === 0) setSpecialties(res.data.DT);
    } catch (error) {
      console.log(error);
    }
  };

  // --- 3. THUẬT TOÁN TÌM KIẾM MỚI (TỐI ƯU) ---
  const filteredDoctors = useMemo(() => {
    // Nếu không có từ khóa, trả về toàn bộ danh sách (đỡ tốn công filter)
    if (!searchTerm) return doctors;

    const searchStr = removeVietnameseTones(searchTerm).toLowerCase();

    return doctors.filter((doc) => {
      // Chuẩn hóa dữ liệu bác sĩ để so sánh
      const name = removeVietnameseTones(doc.fullName || "").toLowerCase();
      const email = (doc.email || "").toLowerCase(); // Email thường không có dấu
      const phone = doc.phone || "";

      return (
        name.includes(searchStr) ||
        email.includes(searchStr) ||
        phone.includes(searchStr)
      );
    });
  }, [doctors, searchTerm]); // Chỉ chạy lại khi 'doctors' hoặc 'searchTerm' thay đổi

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // --- RENDER SỐ TRANG ---
  const renderPaginationItems = () => {
    let items = [];
    if (currentPage > 2) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (currentPage > 3)
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (
      let number = Math.max(1, currentPage - 1);
      number <= Math.min(totalPages, currentPage + 1);
      number++
    ) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2)
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    return items;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      id: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
      specialtyId: "",
    });
    setIsEditing(false);
  };

  const handleShowAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let res;
      if (isEditing) {
        alert("Chức năng cập nhật đang phát triển ở Backend!");
      } else {
        res = await axios.post(
          `${API_URL}/api/admin/doctors`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (res && res.data.EC === 0) {
        alert(isEditing ? "Cập nhật thành công!" : "Thêm bác sĩ thành công!");
        setShowModal(false);
        fetchDoctors();
      } else if (res) {
        alert(res.data.EM);
      }
    } catch (error) {
      console.log("Lỗi save:", error);
      alert("Lỗi hệ thống");
    }
  };

  // Avatar Component
  const AvatarCircle = ({ name }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "D";
    return (
      <div
        className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold me-3 shadow-sm"
        style={{ width: "45px", height: "45px", fontSize: "1.2rem" }}
      >
        {firstLetter}
      </div>
    );
  };

  return (
    <div className="doctor-management container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary fw-bold m-0">
            <i className="bi bi-people-fill me-2"></i>Quản Lý Đội Ngũ Bác Sĩ
          </h3>
          <p className="text-muted m-0 mt-1">
            Danh sách và thông tin chi tiết các bác sĩ trong hệ thống
          </p>
        </div>
        <Button
          variant="success"
          className="fw-bold shadow-sm px-4"
          onClick={handleShowAdd}
        >
          <i className="bi bi-person-plus-fill me-2"></i> Thêm Bác Sĩ
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại (Hỗ trợ gõ không dấu)..."
              className="border-start-0 ps-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Table List (Fixed Height + Pagination) */}
      <Card className="border-0 shadow-sm">
        <Card.Body
          className="p-0 d-flex flex-column"
          style={{ minHeight: "500px" }}
        >
          <div className="flex-grow-1">
            {isLoading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Table hover responsive className="align-middle m-0">
                <thead className="bg-light text-secondary">
                  <tr>
                    <th className="ps-4 py-3">Bác sĩ</th>
                    <th>Chuyên khoa</th>
                    <th>Liên hệ</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((doc) => (
                      <tr key={doc.id} style={{ height: "80px" }}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <AvatarCircle name={doc.fullName} />
                            <div>
                              <div className="fw-bold text-dark">
                                {doc.fullName}
                              </div>
                              <small className="text-muted">{doc.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {doc.DoctorInfo && doc.DoctorInfo.Specialty ? (
                            <Badge
                              bg="info"
                              text="dark"
                              className="px-3 py-2 rounded-pill"
                            >
                              {doc.DoctorInfo.Specialty.nameSpecialty}
                            </Badge>
                          ) : (
                            <span className="text-muted fst-italic small">
                              Chưa cập nhật
                            </span>
                          )}
                        </td>
                        <td>
                          {doc.phone ? (
                            <span className="fw-semibold">{doc.phone}</span>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="text-muted small d-inline-block text-truncate"
                            style={{ maxWidth: "150px" }}
                            title={doc.address}
                          >
                            {doc.address || "--"}
                          </span>
                        </td>
                        <td>
                          <Badge
                            bg={
                              doc.isActive === false ? "secondary" : "success"
                            }
                            className="dot-badge"
                          >
                            {doc.isActive === false ? "Đã khóa" : "Hoạt động"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        Không tìm thấy bác sĩ nào phù hợp.
                      </td>
                    </tr>
                  )}

                  {currentItems.length > 0 &&
                    currentItems.length < itemsPerPage &&
                    Array.from({
                      length: itemsPerPage - currentItems.length,
                    }).map((_, idx) => (
                      <tr key={`empty-${idx}`} style={{ height: "80px" }}>
                        <td colSpan="5"></td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* --- THANH PHÂN TRANG --- */}
          {filteredDoctors.length > itemsPerPage && !isLoading && (
            <div className="d-flex justify-content-center py-3 border-top mt-auto">
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {renderPaginationItems()}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* --- MODAL THÊM / SỬA (GIỮ NGUYÊN) --- */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">
            {isEditing ? "Cập Nhật Thông Tin Bác Sĩ" : "Thêm Bác Sĩ Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Họ và Tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Email Đăng nhập <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="doctor@gmail.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isEditing}
                  />
                </Form.Group>
              </Col>

              {!isEditing && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Mặc định: 123456"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <Form.Text className="text-muted">
                      Nếu để trống, mật khẩu mặc định là 123456
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="09xxxx"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Chuyên khoa</Form.Label>
                  <Form.Select
                    value={formData.specialtyId}
                    onChange={(e) =>
                      setFormData({ ...formData, specialtyId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameSpecialty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Địa chỉ</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Địa chỉ phòng khám / nhà riêng"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {isEditing ? "Lưu Thay Đổi" : "Tạo Tài Khoản"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorManagementPage;
