import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Spinner,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import moment from "moment";

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const ScheduleManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [maxPatient, setMaxPatient] = useState(5);
  const [schedules, setSchedules] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Tabs
  const [key, setKey] = useState("upcoming"); // 'upcoming' | 'past'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Hiển thị 5 ngày trên 1 trang

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user && user.id) fetchSchedules();
  }, []);

  // Reset về trang 1 khi đổi Tab
  useEffect(() => {
    setCurrentPage(1);
  }, [key]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8081/api/schedules/doctor?doctorId=${user.id}`
      );
      if (res.data.EC === 0) setSchedules(res.data.DT);
    } catch (e) {
      console.log("Lỗi lấy lịch:", e);
    }
    setIsLoading(false);
  };

  // --- XỬ LÝ GOM NHÓM DỮ LIỆU ---
  const groupedSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return { upcoming: [], past: [] };

    // 1. Gom nhóm theo ngày (Key là ngày string "YYYY-MM-DD")
    const groups = schedules.reduce((acc, curr) => {
      const dateKey = moment(curr.dateWork).format("YYYY-MM-DD");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(curr);
      return acc;
    }, {});

    // 2. Chuyển object thành array để dễ sort và map
    const groupArray = Object.keys(groups).map((date) => ({
      date: date,
      items: groups[date].sort((a, b) =>
        a.timeStart.localeCompare(b.timeStart)
      ), // Sort giờ tăng dần
    }));

    // 3. Tách lịch Sắp tới và Lịch sử
    const today = moment().startOf("day");
    const upcoming = [];
    const past = [];

    groupArray.forEach((group) => {
      if (moment(group.date).isSameOrAfter(today)) {
        upcoming.push(group);
      } else {
        past.push(group);
      }
    });

    // 4. Sort ngày
    // Sắp tới: Ngày gần nhất lên đầu
    upcoming.sort((a, b) => moment(a.date).diff(moment(b.date)));
    // Lịch sử: Ngày mới nhất lên đầu
    past.sort((a, b) => moment(b.date).diff(moment(a.date)));

    return { upcoming, past };
  }, [schedules]);

  // --- PHÂN TRANG CHO DANH SÁCH NGÀY ---
  const targetList = groupedSchedules[key]; // Lấy list dựa theo Tab
  const totalPages = Math.ceil(targetList.length / itemsPerPage);
  const currentItems = targetList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!selectedDate || !timeRange.start || !timeRange.end) {
      alert("Vui lòng điền đủ thông tin!");
      return;
    }
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8081/api/schedules",
        {
          doctorId: user.id,
          dateWork: formattedDate,
          timeStart: timeRange.start,
          timeEnd: timeRange.end,
          maxPatient: parseInt(maxPatient),
          description: "Lịch khám bệnh",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        setStatusMsg({ type: "success", text: "Đăng ký lịch thành công!" });
        fetchSchedules();
      } else {
        setStatusMsg({ type: "danger", text: res.data.EM });
      }
    } catch (error) {
      setStatusMsg({ type: "danger", text: "Lỗi hệ thống" });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn muốn hủy khung giờ này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(
          `http://localhost:8081/api/schedules/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.EC === 0) {
          fetchSchedules(); // Reload data, useMemo sẽ tự tính lại group
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
      <h2 className="text-primary fw-bold mb-4">
        <i className="bi bi-calendar-check me-2"></i>Quản lý Lịch Làm Việc
      </h2>

      {statusMsg && <Alert variant={statusMsg.type}>{statusMsg.text}</Alert>}

      {/* --- PHẦN 1: ĐĂNG KÝ (GIỮ NGUYÊN) --- */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Header className="bg-success text-white fw-bold">
          <i className="bi bi-plus-circle-dotted me-2"></i>Đăng Ký Ca Làm Việc
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleCreateSchedule}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Label className="fw-bold text-muted">
                  Chọn Ngày
                </Form.Label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  minDate={new Date()}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold text-muted">Bắt đầu</Form.Label>
                <Form.Select
                  value={timeRange.start}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, start: e.target.value })
                  }
                  required
                >
                  <option value="">-- Giờ --</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold text-muted">Kết thúc</Form.Label>
                <Form.Select
                  value={timeRange.end}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, end: e.target.value })
                  }
                  required
                >
                  <option value="">-- Giờ --</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold text-muted">Max BN</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="20"
                  value={maxPatient}
                  onChange={(e) => setMaxPatient(e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold"
                >
                  Lưu Lịch
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* --- PHẦN 2: DANH SÁCH LỊCH (GIAO DIỆN MỚI) --- */}
      <Card className="shadow-sm border-0" style={{ minHeight: "500px" }}>
        <Card.Header className="bg-white pt-3 pb-0 border-0">
          <Tabs
            id="schedule-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-0"
          >
            <Tab eventKey="upcoming" title="📅 Lịch sắp tới"></Tab>
            <Tab eventKey="past" title=" Lịch sử"></Tab>
          </Tabs>
        </Card.Header>
        <Card.Body className="bg-light">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : currentItems.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {currentItems.map((group, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <Card.Body className="d-flex align-items-center">
                    {/* Cột Ngày Tháng */}
                    <div
                      className="pe-4 border-end"
                      style={{ minWidth: "150px" }}
                    >
                      <div className="text-uppercase text-muted small fw-bold">
                        {moment(group.date).format("dddd")}
                      </div>
                      <div className="fs-4 fw-bold text-primary">
                        {moment(group.date).format("DD/MM/YYYY")}
                      </div>
                    </div>

                    {/* Cột Danh sách giờ */}
                    <div className="ps-4 flex-grow-1">
                      <div className="fw-bold mb-2 text-secondary">
                        Các khung giờ làm việc:
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {group.items.map((slot) => (
                          <div key={slot.id} className="position-relative">
                            <Button
                              variant={
                                key === "upcoming"
                                  ? "outline-primary"
                                  : "outline-secondary"
                              }
                              className="fw-bold py-2 px-3"
                              style={{ cursor: "default" }}
                            >
                              {slot.timeStart} - {slot.timeEnd}
                              <Badge
                                bg="warning"
                                text="dark"
                                className="ms-2 rounded-pill"
                              >
                                {slot.maxPatient}
                              </Badge>
                            </Button>

                            {/* Nút xóa nhỏ gắn vào góc (Chỉ hiện cho lịch sắp tới) */}
                            {key === "upcoming" && (
                              <span
                                onClick={() => handleDelete(slot.id)}
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ cursor: "pointer", zIndex: 10 }}
                                title="Hủy giờ này"
                              >
                                <i className="bi bi-x"></i>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1"></i>
              <p className="mt-2">
                Không có lịch làm việc nào trong danh sách này.
              </p>
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

export default ScheduleManagement;
