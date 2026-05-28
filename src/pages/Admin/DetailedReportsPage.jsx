import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// --- CẤU HÌNH UI & MÀU SẮC ---
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Custom input cho DatePicker để nhìn đẹp hơn
const CustomDateInput = React.forwardRef(({ value, onClick, icon }, ref) => (
  <div
    className="position-relative"
    onClick={onClick}
    ref={ref}
    style={{ cursor: "pointer" }}
  >
    <div
      className="form-control border-0 shadow-sm ps-5 fw-bold text-primary"
      style={{ height: "45px", display: "flex", alignItems: "center" }}
    >
      {value}
    </div>
    <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
      <i className={`bi ${icon}`}></i>
    </div>
  </div>
));

const DetailedReportsPage = () => {
  // --- STATE 1: Dữ liệu DOANH THU (Lọc theo THÁNG) ---
  const [revenueData, setRevenueData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Mặc định tháng hiện tại
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // --- STATE 2: Dữ liệu HIỆU SUẤT (Lọc theo KHOẢNG NGÀY) ---
  const [performanceData, setPerformanceData] = useState({
    topDoctors: [],
    topServices: [],
    statusStats: [],
  });
  // Mặc định từ đầu tháng đến hiện tại
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [loadingPerf, setLoadingPerf] = useState(false);

  // --- EFFECT ---
  // 1. Khi load trang hoặc đổi Tháng -> Gọi API Doanh thu
  useEffect(() => {
    fetchRevenueData();
  }, [selectedMonth]);

  // 2. Khi load trang -> Gọi API Hiệu suất lần đầu
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // --- API CALLS ---

  // Gọi API lấy Doanh thu (Tự tính ngày đầu tháng và cuối tháng)
  const fetchRevenueData = async () => {
    setLoadingRevenue(true);
    try {
      const token = localStorage.getItem("token");
      // Tính ngày đầu và cuối của tháng được chọn
      const startStr = moment(selectedMonth)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endStr = moment(selectedMonth).endOf("month").format("YYYY-MM-DD");

      const res = await axios.get(
        `${API_URL}/api/admin/reports/detailed?startDate=${startStr}&endDate=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.EC === 0) {
        setRevenueData(res.data.DT.revenueByDate || []);
      }
    } catch (error) {
      console.error("Lỗi lấy doanh thu:", error);
    }
    setLoadingRevenue(false);
  };

  // Gọi API lấy Hiệu suất (Theo Start - End Date user chọn)
  const fetchPerformanceData = async () => {
    setLoadingPerf(true);
    try {
      const token = localStorage.getItem("token");
      const startStr = moment(startDate).format("YYYY-MM-DD");
      const endStr = moment(endDate).format("YYYY-MM-DD");

      const res = await axios.get(
        `${API_URL}/api/admin/reports/detailed?startDate=${startStr}&endDate=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.EC === 0) {
        setPerformanceData({
          topDoctors: res.data.DT.topDoctors,
          topServices: res.data.DT.topServices,
          statusStats: res.data.DT.statusStats,
        });
      }
    } catch (error) {
      console.error("Lỗi lấy hiệu suất:", error);
    }
    setLoadingPerf(false);
  };

  const handleFilterPerformance = (e) => {
    e.preventDefault();
    fetchPerformanceData();
  };

  const formatCurrency = (value) =>
    Number(value).toLocaleString("vi-VN") + " đ";

  // Chuẩn bị dữ liệu Pie Chart
  const pieData =
    performanceData.statusStats?.map((item) => ({
      name:
        item.status === "confirmed"
          ? "Đã xác nhận"
          : item.status === "pending"
          ? "Chờ duyệt"
          : item.status === "completed"
          ? "Hoàn thành"
          : item.status === "cancelled"
          ? "Đã hủy"
          : item.status,
      value: Number(item.count),
    })) || [];

  return (
    <div className="detailed-reports-page container-fluid py-4 bg-light min-vh-100">
      {/* Header Chung */}
      <div className="mb-4">
        <h3 className="text-primary fw-bold text-uppercase m-0">
          <i className="bi bi-bar-chart-fill me-2"></i> Thống Kê & Báo Cáo
        </h3>
        <p className="text-muted small ms-1">
          Tổng hợp số liệu kinh doanh phòng khám
        </p>
      </div>

      {/* ================================================================================= */}
      {/* PHẦN 1: BÁO CÁO DOANH THU (Lọc theo THÁNG) */}
      {/* ================================================================================= */}
      <Card className="shadow-sm border-0 rounded-4 mb-5">
        <Card.Header className="bg-white py-3 border-bottom-0 d-flex flex-column flex-md-row justify-content-between align-items-center pe-4">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
              <i className="bi bi-graph-up-arrow fs-4"></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0">Biểu Đồ Doanh Thu</h5>
              <span className="text-muted small">
                Theo dõi biến động theo tháng
              </span>
            </div>
          </div>

          {/* BỘ LỌC THÁNG (Nằm ngay trên Header Card) */}
          <div style={{ width: "200px" }}>
            <DatePicker
              selected={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              customInput={<CustomDateInput icon="bi-calendar-month" />}
            />
          </div>
        </Card.Header>

        <Card.Body style={{ height: "400px" }} className="pt-0 px-4">
          {loadingRevenue ? (
            <div className="h-100 d-flex align-items-center justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#999"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  tickFormatter={(val) =>
                    val >= 1000000 ? `${val / 1000000}Tr` : val
                  }
                  style={{ fontSize: "12px" }}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#0d6efd"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card>

      {/* ================================================================================= */}
      {/* PHẦN 2: BÁO CÁO HIỆU SUẤT (Lọc theo KHOẢNG NGÀY) */}
      {/* ================================================================================= */}

      <div className="d-flex align-items-center mb-4">
        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3 text-success">
          <i className="bi bi-speedometer2 fs-4"></i>
        </div>
        <div>
          <h4 className="fw-bold text-dark m-0">Hiệu Suất Hoạt Động</h4>
          <span className="text-muted small">
            Top bác sĩ, dịch vụ và trạng thái lịch hẹn
          </span>
        </div>
      </div>
      {/* --- THANH CÔNG CỤ LỌC (DESIGN MỚI) --- */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <Card.Body className="p-4">
          <Form onSubmit={handleFilterPerformance}>
            <Row className="g-3 align-items-end">
              {/* 1. Tiêu đề bộ lọc (Optional, để trang trí) */}
              <Col
                xs={12}
                md={12}
                lg={8}
                className="d-flex align-items-center mb-2 mb-lg-0"
              >
                <div>
                  <h6 className="fw-bold text-dark m-0">Thời Gian Thống Kê</h6>
                  <span className="text-muted small">
                    Chọn khoảng thời gian muốn xem
                  </span>
                </div>
              </Col>

              {/* 2. Input Từ Ngày */}
              <Col xs={6} md={4} lg={12}>
                <Form.Label className="text-secondary fw-bold small text-uppercase mb-1">
                  Từ ngày
                </Form.Label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0 ps-3">
                    <i className="bi bi-calendar-event text-primary"></i>
                  </span>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control border-0 bg-light fw-semibold py-2"
                    placeholderText="Chọn ngày bắt đầu"
                  />
                </div>
              </Col>

              {/* 3. Input Đến Ngày */}
              <Col xs={6} md={4} lg={12}>
                <Form.Label className="text-secondary fw-bold small text-uppercase mb-1">
                  Đến ngày
                </Form.Label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0 ps-3">
                    <i className="bi bi-calendar-check text-success"></i>
                  </span>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control border-0 bg-light fw-semibold py-2"
                    placeholderText="Chọn ngày kết thúc"
                    minDate={startDate} // Không cho chọn ngày kết thúc < ngày bắt đầu
                  />
                </div>
              </Col>

              {/* 4. Nút Lọc & Nút Reset */}
              <Col xs={12} md={4} lg={12}>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={loadingPerf}
                  >
                    {loadingPerf ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <i className="bi bi-search"></i> Xem Báo Cáo
                      </>
                    )}
                  </Button>

                  {/* Nút phụ để reset về tháng này nhanh */}
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      {/* --- NỘI DUNG HIỆU SUẤT --- */}
      {loadingPerf ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            {/* Top Bác sĩ */}
            <Col lg={7} className="mb-4 mb-lg-0">
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Header className="bg-white py-3 border-0">
                  <h6 className="fw-bold text-dark m-0">
                    Top 5 Bác sĩ Doanh thu cao nhất
                  </h6>
                </Card.Header>
                <Card.Body style={{ height: "350px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData.topDoctors}
                      layout="vertical"
                      margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8f9fa" }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#20c997"
                        barSize={20}
                        radius={[0, 10, 10, 0]}
                        label={{
                          position: "right",
                          formatter: (val) =>
                            val >= 1000000
                              ? `${(val / 1000000).toFixed(1)} Tr`
                              : val,
                          fontSize: 12,
                          fill: "#666",
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Trạng thái Lịch hẹn */}
            <Col lg={5}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Header className="bg-white py-3 border-0">
                  <h6 className="fw-bold text-dark m-0">
                    Tỷ lệ Trạng thái Lịch hẹn
                  </h6>
                </Card.Header>
                <Card.Body
                  style={{ height: "350px" }}
                  className="d-flex justify-content-center align-items-center"
                >
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-muted fst-italic">
                      Không có dữ liệu
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Bảng Dịch vụ */}
          <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            <Card.Header className="bg-white py-3 border-0 d-flex align-items-center">
              <h6 className="fw-bold text-dark m-0">Top Dịch vụ Thực hiện</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="m-0 align-middle">
                <thead className="bg-light">
                  <tr className="text-secondary small text-uppercase">
                    <th className="ps-4 py-3 border-0">Tên Dịch vụ</th>
                    <th className="text-center border-0">Số lượt</th>
                    <th className="text-end pe-4 border-0">Doanh thu</th>
                    <th
                      className="text-center border-0"
                      style={{ width: "25%" }}
                    >
                      Tỷ trọng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.topServices &&
                  performanceData.topServices.length > 0 ? (
                    performanceData.topServices.map((item, index) => {
                      const maxRevenue = Number(
                        performanceData.topServices[0].totalRevenue
                      );
                      const percent =
                        (Number(item.totalRevenue) / maxRevenue) * 100;
                      return (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #f9f9f9" }}
                        >
                          <td className="ps-4 fw-bold text-primary">
                            {item.Service?.nameService || (
                              <span className="text-muted small fst-italic">
                                Đã xóa
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <Badge
                              bg="light"
                              text="dark"
                              className="border px-3 py-2 rounded-pill shadow-sm"
                            >
                              {item.totalCount}
                            </Badge>
                          </td>
                          <td className="text-end pe-4 fw-bold text-dark">
                            {formatCurrency(item.totalRevenue)}
                          </td>
                          <td className="text-center px-4">
                            <div className="d-flex align-items-center">
                              <div
                                className="progress flex-grow-1"
                                style={{
                                  height: "6px",
                                  borderRadius: "10px",
                                  backgroundColor: "#e9ecef",
                                }}
                              >
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <span
                                className="ms-2 small text-muted"
                                style={{ width: "35px" }}
                              >
                                {Math.round(percent)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default DetailedReportsPage;
