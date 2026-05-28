import React, { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Button,
  Card,
  Container,
  Modal,
  Form,
  Alert,
  Spinner,
  Tabs,
  Tab,
  Pagination, // Thêm Pagination
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

const BookingAdminManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- TAB & PAGINATION STATE ---
  const [key, setKey] = useState("all"); // State quản lý Tab đang chọn
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State cho Modal Thanh toán
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: "cash",
    note: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  // Reset về trang 1 khi chuyển Tab hoặc data thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [key, bookings]);

  // 1. Lấy danh sách lịch hẹn
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.EC === 0) {
        // SẮP XẾP: Mới nhất lên đầu
        const sortedData = res.data.DT.sort((a, b) => b.id - a.id);
        setBookings(sortedData);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // --- LOGIC FILTER THEO TAB ---
  const getFilteredBookings = () => {
    if (key === "all") return bookings;
    return bookings.filter((item) => item.status === key);
  };

  const filteredBookings = getFilteredBookings();

  // --- LOGIC PHÂN TRANG (Áp dụng trên data đã lọc) ---
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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

  // 2. Xử lý Update Status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    const confirmMsg =
      newStatus === "cancelled"
        ? "Bạn chắc chắn muốn HỦY lịch hẹn này?"
        : "Xác nhận lịch hẹn này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        alert("Cập nhật trạng thái thành công!");
        fetchBookings();
      }
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  // 3. Mở Modal Thanh toán
  const handleOpenPayment = (booking) => {
    const total = booking.services.reduce(
      (acc, s) => acc + Number(s.BookingService?.priceAtBooking || s.price),
      0
    );
    setSelectedBooking(booking);
    setPaymentData({ amount: total, method: "cash", note: "" });
    setShowPaymentModal(true);
  };

  // 4. Xác nhận Thanh toán
  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bookingId: selectedBooking.id,
        amount: paymentData.amount,
        method: paymentData.method,
        note: paymentData.note,
        transactionCode: `TRX_${Date.now()}`,
      };

      const res = await axios.post(
        `${API_URL}/api/payments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        alert("Thanh toán thành công!");
        setShowPaymentModal(false);
        fetchBookings();
      }
    } catch (e) {
      alert("Lỗi thanh toán");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Chờ xác nhận
          </Badge>
        );
      case "confirmed":
        return <Badge bg="primary">Đã xác nhận</Badge>;
      case "completed":
        return <Badge bg="success">Đã thanh toán</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Component Bảng (Tái sử dụng cho các Tab)
  const BookingTable = () => (
    <div className="d-flex flex-column" style={{ minHeight: "500px" }}>
      <div className="flex-grow-1">
        <Table hover responsive className="align-middle m-0">
          <thead className="bg-light">
            <tr>
              <th>Mã BK</th>
              <th style={{ width: "20%" }}>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Thời gian</th>
              <th style={{ width: "20%" }}>Dịch vụ</th>
              <th>Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id} style={{ height: "80px" }}>
                  {" "}
                  {/* Cố định chiều cao dòng */}
                  <td className="fw-bold">#{item.id}</td>
                  <td>
                    <div className="fw-bold">{item.User?.fullName}</div>
                    <small className="text-muted">{item.User?.phone}</small>
                  </td>
                  <td>{item.Schedule?.User?.fullName}</td>
                  <td>
                    {moment(item.dateBooking).format("DD/MM/YYYY")} <br />
                    <small className="text-primary fw-bold">
                      {item.timeStart} - {item.timeEnd}
                    </small>
                  </td>
                  <td>
                    {item.services?.map((s, idx) => (
                      <div
                        key={idx}
                        className="text-truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        • {s.nameService}
                      </div>
                    ))}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      {/* Nút Xác nhận */}
                      {item.status === "pending" && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(item.id, "confirmed")
                          }
                          title="Xác nhận lịch"
                        >
                          <i className="bi bi-check-lg"></i>
                        </Button>
                      )}

                      {/* Nút Thanh toán */}
                      {item.status === "confirmed" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleOpenPayment(item)}
                          title="Thu tiền & Hoàn thành"
                        >
                          <i className="bi bi-cash-coin"></i>
                        </Button>
                      )}

                      {/* Nút Hủy */}
                      {item.status !== "completed" &&
                        item.status !== "cancelled" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(item.id, "cancelled")
                            }
                            title="Hủy lịch"
                          >
                            <i className="bi bi-x-lg"></i>
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}

            {/* --- FILLER ROWS --- */}
            {currentItems.length > 0 &&
              currentItems.length < itemsPerPage &&
              Array.from({ length: itemsPerPage - currentItems.length }).map(
                (_, idx) => (
                  <tr key={`empty-${idx}`} style={{ height: "80px" }}>
                    <td colSpan="7"></td>
                  </tr>
                )
              )}
          </tbody>
        </Table>
      </div>

      {/* --- PHÂN TRANG --- */}
      {filteredBookings.length > itemsPerPage && (
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
    </div>
  );

  return (
    <Container fluid className="py-4">
      <h3 className="mb-4 text-primary fw-bold">
        <i className="bi bi-calendar-check me-2"></i>Quản Lý & Điều Phối Lịch
        Hẹn
      </h3>

      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Admin vui lòng gọi điện xác nhận với khách hàng trước khi chuyển trạng
        thái sang <strong>Đã xác nhận</strong>.
      </Alert>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            // --- TABS TRẠNG THÁI ---
            <Tabs
              id="booking-status-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              <Tab eventKey="all" title={`Tất cả (${bookings.length})`}>
                <BookingTable />
              </Tab>
              <Tab
                eventKey="pending"
                title={`Chờ xác nhận (${
                  bookings.filter((b) => b.status === "pending").length
                })`}
              >
                <BookingTable />
              </Tab>
              <Tab
                eventKey="confirmed"
                title={`Đã xác nhận (${
                  bookings.filter((b) => b.status === "confirmed").length
                })`}
              >
                <BookingTable />
              </Tab>
              <Tab
                eventKey="completed"
                title={`Đã thanh toán (${
                  bookings.filter((b) => b.status === "completed").length
                })`}
              >
                <BookingTable />
              </Tab>
              <Tab
                eventKey="cancelled"
                title={`Đã hủy (${
                  bookings.filter((b) => b.status === "cancelled").length
                })`}
              >
                <BookingTable />
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>

      {/* MODAL THANH TOÁN (GIỮ NGUYÊN) */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Xác nhận Thu tiền</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Khách hàng</Form.Label>
              <Form.Control
                type="text"
                value={selectedBooking?.User?.fullName || ""}
                disabled
                className="bg-light fw-bold"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Tổng tiền thực thu (VNĐ)
              </Form.Label>
              <Form.Control
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                className="form-control-lg border-success text-success fw-bold"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình thức thanh toán</Form.Label>
              <Form.Select
                value={paymentData.method}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, method: e.target.value })
                }
              >
                <option value="cash">Tiền mặt</option>
                <option value="banking">Chuyển khoản Ngân hàng</option>
                <option value="credit_card">Thẻ tín dụng / Visa</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú giao dịch</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, note: e.target.value })
                }
                placeholder="VD: Khách chuyển khoản VCB..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button variant="success" onClick={handleConfirmPayment}>
            Xác nhận Đã thu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingAdminManagement;
