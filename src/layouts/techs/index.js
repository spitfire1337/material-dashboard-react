import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Card,
  Grid,
  Modal,
  TextField,
  FormControlLabel,
  Checkbox,
  Icon,
  IconButton,
} from "@mui/material";
import DataTable from "react-data-table-component";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

function Techs() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [techs, setTechs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTech, setNewTech] = useState({
    displayName: "",
    mail: "",
    jobTitle: "",
    extension: "",
    isAdmin: false,
    isTech: true,
    isDev: false,
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  const getTechs = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getTechs", {}, (res) => {
        if (res.res === 200) {
          setTechs(res.data);
        }
        setShowLoad(false);
      });
    }
  };

  useEffect(() => {
    if (socket) getTechs();
  }, [socket]);

  const handleSave = () => {
    if (!newTech.displayName || !newTech.mail) {
      setSnackBar({
        type: "error",
        message: "Name and Email are required",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    const event = isEditing ? "updateTech" : "createTech";
    socket.emit(event, newTech, (res) => {
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          message: isEditing ? "Tech updated" : "Tech created",
          show: true,
          icon: "check",
        });
        setShowModal(false);
        getTechs();
      } else {
        setSnackBar({
          type: "error",
          message: res.message || "Error saving tech",
          show: true,
          icon: "warning",
        });
      }
      setShowLoad(false);
    });
  };

  const handleEdit = (row) => {
    setNewTech({ ...row });
    setIsEditing(true);
    setShowModal(true);
  };

  const columns = [
    { name: "Name", selector: (row) => row.displayName, sortable: true },
    {
      name: "Title",
      selector: (row) => row.jobTitle,
      sortable: true,
    },
    { name: "Email", selector: (row) => row.mail, sortable: true },
    { name: "Extension", selector: (row) => row.extension, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <IconButton onClick={() => handleEdit(row)} color="info">
          <Icon>edit</Icon>
        </IconButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Manage Techs
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable columns={columns} data={techs} pagination />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <MDBox sx={style}>
          <MDTypography variant="h6" mb={2}>
            Edit Tech
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={newTech.displayName || ""} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" value={newTech.mail || ""} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Job Title" value={newTech.jobTitle || ""} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Extension"
                value={newTech.extension || ""}
                onChange={(e) => setNewTech({ ...newTech, extension: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newTech.isActive}
                    onChange={(e) => setNewTech({ ...newTech, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <MDButton fullWidth color="success" onClick={handleSave}>
                Save
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Modal>
    </DashboardLayout>
  );
}

export default Techs;
