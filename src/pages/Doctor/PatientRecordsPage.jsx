import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Card,
  Button,
  Table,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

const PatientRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]); // State lưu danh sách thật
  const [loading, setLoading] = useState(false);

  // Lấy user info từ localStorage để biết bác sĩ nào đang đăng nhập
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Hàm gọi API lấy danh sách bệnh nhân
  useEffect(() => {
    if (user && user.id) {
      fetchPatients();
    }
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Lấy token xác thực
      const res = await axios.get(
        `${API_URL}/api/doctor/patients?doctorId=${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.EC === 0) {
        setPatients(res.data.DT);
      } else {
        console.log("Lỗi lấy dữ liệu:", res.data.EM);
      }
    } catch (error) {
      console.log("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic tìm kiếm (Filter trên client)
  // Kết hợp họ tên để tìm kiếm
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
    const phone = patient.phoneNumber ? patient.phoneNumber : "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || phone.includes(search);
  });

  return (
    <div className="patient-records-page container py-4">
      <h3 className="mb-4 text-primary fw-bold">
        <i className="bi bi-journal-medical me-2"></i>Hồ sơ Bệnh nhân
      </h3>

      {/* Thanh tìm kiếm */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-white text-muted">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo Tên hoặc Số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="success" onClick={fetchPatients}>
                <i className="bi bi-arrow-clockwise me-1"></i> Tải lại
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng danh sách */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
          <span>Danh sách Bệnh nhân ({filteredPatients.length})</span>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped hover responsive className="m-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">#</th>
                <th>Họ và Tên</th>

                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Lần khám cuối</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                    <td className="fw-bold text-primary">
                      {patient.lastName} {patient.firstName}
                    </td>

                    <td>{patient.phoneNumber}</td>
                    <td>
                      <span
                        className="d-inline-block text-truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {patient.address}
                      </span>
                    </td>
                    <td>
                      {patient.lastVisit
                        ? moment(patient.lastVisit).format("DD/MM/YYYY HH:mm")
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    Không tìm thấy dữ liệu bệnh nhân nào.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PatientRecordsPage;
