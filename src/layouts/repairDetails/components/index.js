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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Icon,
} from "@mui/material";
import DataTable from "react-data-table-component";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

function Checklist() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    repairType: "",
    deviceType: "",
  });

  const repairTypes = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];
  const deviceTypes = ["EUC", "Scooter", "OneWheel", "Ebike", "Emoto", "Eskate"];

  const columns = [
    { name: "Question", selector: (row) => row.question, sortable: true, wrap: true },
    { name: "Repair Type", selector: (row) => row.repairType, sortable: true },
    { name: "Device Type", selector: (row) => row.deviceType, sortable: true },
  ];

  const getQuestions = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getChecklistQuestions", {}, (res) => {
        if (res.res === 200) {
          setQuestions(res.data);
        }
        setShowLoad(false);
      });
    }
  };

  useEffect(() => {
    if (socket) getQuestions();
  }, [socket]);

  const addQuestion = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("addChecklistQuestion", newQuestion, (res) => {
        if (res.res === 200) {
          setSnackBar({
            type: "success",
            title: "Success",
            message: "Question added",
            show: true,
            icon: "check",
          });
          setShowModal(false);
          setNewQuestion({ question: "", repairType: "", deviceType: "" });
          getQuestions();
        } else {
          setSnackBar({
            type: "error",
            title: "Error",
            message: "Error adding question",
            show: true,
            icon: "warning",
          });
        }
        setShowLoad(false);
      });
    }
  };

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
              >
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <MDTypography variant="h6" color="white">
                      Checklist Questions
                    </MDTypography>
                  </Grid>
                  <Grid item>
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={() => setShowModal(true)}
                    >
                      Add Question
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable columns={columns} data={questions} pagination />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          <MDTypography id="modal-modal-title" variant="h6" component="h2">
            Add New Question
          </MDTypography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Repair Type</InputLabel>
                <Select
                  value={newQuestion.repairType}
                  label="Repair Type"
                  onChange={(e) => setNewQuestion({ ...newQuestion, repairType: e.target.value })}
                  sx={{ height: "44px" }}
                >
                  {repairTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Device Type</InputLabel>
                <Select
                  value={newQuestion.deviceType}
                  label="Device Type"
                  onChange={(e) => setNewQuestion({ ...newQuestion, deviceType: e.target.value })}
                  sx={{ height: "44px" }}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <MDButton fullWidth color="success" onClick={addQuestion}>
                Save
              </MDButton>
            </Grid>
            <Grid item xs={6}>
              <MDButton fullWidth color="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Modal>
    </DashboardLayout>
  );
}

export default Checklist;
