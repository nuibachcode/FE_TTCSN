import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Table,
  Button,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

const AdminDashboardPage = () => {
  // State lưu dữ liệu thật
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    monthOrders: 0,
    monthTarget: 500000000,
    countDoctors: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 giao dịch mỗi trang

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [resStats, resRecent] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, config),
        axios.get(`${API_URL}/api/admin/payments/recent`, config),
      ]);

      if (resStats.data.EC === 0) {
        const data = resStats.data.DT;
        setStats((prev) => ({
          ...prev,
          todayRevenue: Number(data.revenueToday),
          monthRevenue: Number(data.revenueMonth),
          monthOrders: Number(data.totalOrders),
          countDoctors: Number(data.totalDoctors),
        }));
      }

      if (resRecent.data.EC === 0) {
        // SẮP XẾP: Mới nhất lên đầu (theo createdAt)
        const sortedData = resRecent.data.DT.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRecentPayments(sortedData);
      }
    } catch (error) {
      console.log("Lỗi lấy dashboard:", error);
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("vi-VN") + " VNĐ";
  };

  const progressPercent = (stats.monthRevenue / stats.monthTarget) * 100;

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  const totalPages = Math.ceil(recentPayments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = recentPayments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- HÀM RENDER SỐ TRANG (RÚT GỌN) ---
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

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="admin-dashboard">
      <h3 className="mb-4 text-warning fw-bold">
        📊 Tổng quan Hiệu suất Kinh doanh
      </h3>

      {/* --- 1. Thẻ KPI (Giữ nguyên) --- */}
      <Row className="mb-4">
        {/* Doanh thu Hôm nay */}
        <Col md={3}>
          <Card className="shadow-sm border-start border-primary border-5 h-100">
            <Card.Body>
              <Card.Title className="text-primary fw-bold">
                Doanh thu Hôm nay
              </Card.Title>
              <Card.Text className="fs-3 fw-bolder">
                {formatCurrency(stats.todayRevenue)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Doanh thu Tháng này */}
        <Col md={4}>
          <Card className="shadow-sm border-start border-warning border-5 h-100">
            <Card.Body>
              <Card.Title className="text-warning fw-bold">
                Doanh thu Tháng này
              </Card.Title>
              <Card.Text className="fs-3 fw-bolder">
                {formatCurrency(stats.monthRevenue)}
              </Card.Text>
              <div className="progress mt-2" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                ></div>
              </div>
              <span className="small text-muted">
                Đạt {progressPercent.toFixed(1)}% mục tiêu
              </span>
            </Card.Body>
          </Card>
        </Col>
        {/* Tổng đơn */}
        <Col md={3}>
          <Card className="shadow-sm border-start border-success border-5 h-100">
            <Card.Body>
              <Card.Title className="text-success fw-bold">
                Tổng đơn Tháng
              </Card.Title>
              <Card.Text className="fs-3 fw-bolder">
                {stats.monthOrders} đơn
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Bác sĩ */}
        <Col md={2}>
          <Card className="shadow-sm border-start border-info border-5 h-100">
            <Card.Body>
              <Card.Title className="text-info fw-bold">Bác sĩ</Card.Title>
              <Card.Text className="fs-4 fw-bolder">
                {stats.countDoctors} Đang hoạt động
              </Card.Text>
              <Button size="sm" variant="info" as={Link} to="/admin/doctors">
                Quản lý ngay
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- 2. Bảng Giao dịch Gần đây (ĐÃ SỬA PHÂN TRANG) --- */}
      {/* Set minHeight và Flex column để cố định footer */}
      <Card
        className="shadow-sm mb-5"
        style={{ minHeight: "500px", display: "flex", flexDirection: "column" }}
      >
        <Card.Header className="bg-white fw-bold">
          Giao dịch Gần đây
        </Card.Header>

        {/* Body set flex-column để đẩy phần phân trang xuống đáy */}
        <Card.Body className="d-flex flex-column p-0">
          <div className="flex-grow-1">
            <Table hover responsive className="m-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-3">Mã GD</th>
                  <th>Bệnh nhân</th>
                  <th>Ngày</th>
                  <th className="text-end">Số tiền</th>
                  <th className="text-center">Hình thức</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} style={{ height: "60px" }}>
                      {" "}
                      {/* Cố định chiều cao dòng */}
                      <td className="ps-3">#{item.id}</td>
                      <td>
                        {item.Booking?.User?.fullName || "Khách vãng lai"}
                      </td>
                      <td>
                        {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="text-end fw-bold text-danger">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="text-center">
                        <Badge
                          bg={item.method === "cash" ? "success" : "primary"}
                        >
                          {item.method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge
                          bg={item.status === "success" ? "success" : "warning"}
                          text={item.status === "success" ? "white" : "dark"}
                        >
                          {item.status === "success"
                            ? "Thành công"
                            : "Chờ xử lý"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Chưa có giao dịch nào.
                    </td>
                  </tr>
                )}

                {/* --- FILLER ROWS (Để bảng không bị co lại khi ít dữ liệu) --- */}
                {currentItems.length > 0 &&
                  currentItems.length < itemsPerPage &&
                  Array.from({
                    length: itemsPerPage - currentItems.length,
                  }).map((_, idx) => (
                    <tr key={`empty-${idx}`} style={{ height: "60px" }}>
                      <td colSpan="6"></td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          {/* --- THANH PHÂN TRANG --- */}
          {recentPayments.length > itemsPerPage && (
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
    </div>
  );
};

export default AdminDashboardPage;
