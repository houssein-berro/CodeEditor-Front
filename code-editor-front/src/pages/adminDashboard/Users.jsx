import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import "./Users.css";
import axios from "axios";
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import FileUploadPopup from '../../components/fileUploader/fileUploader';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/");
        if (response.data) {
          setUsers(Array.isArray(response.data) ? response.data : response.data[0]);
          console.log(response);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const handleFileImport = async (data) => {
    const validData = [];
    const emailSet = new Set();
    const errors = [];

    console.log("Imported Data:", data);

    data.forEach((row, index) => {
      const { name, email, password } = row;

      if (!name) {
        errors.push(`Row ${index + 1}: Name is required (Row content: ${JSON.stringify(row)})`);
      }
      if (!email) {
        errors.push(`Row ${index + 1}: Email is required (Row content: ${JSON.stringify(row)})`);
      }
      if (!password) {
        errors.push(`Row ${index + 1}: Password is required (Row content: ${JSON.stringify(row)})`);
      }

      if (!name || !email || !password) {
        return;
      }

      if (!validateEmail(email)) {
        errors.push(`Row ${index + 1}: Invalid email format: ${email}`);
        return;
      }

      if (emailSet.has(email)) {
        errors.push(`Row ${index + 1}: Duplicate email found: ${email}`);
        return;
      }

      emailSet.add(email);
      validData.push({ name, email, password });
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/bulk-import", validData);
      if (response.data.success) {
        toast.success("Users imported successfully");
        setUsers([...users, ...response.data.users]);
      } else {
        console.error("Backend validation errors:", response.data.errors);
        response.data.errors.forEach((error, index) => {
          Object.values(error).forEach((msg) => {
            toast.error(`Row ${index + 1}: ${msg}`);
          });
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Detailed error response:", error.response.data.errors);
        error.response.data.errors.forEach((error, index) => {
          Object.values(error).forEach((msg) => {
            toast.error(`Row ${index + 1}: ${msg}`);
          });
        });
      } else {
        toast.error("Error importing users");
        console.error("Error importing users:", error);
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+$/;
    return re.test(email);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "created_at", headerName: "Registered At", flex: 1,
      renderCell: (params)=> {
        const date = new Date(params.row.created_at);
        return isNaN(date) ? '' : format(date, 'yyyy-MM-dd');
      }
    },
  ];

  const rows = Array.isArray(users) ? users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  })) : [];

  return (
    <div style={{ padding: "20px" }}>
      <div className="container">
        <h1
          style={{
            color: "#fff",
            fontSize: "36px",
            fontWeight: "bold",
          }}
        >
          All Users
        </h1>
        <button className="btn" onClick={() => setShowPopup(true)}>Import</button>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Import Users</h2>
              <FileUploadPopup onFileImport={handleFileImport} />
              <button className="btn" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      <div
        className="scrollbar" // Apply the custom scrollbar class
        style={{
          height: "70vh",
          width: "100%",
          backgroundColor: "#2e4a43",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          color: "#fff"
        }}
      >
        {users && (
          <DataGrid
            columns={columns}
            rows={rows}
            slots={{ toolbar: GridToolbar }}
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
                fontFamily: "Arial, sans-serif",
                color: "#fff"
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
                color: "#fff"
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#1a73e8",
                color: "#204E45",
                fontSize: "16px",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#3b6b5b",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#4e9d84",
              },
              "& .MuiDataGrid-toolbarContainer": {
                justifyContent: "flex-end",
                padding: "10px",
                backgroundColor: "#2e4a43",
                color: "#8FD6B3",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#8FD6B3",
                color: "#fff"
              },
              "& .MuiDataGrid-virtualScroller": {
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              },
              "& .MuiDataGrid-toolbarIcon": {
                color: "#8FD6B3",
              },
              "& .MuiButtonBase-root": {
                color: "#8FD6B3",
              },
              "& .MuiDataGrid-selectedRowCount": {
                color: "#fff",
              },
              "& .MuiPaginationItem-root": {
                color: "#fff",
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#4e9d84",
                color: "#fff",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
