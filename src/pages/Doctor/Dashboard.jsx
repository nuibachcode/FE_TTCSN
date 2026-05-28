import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Nhớ import CSS này

const DoctorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  // State lưu ngày được chọn (mặc định là hôm nay)
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.roleId === 2) {
      // Gọi hàm fetch mỗi khi selectedDate thay đổi
      fetchBookings(user.id, selectedDate);
    }
  }, [selectedDate]); // Thêm dependency selectedDate

  const fetchBookings = async (doctorId, date) => {
    try {
      // Format ngày chuẩn YYYY-MM-DD để gửi lên API
      const formattedDate = moment(date).format("YYYY-MM-DD");

      const res = await axios.get(
        `${API_URL}/api/doctor/bookings?doctorId=${doctorId}&date=${formattedDate}`
      );

      if (res && res.data && res.data.errCode === 0) {
        setBookings(res.data.data);
      } else {
        setBookings([]); // Xóa dữ liệu cũ nếu API không trả về gì
      }
    } catch (error) {
      console.log("Lỗi lấy lịch:", error);
      setBookings([]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Chờ duyệt
          </Badge>
        );
      case "completed":
        return <Badge bg="primary">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold m-0">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard Bác sĩ
        </h2>
      </div>

      {/* KHU VỰC CHỌN NGÀY */}
      <Card className="shadow-sm border-0 mb-4 bg-white">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Alert variant="info" className="m-0 border-0">
                <i className="bi bi-calendar-check me-2"></i>
                Đang xem lịch hẹn ngày:{" "}
                <strong>{moment(selectedDate).format("DD/MM/YYYY")}</strong>
              </Alert>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <div className="d-flex align-items-center justify-content-md-end gap-2">
                <span className="fw-bold text-secondary">Chọn ngày xem:</span>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control border-primary fw-bold text-center text-primary"
                  // Cho phép chọn quá khứ để xem lại lịch sử
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* DANH SÁCH LỊCH HẸN */}
      <Card className="shadow border-0">
        <Card.Header className="bg-white py-3">
          <h5 className="m-0 fw-bold text-primary">
            <i className="bi bi-list-ul me-2"></i>Danh Sách Bệnh Nhân
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped hover responsive className="m-0 align-middle">
            <thead className="bg-light text-secondary">
              <tr>
                <th className="py-3 ps-3">Thời gian</th>
                <th className="py-3">Bệnh nhân</th>
                <th className="py-3">Thông tin liên hệ</th>

                <th className="py-3">Dịch vụ đăng ký</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {bookings && bookings.length > 0 ? (
                bookings.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <div
                        className="fw-bold text-primary"
                        style={{ fontSize: "1.1rem" }}
                      >
                        {item.timeStart} - {item.timeEnd}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold">
                        {item.User ? item.User.fullName : "Ẩn danh"}
                      </div>
                    </td>
                    <td>
                      <div>
                        <i className="bi bi-telephone me-1"></i>{" "}
                        {item.User ? item.User.phone : "--"}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-geo-alt me-1"></i>{" "}
                        {item.User ? item.User.address : "--"}
                      </div>
                    </td>

                    <td>
                      {item.services && item.services.length > 0 ? (
                        item.services.map((s, idx) => (
                          <div key={idx}>• {s.nameService}</div>
                        ))
                      ) : (
                        <span className="text-muted fst-italic">
                          Khám thường
                        </span>
                      )}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      {/* Hiển thị mô tả bệnh lý nếu có */}
                      <span className="text-muted small">
                        {item.description || "Không có ghi chú"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div
                      className="text-muted mb-2"
                      style={{ fontSize: "3rem" }}
                    >
                      <i className="bi bi-calendar-x"></i>
                    </div>
                    <h5 className="text-muted">
                      Không có lịch hẹn nào vào ngày này.
                    </h5>
                    <p className="text-secondary mb-0">
                      Vui lòng chọn ngày khác để kiểm tra.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DoctorDashboard;
