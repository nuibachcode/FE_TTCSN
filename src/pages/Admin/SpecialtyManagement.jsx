import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Modal,
  Spinner,
  Pagination, // Thêm Pagination
} from "react-bootstrap";
import axios from "axios";

// --- DANH SÁCH CHUYÊN KHOA MẪU (Để chọn trong Modal) ---
const SAMPLE_SPECIALTIES = [
  "Nha khoa Tổng quát",
  "Nha khoa Thẩm mỹ",
  "Niềng răng (Chỉnh nha)",
  "Cấy ghép Implant",
  "Nhổ răng khôn",
  "Điều trị tủy",
  "Răng trẻ em",
  "Phục hình răng sứ",
  "Tẩy trắng răng",
];

const SpecialtyManagement = () => {
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState({
    id: null,
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8081/api/specialties");
      if (res.data.EC === 0) {
        // Map dữ liệu và SẮP XẾP MỚI NHẤT LÊN ĐẦU
        const mappedData = res.data.DT.map((item) => ({
          id: item.id,
          name: item.nameSpecialty,
          description: item.description,
        })).sort((a, b) => b.id - a.id);

        setSpecialties(mappedData);
      }
    } catch (e) {
      console.log("Lỗi lấy chuyên khoa:", e);
    }
    setIsLoading(false);
  };

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(specialties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = specialties.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleClose = () => {
    setShowModal(false);
    setCurrentSpecialty({ id: null, name: "", description: "" });
  };

  const handleShow = (specialty = null) => {
    if (specialty) setCurrentSpecialty(specialty);
    else setCurrentSpecialty({ id: null, name: "", description: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      let res;
      const payload = {
        name: currentSpecialty.name,
        description: currentSpecialty.description,
      };

      if (currentSpecialty.id) {
        // UPDATE
        res = await axios.put(
          `http://localhost:8081/api/specialties/${currentSpecialty.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // CREATE
        res = await axios.post(
          "http://localhost:8081/api/specialties",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.data.EC === 0) {
        alert(
          currentSpecialty.id ? "Cập nhật thành công!" : "Thêm mới thành công!"
        );
        fetchSpecialties();
        handleClose();
      } else {
        alert(res.data.EM);
      }
    } catch (e) {
      alert("Lỗi hệ thống");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa chuyên khoa này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(
          `http://localhost:8081/api/specialties/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.EC === 0) {
          alert("Xóa thành công!");
          fetchSpecialties();
        } else {
          alert(res.data.EM);
        }
      } catch (e) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary fw-bold m-0">
          <i className="bi bi-heart-pulse-fill me-2"></i>Quản lý Chuyên khoa
        </h3>
        <Button variant="success" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle me-2"></i> Thêm Chuyên khoa
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        {/* Set minHeight và Flex column để cố định Footer */}
        <Card.Body
          className="p-0 d-flex flex-column"
          style={{ minHeight: "500px" }}
        >
          <div className="flex-grow-1">
            {isLoading ? (
              <div className="text-center p-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <Table hover responsive className="align-middle m-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4" style={{ width: "10%" }}>
                      ID
                    </th>
                    <th style={{ width: "30%" }}>Tên Chuyên khoa</th>
                    <th style={{ width: "40%" }}>Mô tả</th>
                    <th className="text-center" style={{ width: "20%" }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((spec) => (
                      <tr key={spec.id} style={{ height: "80px" }}>
                        {" "}
                        {/* Cố định chiều cao dòng */}
                        <td className="ps-4">#{spec.id}</td>
                        <td className="fw-bold text-primary">{spec.name}</td>
                        <td>
                          <span
                            className="d-inline-block text-truncate"
                            style={{ maxWidth: "300px" }}
                            title={spec.description}
                          >
                            {spec.description || "--"}
                          </span>
                        </td>
                        <td className="text-center">
                          {/* Nút Sửa đẹp */}
                          <Button
                            variant="light"
                            size="sm"
                            className="me-2 text-primary border-primary"
                            onClick={() => handleShow(spec)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Button>
                          {/* Nút Xóa đẹp */}
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger border-danger"
                            onClick={() => handleDelete(spec.id)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  )}

                  {/* --- FILLER ROWS --- */}
                  {currentItems.length > 0 &&
                    currentItems.length < itemsPerPage &&
                    Array.from({
                      length: itemsPerPage - currentItems.length,
                    }).map((_, idx) => (
                      <tr key={`empty-${idx}`} style={{ height: "80px" }}>
                        <td colSpan="4"></td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* --- THANH PHÂN TRANG --- */}
          {specialties.length > itemsPerPage && !isLoading && (
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

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">
            {currentSpecialty.id
              ? "Cập nhật Chuyên Khoa"
              : "Thêm Chuyên Khoa Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Tên Chuyên khoa <span className="text-danger">*</span>
              </Form.Label>
              {/* THAY ĐỔI: Sử dụng Select Box thay vì Input Text */}
              <Form.Select
                value={currentSpecialty.name}
                onChange={(e) =>
                  setCurrentSpecialty({
                    ...currentSpecialty,
                    name: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Chọn tên chuyên khoa --</option>
                {SAMPLE_SPECIALTIES.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Vui lòng chọn tên chuyên khoa từ danh sách có sẵn.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Nhập mô tả về chuyên khoa này..."
                value={currentSpecialty.description}
                onChange={(e) =>
                  setCurrentSpecialty({
                    ...currentSpecialty,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {currentSpecialty.id ? "Lưu Thay Đổi" : "Tạo Mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SpecialtyManagement;
