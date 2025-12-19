import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
  Tabs,
  Tab,
  Pagination, // Thêm Pagination
} from "react-bootstrap";
import axios from "axios";

const ROLES = {
  1: "Admin",
  2: "Doctor",
  3: "Patient",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [key, setKey] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8081/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.EC === 0) {
        // SẮP XẾP: ID lớn nhất (người mới nhất) lên đầu
        const sortedUsers = res.data.DT.sort((a, b) => b.id - a.id);
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.log("Lỗi lấy users:", error);
    }
    setIsLoading(false);
  };

  const handleUpdateRole = async (userId, newRoleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:8081/api/users/${userId}/role`,
        { roleId: newRoleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        alert("Cập nhật quyền thành công!");
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(res.data.EM);
      }
    } catch (error) {
      alert("Lỗi khi cập nhật quyền");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA vĩnh viễn user này?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:8081/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.EC === 0) {
        alert("Đã xóa thành công!");
        fetchUsers();
      } else {
        alert(res.data.EM);
      }
    } catch (error) {
      alert("Lỗi khi xóa user");
    }
  };

  // --- Component Bảng User (ĐÃ TÍCH HỢP PHÂN TRANG) ---
  const UserTable = ({
    data,
    editingUser,
    setEditingUser,
    handleUpdateRole,
    handleDeleteUser,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset về trang 1 mỗi khi dữ liệu thay đổi (tức là khi chuyển Tab)
    useEffect(() => {
      setCurrentPage(1);
    }, [data]);

    // --- LOGIC PHÂN TRANG ---
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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

    return (
      // Container Flex để cố định footer
      <div className="d-flex flex-column" style={{ minHeight: "500px" }}>
        <div className="flex-grow-1">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <tr key={user.id} style={{ height: "65px" }}>
                    {" "}
                    {/* Cố định chiều cao dòng */}
                    <td>#{user.id}</td>
                    <td className="fw-bold text-primary">{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "--"}</td>
                    <td>
                      {editingUser === user.id ? (
                        <Form.Select
                          defaultValue={user.roleId}
                          onChange={(e) =>
                            handleUpdateRole(user.id, e.target.value)
                          }
                          size="sm"
                          autoFocus
                        >
                          <option value="1">Admin</option>
                          <option value="2">Doctor</option>
                          <option value="3">Patient</option>
                        </Form.Select>
                      ) : (
                        <Badge
                          bg={
                            user.roleId === 1
                              ? "danger"
                              : user.roleId === 2
                              ? "primary"
                              : "success"
                          }
                          className="px-3 py-2"
                        >
                          {ROLES[user.roleId] || "Unknown"}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="light"
                        size="sm"
                        className="me-2 text-warning border-warning"
                        onClick={() => setEditingUser(user.id)}
                        disabled={editingUser === user.id}
                        title="Sửa quyền"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger border-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Xóa user"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Không có dữ liệu
                  </td>
                </tr>
              )}

              {/* --- FILLER ROWS (Để bảng không bị co lại) --- */}
              {currentItems.length > 0 &&
                currentItems.length < itemsPerPage &&
                Array.from({ length: itemsPerPage - currentItems.length }).map(
                  (_, idx) => (
                    <tr key={`empty-${idx}`} style={{ height: "65px" }}>
                      <td colSpan="6"></td>
                    </tr>
                  )
                )}
            </tbody>
          </Table>
        </div>

        {/* --- THANH PHÂN TRANG --- */}
        {data.length > itemsPerPage && (
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
  };

  return (
    <Container fluid className="py-4">
      <h3 className="text-primary fw-bold mb-4">
        <i className="bi bi-people-fill me-2"></i>Quản lý Tài khoản & Phân quyền
      </h3>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Tabs
              id="user-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              <Tab eventKey="all" title={`Tất cả (${users.length})`}>
                <UserTable
                  data={users}
                  editingUser={editingUser}
                  setEditingUser={setEditingUser}
                  handleUpdateRole={handleUpdateRole}
                  handleDeleteUser={handleDeleteUser}
                />
              </Tab>
              <Tab
                eventKey="admin"
                title={`Quản trị viên (${
                  users.filter((u) => u.roleId === 1).length
                })`}
              >
                <UserTable
                  data={users.filter((u) => u.roleId === 1)}
                  editingUser={editingUser}
                  setEditingUser={setEditingUser}
                  handleUpdateRole={handleUpdateRole}
                  handleDeleteUser={handleDeleteUser}
                />
              </Tab>
              <Tab
                eventKey="doctor"
                title={`Bác sĩ (${users.filter((u) => u.roleId === 2).length})`}
              >
                <UserTable
                  data={users.filter((u) => u.roleId === 2)}
                  editingUser={editingUser}
                  setEditingUser={setEditingUser}
                  handleUpdateRole={handleUpdateRole}
                  handleDeleteUser={handleDeleteUser}
                />
              </Tab>
              <Tab
                eventKey="patient"
                title={`Bệnh nhân (${
                  users.filter((u) => u.roleId === 3).length
                })`}
              >
                <UserTable
                  data={users.filter((u) => u.roleId === 3)}
                  editingUser={editingUser}
                  setEditingUser={setEditingUser}
                  handleUpdateRole={handleUpdateRole}
                  handleDeleteUser={handleDeleteUser}
                />
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagement;
