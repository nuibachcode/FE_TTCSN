import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Alert,
  Row,
  Col,
  Container,
  Badge,
  Spinner,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

// --- CẤU HÌNH MÀU SẮC & STYLE ---
const PRIMARY_COLOR = "#00b5ad";
const BG_LIGHT = "#f8f9fa";
const ACTIVE_SERVICE_BG = "#e6fffa";
const ACTIVE_SERVICE_BORDER = "#00b5ad";

const Booking = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);

  // State này dùng để chứa danh sách giờ đã được "băm" nhỏ
  const [availableSlots, setAvailableSlots] = useState([]);

  const [bookingData, setBookingData] = useState({
    specialtyId: "",
    doctorId: "",
    selectedDate: new Date(),
    scheduleId: null, // ID của lịch gốc trong DB
    timeStart: "", // Giờ bắt đầu của slot nhỏ (ví dụ 08:00)
    timeEnd: "", // Giờ kết thúc của slot nhỏ (ví dụ 10:00)
    serviceIds: [],
    totalPrice: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [user, setUser] = useState(null);

  // --- XỬ LÝ CUỘN LÊN ĐẦU KHI ĐẶT THÀNH CÔNG ---
  useEffect(() => {
    if (isBooked) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isBooked]);

  // --- INIT DATA ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      const isconfirm = window.confirm("Bạn cần đăng nhập để đặt lịch!");
      if (isconfirm) {
        navigate("/account/login");
      } else {
        navigate("/");
      }
      return;
    }
    setUser(storedUser);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resDoctor, resService, resSpecialty] = await Promise.all([
        axios.get("http://localhost:8081/api/doctor-info"),
        axios.get("http://localhost:8081/api/services"),
        axios.get("http://localhost:8081/api/specialties"),
      ]);

      if (resDoctor.data.EC === 0) setDoctors(resDoctor.data.DT);
      if (resService.data.EC === 0) setServices(resService.data.DT);
      if (resSpecialty.data.EC === 0) {
        const formatted = resSpecialty.data.DT.map((item) => ({
          id: item.id,
          name: item.nameSpecialty,
        }));
        setSpecialties(formatted);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // --- FETCH SCHEDULE & XỬ LÝ CHIA GIỜ ---
  useEffect(() => {
    if (bookingData.doctorId && bookingData.selectedDate) {
      fetchSchedule();
    }
  }, [bookingData.doctorId, bookingData.selectedDate]);

  const fetchSchedule = async () => {
    try {
      const dateString = moment(bookingData.selectedDate).format("YYYY-MM-DD");
      const res = await axios.get(
        `http://localhost:8081/api/schedule-by-date?doctorId=${bookingData.doctorId}&date=${dateString}`
      );
      if (res.data.EC === 0) {
        // Gọi hàm xử lý chia nhỏ giờ từ dữ liệu gốc
        const generatedSlots = generateTimeSlots(res.data.DT);
        setAvailableSlots(generatedSlots);

        // Reset giờ khi đổi ngày
        setBookingData((prev) => ({
          ...prev,
          scheduleId: null,
          timeStart: "",
          timeEnd: "",
        }));
      }
    } catch (error) {
      console.log("Error fetching schedule:", error);
    }
  };

  // --- HÀM CHIA NHỎ GIỜ (2 TIẾNG 1 KHUNG) ---
  const generateTimeSlots = (originalSchedules) => {
    let slots = [];

    // Duyệt qua từng lịch gốc (thường là 1 cục 08:00 - 17:00)
    originalSchedules.forEach((schedule) => {
      // Lấy giờ bắt đầu và kết thúc (ví dụ lấy số 8 và 17 từ chuỗi "08:00")
      let startHour = parseInt(schedule.timeStart.split(":")[0]);
      let endHour = parseInt(schedule.timeEnd.split(":")[0]);

      // Vòng lặp cộng dồn 2 tiếng mỗi lần
      for (let h = startHour; h < endHour; h += 2) {
        // Kiểm tra nếu cộng thêm 2 tiếng mà vẫn nằm trong giờ làm việc
        if (h + 2 <= endHour) {
          slots.push({
            originalScheduleId: schedule.id, // Giữ lại ID của lịch gốc để gửi API
            displayTime: `${h}:00 - ${h + 2}:00`, // Hiển thị UI
            timeStart: `${h.toString().padStart(2, "0")}:00`, // Format 08:00
            timeEnd: `${(h + 2).toString().padStart(2, "0")}:00`, // Format 10:00
          });
        }
      }
    });
    return slots;
  };

  // --- CALCULATE PRICE ---
  useEffect(() => {
    const total = bookingData.serviceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service ? Number(service.price) : 0);
    }, 0);
    setBookingData((prev) => ({ ...prev, totalPrice: total }));
  }, [bookingData.serviceIds, services]);

  // --- HANDLERS ---
  const filteredDoctors = doctors.filter((d) => {
    if (!bookingData.specialtyId) return false;
    return d.specialtyId == bookingData.specialtyId;
  });

  const handleServiceToggle = (id) => {
    const serviceId = parseInt(id);
    setBookingData((prev) => {
      const isSelected = prev.serviceIds.includes(serviceId);
      const newIds = isSelected
        ? prev.serviceIds.filter((s) => s !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newIds };
    });
  };

  // Khi click vào slot nhỏ
  const handleSlotClick = (slot) => {
    setBookingData((prev) => ({
      ...prev,
      scheduleId: slot.originalScheduleId, // Vẫn dùng ID gốc của DB
      timeStart: slot.timeStart, // Dùng giờ đã chia nhỏ
      timeEnd: slot.timeEnd, // Dùng giờ đã chia nhỏ
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.scheduleId || bookingData.serviceIds.length === 0) {
      alert("Vui lòng chọn Dịch vụ và Giờ khám!");
      return;
    }
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        patientId: user.id,
        doctorId: bookingData.doctorId,
        scheduleId: bookingData.scheduleId,
        dateBooking: moment(bookingData.selectedDate).format("YYYY-MM-DD"),
        timeStart: bookingData.timeStart, // Gửi lên giờ start của slot nhỏ (ví dụ 08:00)
        timeEnd: bookingData.timeEnd, // Gửi lên giờ end của slot nhỏ (ví dụ 10:00)
        services: bookingData.serviceIds,
        description: `Đặt khám qua Web - Chuyên khoa ${
          specialties.find((s) => s.id == bookingData.specialtyId)?.name
        }`,
      };

      const res = await axios.post(
        "http://localhost:8081/api/bookings",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.EC === 0) {
        setIsBooked(true);
        // Lưu ý: useEffect ở trên sẽ bắt sự kiện isBooked=true để cuộn trang
      } else {
        alert(res.data.EM);
      }
    } catch (error) {
      console.log("Error booking:", error);
      alert("Lỗi hệ thống, vui lòng thử lại sau.");
    }
    setIsProcessing(false);
  };

  // --- RENDER SUCCESS ---
  if (isBooked) {
    return (
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "80vh", marginTop: "50px" }}
      >
        <Card
          className="text-center p-5 shadow-lg border-0 rounded-5"
          style={{ maxWidth: "600px" }}
        >
          <div className="mb-4 text-success display-1">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 className="fw-bold mb-3">Đặt Lịch Thành Công!</h2>
          <p className="text-muted mb-4">
            Cảm ơn <strong>{user?.fullName}</strong>. Chúng tôi đã ghi nhận lịch
            hẹn của bạn. Vui lòng đến đúng giờ để được phục vụ tốt nhất.
          </p>
          <div className="d-grid gap-2 col-8 mx-auto">
            <Button variant="outline-primary" as={Link} to="/patient/history">
              Xem lịch sử đặt lịch
            </Button>
            <Button
              variant="link"
              as={Link}
              to="/"
              className="text-decoration-none"
            >
              Về trang chủ
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // --- RENDER FORM ---
  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        paddingTop: "100px",
        paddingBottom: "50px",
      }}
    >
      <Container style={{ maxWidth: "1400px" }}>
        <div className="text-center mb-5">
          <h2 className="fw-bold text-uppercase" style={{ color: "#333" }}>
            Đăng Ký Khám Bệnh
          </h2>
          <p className="text-muted">
            Điền thông tin và chọn lịch phù hợp với bạn
          </p>
        </div>

        <Form onSubmit={handleBookingSubmit}>
          <Row className="g-4">
            {/* --- CỘT TRÁI: THÔNG TIN KHÁM --- */}
            <Col lg={20}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 d-flex align-items-center">
                    <span
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: 30, height: 30, fontSize: 14 }}
                    >
                      1
                    </span>
                    Thông Tin Chuyên Khoa
                  </h5>

                  {/* 1. Chọn Chuyên khoa */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      Chuyên khoa
                    </Form.Label>
                    <Form.Select
                      size="lg"
                      value={bookingData.specialtyId}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          specialtyId: e.target.value,
                          doctorId: "",
                          scheduleId: null,
                        })
                      }
                      className="border-0 bg-light fw-bold text-primary"
                      required
                    >
                      <option value="">-- Chọn Chuyên khoa --</option>
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* 2. Chọn Bác sĩ */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      Bác sĩ phụ trách
                    </Form.Label>
                    <Form.Select
                      size="lg"
                      value={bookingData.doctorId}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          doctorId: e.target.value,
                          scheduleId: null,
                        })
                      }
                      disabled={!bookingData.specialtyId}
                      className="border-0 bg-light fw-bold text-dark"
                      required
                    >
                      <option value="">-- Chọn Bác sĩ --</option>
                      {filteredDoctors.map((d) => (
                        <option key={d.id} value={d.doctorId}>
                          {d.User ? d.User.fullName : "Bác sĩ"} ({d.lever})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* 3. Chọn Dịch vụ (Dạng Card) */}
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted mb-3">
                      Dịch vụ mong muốn
                    </Form.Label>

                    {!bookingData.specialtyId ? (
                      <Alert variant="warning" className="small border-0">
                        <i className="fas fa-arrow-up me-2"></i>Vui lòng chọn
                        chuyên khoa trước
                      </Alert>
                    ) : (
                      <div
                        style={{
                          maxHeight: "400px",
                          overflowY: "auto",
                          paddingRight: "5px",
                        }}
                      >
                        {services
                          .filter(
                            (s) => s.specialtyId == bookingData.specialtyId
                          )
                          .map((service) => {
                            const isSelected = bookingData.serviceIds.includes(
                              service.id
                            );
                            return (
                              <div
                                key={service.id}
                                onClick={() => handleServiceToggle(service.id)}
                                className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 transition-all"
                                style={{
                                  backgroundColor: isSelected
                                    ? ACTIVE_SERVICE_BG
                                    : "#fff",
                                  border: `1px solid ${
                                    isSelected ? ACTIVE_SERVICE_BORDER : "#eee"
                                  }`,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                <div>
                                  <div
                                    className={`fw-bold ${
                                      isSelected ? "text-primary" : "text-dark"
                                    }`}
                                  >
                                    {service.nameService}
                                  </div>
                                  <small className="text-muted">
                                    {service.duration}
                                  </small>
                                </div>
                                <div className="text-end">
                                  <Badge
                                    bg={isSelected ? "primary" : "light"}
                                    text={isSelected ? "light" : "dark"}
                                    className="py-2 px-3 rounded-pill"
                                  >
                                    {service.price.toLocaleString("vi-VN")} đ
                                  </Badge>
                                  {isSelected && (
                                    <div className="text-primary small mt-1">
                                      <i className="fas fa-check-circle"></i>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        {services.filter(
                          (s) => s.specialtyId == bookingData.specialtyId
                        ).length === 0 && (
                          <p className="text-muted text-center py-3">
                            Chưa có dịch vụ cho khoa này.
                          </p>
                        )}
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            {/* --- CỘT PHẢI: NGÀY GIỜ & THANH TOÁN --- */}
            <Col lg={20}>
              <div className="sticky-top" style={{ top: "100px", zIndex: 1 }}>
                {/* 1. Chọn Ngày */}
                <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                  <div className="bg-primary p-3 text-white text-center">
                    <h6 className="m-0 fw-bold text-uppercase">
                      Chọn Ngày Khám
                    </h6>
                  </div>
                  <Card.Body className="p-4 d-flex justify-content-center bg-white">
                    <DatePicker
                      selected={bookingData.selectedDate}
                      onChange={(date) =>
                        setBookingData({ ...bookingData, selectedDate: date })
                      }
                      minDate={new Date()}
                      inline
                      disabled={!bookingData.doctorId}
                    />
                  </Card.Body>
                </Card>

                {/* 2. Chọn Giờ - ĐÃ SỬA ĐỂ HIỆN CÁC KHUNG GIỜ NHỎ */}
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3 text-muted">Khung giờ trống</h6>
                    {bookingData.doctorId ? (
                      <div className="d-flex flex-wrap gap-2">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={
                                // So sánh thời gian bắt đầu để highlight nút đang chọn
                                bookingData.timeStart === slot.timeStart
                                  ? "primary"
                                  : "outline-secondary"
                              }
                              className="rounded-pill py-2 px-3 fw-semibold"
                              onClick={() => handleSlotClick(slot)}
                              style={{ fontSize: "0.9rem" }}
                            >
                              {slot.timeStart}
                            </Button>
                          ))
                        ) : (
                          <Alert
                            variant="secondary"
                            className="w-100 text-center border-0 small py-3 m-0"
                          >
                            Bác sĩ không có lịch vào ngày này.
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <p className="small text-muted fst-italic">
                        Vui lòng chọn bác sĩ để xem lịch.
                      </p>
                    )}
                  </Card.Body>
                </Card>

                {/* 3. Tổng kết & Nút bấm */}
                <Card className="border-0 shadow rounded-4 bg-white">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Tổng chi phí dự kiến</span>
                      <span className="fs-4 fw-bold text-danger">
                        {bookingData.totalPrice.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4 small text-muted">
                      <span>
                        <i className="far fa-calendar-alt me-2"></i>
                        {moment(bookingData.selectedDate).format("DD/MM/YYYY")}
                      </span>
                      <span>
                        <i className="far fa-clock me-2"></i>
                        {/* Hiển thị giờ bắt đầu - giờ kết thúc */}
                        {bookingData.timeStart
                          ? `${bookingData.timeStart} - ${bookingData.timeEnd}`
                          : "--:--"}
                      </span>
                    </div>

                    <Button
                      onClick={handleBookingSubmit}
                      disabled={
                        isProcessing ||
                        !bookingData.scheduleId ||
                        bookingData.serviceIds.length === 0
                      }
                      variant="warning"
                      size="lg"
                      className="w-100 text-white fw-bold py-3 rounded-3 shadow-sm text-uppercase"
                      style={{ background: "#ffc107", border: "none" }}
                    >
                      {isProcessing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Xác nhận đặt lịch"
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default Booking;
