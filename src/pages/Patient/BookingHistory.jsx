import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Pagination, // Thêm component Pagination
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const BookingHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 5; // Số lượng item mỗi trang

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const userObj = JSON.parse(storedUser);
      if (userObj && userObj.id) {
        fetchHistory(userObj.id, storedToken);
      }
    } else {
      alert("Vui lòng đăng nhập để xem lịch sử!");
      navigate("/account/login");
    }
  }, []);

  const fetchHistory = async (patientId, token) => {
    try {
      let res = await axios.get(
        `${API_URL}/api/booking-history?patientId=${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res && res.data && res.data.errCode === 0) {
        // SẮP XẾP: Mới nhất lên đầu để trang 1 luôn là cái gần nhất
        const sortedData = res.data.data.sort((a, b) => {
          const dateA = new Date(a.dateBooking + " " + a.timeStart);
          const dateB = new Date(b.dateBooking + " " + b.timeStart);
          return dateB - dateA; // Giảm dần
        });
        setHistory(sortedData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        navigate("/account/login");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Chờ xác nhận
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

  const calculateTotal = (services) => {
    if (!services || services.length === 0) return 0;
    return services.reduce((acc, curr) => {
      const price = curr.BookingService
        ? Number(curr.BookingService.priceAtBooking)
        : Number(curr.price);
      return acc + price;
    }, 0);
  };

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- LOGIC HIỂN THỊ SỐ TRANG (Rút gọn) ---
  // Chỉ hiện tối đa 3 nút số xung quanh trang hiện tại
  const renderPaginationItems = () => {
    let items = [];

    // Luôn hiện trang đầu
    if (currentPage > 2) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (currentPage > 3)
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    // Các trang ở giữa (Trang hiện tại - 1, Trang hiện tại, Trang hiện tại + 1)
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

    // Luôn hiện trang cuối
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

  return (
    <Container className="my-5 pt-5" style={{ minHeight: "80vh" }}>
      <h2 className="text-primary fw-bold mb-4 text-uppercase border-bottom pb-2">
        <i className="bi bi-clock-history me-2"></i> Lịch Sử Đặt Lịch
      </h2>

      {/* Thêm style minHeight và Flex để cố định footer */}
      <Card
        className="shadow border-0 rounded-4"
        style={{ minHeight: "500px", display: "flex", flexDirection: "column" }}
      >
        <Card.Header className="bg-white py-3">
          <span className="fw-bold text-secondary">
            Danh sách các cuộc hẹn của bạn
          </span>
        </Card.Header>

        {/* Phần body set flex-grow-1 để đẩy footer xuống đáy */}
        <Card.Body className="p-0 d-flex flex-column">
          <div className="flex-grow-1">
            <Table striped hover responsive className="m-0 align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="py-3 ps-4">Mã Booking</th>
                  <th>Thời gian</th>
                  <th>Bác sĩ</th>
                  <th>Dịch vụ đăng ký</th>
                  <th>Tổng chi phí</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentItems && currentItems.length > 0 ? (
                  currentItems.map((item) => {
                    let totalAmount = calculateTotal(item.services);
                    return (
                      <tr key={item.id} style={{ height: "80px" }}>
                        {" "}
                        {/* Cố định chiều cao dòng để bảng đều đẹp */}
                        <td className="ps-4 fw-bold text-primary">
                          #{item.id}
                        </td>
                        <td>
                          <div className="fw-bold">
                            {item.dateBooking
                              ? moment(item.dateBooking).format("DD/MM/YYYY")
                              : ""}
                          </div>
                          <small className="text-muted">
                            {item.timeStart} - {item.timeEnd}
                          </small>
                        </td>
                        <td>
                          <div className="fw-bold">
                            {item.Schedule?.User?.fullName || ""}
                          </div>
                        </td>
                        <td>
                          {item.services && item.services.length > 0 ? (
                            item.services.map((s, idx) => (
                              <div
                                key={idx}
                                className="text-truncate"
                                style={{ maxWidth: "200px" }}
                              >
                                • {s.nameService}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted fst-italic">
                              Khám thường
                            </span>
                          )}
                        </td>
                        <td className="fw-bold text-danger">
                          {totalAmount.toLocaleString("vi-VN")} đ
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        className="text-muted mb-2"
                        style={{ fontSize: "2rem" }}
                      >
                        <i className="bi bi-calendar2-x"></i>
                      </div>
                      <h5 className="text-muted">Bạn chưa có lịch hẹn nào.</h5>
                      <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => navigate("/booking")}
                      >
                        Đặt lịch ngay
                      </Button>
                    </td>
                  </tr>
                )}

                {/* --- FILLER ROWS --- */}
                {/* Nếu trang cuối ít hơn 5 dòng, thêm dòng trống để bảng không bị co lại */}
                {currentItems.length > 0 &&
                  currentItems.length < itemsPerPage &&
                  Array.from({
                    length: itemsPerPage - currentItems.length,
                  }).map((_, idx) => (
                    <tr key={`empty-${idx}`} style={{ height: "80px" }}>
                      <td colSpan="6"></td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          {/* --- THANH PHÂN TRANG (CỐ ĐỊNH Ở DƯỚI) --- */}
          {history.length > itemsPerPage && (
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
    </Container>
  );
};

export default BookingHistory;
