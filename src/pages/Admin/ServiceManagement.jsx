import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Modal,
  Row,
  Col,
  Badge,
  Spinner,
  Pagination, // Thêm Pagination
} from "react-bootstrap";
import axios from "axios";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: null,
    nameService: "",
    price: "",
    duration: "",
    description: "",
    specialtyId: "",
  });

  useEffect(() => {
    fetchServices();
    fetchSpecialties();
  }, []);

  // 1. Lấy danh sách Dịch vụ
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8081/api/services");
      if (res.data.EC === 0) {
        // SẮP XẾP: Mới nhất lên đầu
        const sortedData = res.data.DT.sort((a, b) => b.id - a.id);
        setServices(sortedData);
      }
    } catch (error) {
      console.log("Lỗi lấy dịch vụ:", error);
    }
    setIsLoading(false);
  };

  // 2. Lấy danh sách Chuyên khoa
  const fetchSpecialties = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/specialties");
      if (res.data.EC === 0) {
        setSpecialties(res.data.DT);
      }
    } catch (error) {
      console.log("Lỗi lấy chuyên khoa:", error);
    }
  };

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // --- RENDER SỐ TRANG (RÚT GỌN) ---
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
    setCurrentService({
      id: null,
      nameService: "",
      price: "",
      duration: "",
      description: "",
      specialtyId: "",
    });
  };

  const handleShow = (service = null) => {
    if (service) {
      setCurrentService({
        id: service.id,
        nameService: service.nameService,
        price: service.price,
        duration: service.duration,
        description: service.description,
        specialtyId: service.specialtyId,
      });
    } else {
      setCurrentService({
        id: null,
        nameService: "",
        price: "",
        duration: "",
        description: "",
        specialtyId: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let res;
      const payload = {
        nameService: currentService.nameService,
        price: currentService.price,
        duration: currentService.duration,
        description: currentService.description,
        specialtyId: currentService.specialtyId,
      };

      if (currentService.id) {
        res = await axios.put(
          `http://localhost:8081/api/services/${currentService.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post("http://localhost:8081/api/services", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.EC === 0) {
        alert(
          currentService.id ? "Cập nhật thành công!" : "Thêm mới thành công!"
        );
        fetchServices();
        handleClose();
      } else {
        alert(res.data.EM);
      }
    } catch (error) {
      alert("Lỗi hệ thống");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa dịch vụ này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:8081/api/services/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        alert("Xóa thành công!");
        fetchServices();
      } else {
        alert(res.data.EM);
      }
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary fw-bold m-0">
          <i className="bi bi-hdd-stack-fill me-2"></i>Quản lý Dịch vụ Khám
        </h3>
        <Button variant="success" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle me-2"></i> Thêm Dịch vụ mới
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
                    <th className="ps-4">ID</th>
                    <th>Tên Dịch vụ</th>
                    <th>Chuyên khoa</th>
                    <th>Giá (VNĐ)</th>
                    <th>Thời lượng</th>
                    <th>Mô tả</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((service) => (
                      <tr key={service.id} style={{ height: "80px" }}>
                        {" "}
                        {/* Cố định chiều cao dòng */}
                        <td className="ps-4">#{service.id}</td>
                        <td className="fw-bold text-primary">
                          {service.nameService}
                        </td>
                        <td>
                          {service.Specialty ? (
                            <Badge bg="info" text="dark">
                              {service.Specialty.nameSpecialty}
                            </Badge>
                          ) : (
                            <span className="text-muted small">Chưa gán</span>
                          )}
                        </td>
                        <td className="fw-bold text-success">
                          {Number(service.price).toLocaleString("vi-VN")} đ
                        </td>
                        <td>{service.duration} phút</td>
                        <td>
                          <span
                            className="d-inline-block text-truncate"
                            style={{ maxWidth: "150px" }}
                            title={service.description}
                          >
                            {service.description}
                          </span>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="light"
                            size="sm"
                            className="me-2 text-primary border-primary"
                            onClick={() => handleShow(service)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger border-danger"
                            onClick={() => handleDelete(service.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
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
                        <td colSpan="7"></td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* --- THANH PHÂN TRANG --- */}
          {services.length > itemsPerPage && !isLoading && (
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

      {/* Modal Sửa/Thêm (GIỮ NGUYÊN) */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">
            {currentService.id ? "Cập nhật Dịch vụ" : "Thêm Dịch vụ mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Tên Dịch vụ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={currentService.nameService}
                    onChange={(e) =>
                      setCurrentService({
                        ...currentService,
                        nameService: e.target.value,
                      })
                    }
                    required
                    placeholder="VD: Cạo vôi răng"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Giá (VNĐ) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={currentService.price}
                    onChange={(e) =>
                      setCurrentService({
                        ...currentService,
                        price: e.target.value,
                      })
                    }
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Thời lượng (phút) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={currentService.duration}
                    onChange={(e) =>
                      setCurrentService({
                        ...currentService,
                        duration: e.target.value,
                      })
                    }
                    required
                    min="15"
                    step="15"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Chuyên khoa <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={currentService.specialtyId}
                    onChange={(e) =>
                      setCurrentService({
                        ...currentService,
                        specialtyId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">--- Chọn Chuyên khoa ---</option>
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nameSpecialty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Mô tả chi tiết
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={currentService.description}
                    onChange={(e) =>
                      setCurrentService({
                        ...currentService,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {currentService.id ? "Lưu Thay Đổi" : "Tạo Mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ServiceManagement;
