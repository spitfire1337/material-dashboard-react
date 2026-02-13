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
  FormControlLabel,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DataTable from "react-data-table-component";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import moment from "moment";

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
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: {
      required: true,
      text: "",
    },
    repairType: "",
    deviceType: "",
    isActive: true,
    answerType: "",
    selectOptions: [],
    checklistType: "",
    sequence: 1,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });
  const [searchText, setSearchText] = useState("");
  const [filterDeviceType, setFilterDeviceType] = useState("");
  const [filterChecklistType, setFilterChecklistType] = useState("");
  const [filterRepairType, setFilterRepairType] = useState("");
  const [copyDialog, setCopyDialog] = useState({ open: false, question: null });
  const [copyTarget, setCopyTarget] = useState({
    repairType: "",
    deviceType: "",
    checklistType: "",
  });

  const repairTypes = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];
  const deviceTypes = ["EUC", "Scooter", "OneWheel", "Ebike", "Emoto", "Eskate"];
  const answerTypes = ["text", "select", "checkbox"];
  const checklistTypes = ["Pre-Repair", "In Progress", "Post-Repair"];

  const handleEdit = (row) => {
    setNewQuestion(row);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const executeDelete = async () => {
    const id = deleteConfirmation.id;
    setDeleteConfirmation({ open: false, id: null });
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Question deleted",
          show: true,
          icon: "check",
        });
        getQuestions();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error deleting question",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const handleCopy = (row) => {
    setCopyTarget({
      repairType: row.repairType,
      deviceType: row.deviceType,
      checklistType: row.checklistType,
    });
    setCopyDialog({ open: true, question: row });
  };

  const executeCopy = async () => {
    if (!copyTarget.repairType || !copyTarget.deviceType || !copyTarget.checklistType) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please select all types",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    try {
      const filtered = questions.filter(
        (q) =>
          q.repairType === copyTarget.repairType &&
          q.deviceType === copyTarget.deviceType &&
          q.checklistType === copyTarget.checklistType
      );
      let nextSeq = 1;
      if (filtered.length > 0) {
        const maxSeq = Math.max(...filtered.map((q) => parseInt(q.sequence) || 0));
        nextSeq = maxSeq + 1;
      }

      const newQ = {
        ...copyDialog.question,
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        addedBy: undefined,
        lastUpdatedBy: undefined,
        __v: undefined,
        repairType: copyTarget.repairType,
        deviceType: copyTarget.deviceType,
        checklistType: copyTarget.checklistType,
        sequence: nextSeq,
      };

      const response = await fetch(`${vars.serverUrl}/checklist/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQ),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Question copied successfully",
          show: true,
          icon: "check",
        });
        setCopyDialog({ open: false, question: null });
        getQuestions();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error copying question",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      console.error(e);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const columns = [
    { name: "Seq", selector: (row) => row.sequence, sortable: true, width: "80px" },
    {
      name: "Question",
      selector: (row) => row.question.text,
      sortable: true,
      wrap: true,
      cell: (row) => (
        <span>
          {row.question.text}
          {row.question.required && <span style={{ color: "red" }}> *</span>}
        </span>
      ),
    },
    { name: "Checklist Type", selector: (row) => row.checklistType, sortable: true },
    { name: "Repair Type", selector: (row) => row.repairType, sortable: true },
    { name: "Device Type", selector: (row) => row.deviceType, sortable: true },
    { name: "Answer Type", selector: (row) => row.answerType, sortable: true },
    { name: "Active", selector: (row) => (row.isActive ? "Yes" : "No"), sortable: true },
    {
      name: "Created",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => (
        <MDBox lineHeight={1}>
          <MDTypography display="block" variant="caption" fontWeight="medium">
            {row.addedBy}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {row.createdAt ? moment(row.createdAt).format("MM/DD/YYYY") : ""}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      name: "Updated",
      selector: (row) => row.updatedAt,
      sortable: true,
      cell: (row) => (
        <MDBox lineHeight={1}>
          <MDTypography display="block" variant="caption" fontWeight="medium">
            {row.lastUpdatedBy}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {row.updatedAt ? moment(row.updatedAt).format("MM/DD/YYYY") : ""}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <IconButton onClick={() => handleEdit(row)} color="info">
            <Icon>edit</Icon>
          </IconButton>
          <IconButton onClick={() => handleCopy(row)} color="primary" title="Copy Question">
            <Icon>content_copy</Icon>
          </IconButton>
          <IconButton onClick={() => handleDelete(row._id)} color="error">
            <Icon>delete</Icon>
          </IconButton>
        </>
      ),
    },
  ];

  const getQuestions = async () => {
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/checklist/questions`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setQuestions(res.data.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)));
      }
    } catch (error) {
      console.error(error);
    }
    setShowLoad(false);
  };

  useEffect(() => {
    getQuestions();
  }, []);

  useEffect(() => {
    if (
      !newQuestion._id &&
      newQuestion.repairType &&
      newQuestion.deviceType &&
      newQuestion.checklistType
    ) {
      const filtered = questions.filter(
        (q) =>
          q.repairType === newQuestion.repairType &&
          q.deviceType === newQuestion.deviceType &&
          q.checklistType === newQuestion.checklistType
      );
      let nextSeq = 1;
      if (filtered.length > 0) {
        const maxSeq = Math.max(...filtered.map((q) => parseInt(q.sequence) || 0));
        nextSeq = maxSeq + 1;
      }
      setNewQuestion((prev) => ({ ...prev, sequence: nextSeq }));
    }
  }, [newQuestion.repairType, newQuestion.deviceType, newQuestion.checklistType, questions]);

  const filteredQuestions = questions.filter((item) => {
    const matchesSearch =
      searchText === ""
        ? true
        : item.question && item.question.text
        ? item.question.text.toLowerCase().includes(searchText.toLowerCase())
        : false;
    const matchesDevice = filterDeviceType ? item.deviceType === filterDeviceType : true;
    const matchesChecklist = filterChecklistType
      ? item.checklistType === filterChecklistType
      : true;
    const matchesRepair = filterRepairType ? item.repairType === filterRepairType : true;

    return matchesSearch && matchesDevice && matchesChecklist && matchesRepair;
  });

  const saveQuestion = async () => {
    if (
      newQuestion.question.text === "" ||
      newQuestion.repairType === "" ||
      newQuestion.deviceType === "" ||
      newQuestion.answerType === "" ||
      !newQuestion.checklistType ||
      newQuestion.sequence === ""
    ) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please fill in all fields",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (
      newQuestion.answerType === "select" &&
      (newQuestion.selectOptions.length === 0 ||
        newQuestion.selectOptions.some((opt) => opt === ""))
    ) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please fill in all select options",
        show: true,
        icon: "warning",
      });
      return;
    }

    const sameTypeQuestions = questions.filter(
      (q) =>
        q._id !== newQuestion._id &&
        q.repairType === newQuestion.repairType &&
        q.deviceType === newQuestion.deviceType &&
        q.checklistType === newQuestion.checklistType
    );

    const collision = sameTypeQuestions.find(
      (q) => parseInt(q.sequence) === parseInt(newQuestion.sequence)
    );

    if (collision) {
      setShowLoad(true);
      const questionsToUpdate = sameTypeQuestions.filter(
        (q) => parseInt(q.sequence) >= parseInt(newQuestion.sequence)
      );
      questionsToUpdate.sort((a, b) => parseInt(b.sequence) - parseInt(a.sequence));

      try {
        for (const q of questionsToUpdate) {
          const updatedQ = { ...q, sequence: parseInt(q.sequence) + 1 };
          await fetch(`${vars.serverUrl}/checklist/updateSequence`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedQ),
            credentials: "include",
          });
        }
      } catch (e) {
        console.error("Error reordering sequences", e);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Failed to reorder sequences",
          show: true,
          icon: "warning",
        });
        setShowLoad(false);
        return;
      }
    }

    setShowLoad(true);
    try {
      let url = `${vars.serverUrl}/checklist/create`;
      if (newQuestion._id) {
        url = `${vars.serverUrl}/checklist/update`;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: newQuestion._id ? "Question updated" : "Question added",
          show: true,
          icon: "check",
        });
        setShowModal(false);
        setNewQuestion({
          question: { required: true, text: "" },
          repairType: "",
          deviceType: "",
          isActive: true,
          answerType: "",
          selectOptions: [],
          checklistType: "",
          sequence: 1,
        });
        getQuestions();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error saving question",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
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
                      onClick={() => {
                        setNewQuestion({
                          question: { required: true, text: "" },
                          repairType: filterRepairType || "",
                          deviceType: filterDeviceType || "",
                          isActive: true,
                          answerType: "",
                          selectOptions: [],
                          checklistType: filterChecklistType || "",
                          sequence: 1,
                        });
                        setShowModal(true);
                      }}
                    >
                      Add Question
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <Grid container spacing={2} px={2} pb={3}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Search Question"
                      variant="outlined"
                      fullWidth
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Device Type</InputLabel>
                      <Select
                        value={filterDeviceType}
                        label="Device Type"
                        onChange={(e) => setFilterDeviceType(e.target.value)}
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {deviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Checklist Type</InputLabel>
                      <Select
                        value={filterChecklistType}
                        label="Checklist Type"
                        onChange={(e) => setFilterChecklistType(e.target.value)}
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {checklistTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Repair Type</InputLabel>
                      <Select
                        value={filterRepairType}
                        label="Repair Type"
                        onChange={(e) => setFilterRepairType(e.target.value)}
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {repairTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <DataTable columns={columns} data={filteredQuestions} pagination />
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
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Seq"
                type="number"
                value={newQuestion.sequence}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, sequence: parseInt(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                label="Question"
                value={newQuestion.question.text}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question: { ...newQuestion.question, text: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Checklist Type</InputLabel>
                <Select
                  value={newQuestion.checklistType || ""}
                  label="Checklist Type"
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, checklistType: e.target.value })
                  }
                  sx={{ height: "44px" }}
                >
                  {checklistTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Answer Type</InputLabel>
                <Select
                  value={newQuestion.answerType}
                  label="Answer Type"
                  onChange={(e) => setNewQuestion({ ...newQuestion, answerType: e.target.value })}
                  sx={{ height: "44px" }}
                >
                  {answerTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {newQuestion.answerType === "select" && (
              <>
                <Grid item xs={12}>
                  <MDTypography variant="button" fontWeight="bold">
                    Select Options
                  </MDTypography>
                  {newQuestion.selectOptions.map((option, index) => (
                    <Grid container spacing={1} key={index} mt={1}>
                      <Grid item xs={10}>
                        <TextField
                          fullWidth
                          label={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.selectOptions];
                            newOptions[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, selectOptions: newOptions });
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <MDButton
                          color="error"
                          onClick={() => {
                            const newOptions = [...newQuestion.selectOptions];
                            newOptions.splice(index, 1);
                            setNewQuestion({ ...newQuestion, selectOptions: newOptions });
                          }}
                        >
                          <Icon>delete</Icon>
                        </MDButton>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <MDButton
                    color="info"
                    onClick={() =>
                      setNewQuestion({
                        ...newQuestion,
                        selectOptions: [...newQuestion.selectOptions, ""],
                      })
                    }
                    sx={{ mt: 2 }}
                  >
                    Add Option
                  </MDButton>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newQuestion.question.required}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: { ...newQuestion.question, required: e.target.checked },
                      })
                    }
                  />
                }
                label="Required Response"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newQuestion.isActive}
                    onChange={(e) => setNewQuestion({ ...newQuestion, isActive: e.target.checked })}
                  />
                }
                label="Question is active"
              />
            </Grid>
            <Grid item xs={6}>
              <MDButton fullWidth color="success" onClick={saveQuestion}>
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
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            Are you sure you want to delete this question?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteConfirmation({ open: false, id: null })}>No</MDButton>
          <MDButton onClick={executeDelete} color="error">
            Yes
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={copyDialog.open}
        onClose={() => setCopyDialog({ open: false, question: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Copy Question</DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <MDTypography variant="body2" fontWeight="bold" gutterBottom>
              Original Question:
            </MDTypography>
            <MDTypography variant="body2" gutterBottom mb={3}>
              {copyDialog.question?.question?.text}
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Repair Type</InputLabel>
                  <Select
                    value={copyTarget.repairType}
                    label="Target Repair Type"
                    onChange={(e) => setCopyTarget({ ...copyTarget, repairType: e.target.value })}
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Device Type</InputLabel>
                  <Select
                    value={copyTarget.deviceType}
                    label="Target Device Type"
                    onChange={(e) => setCopyTarget({ ...copyTarget, deviceType: e.target.value })}
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Checklist Type</InputLabel>
                  <Select
                    value={copyTarget.checklistType}
                    label="Target Checklist Type"
                    onChange={(e) =>
                      setCopyTarget({ ...copyTarget, checklistType: e.target.value })
                    }
                    sx={{ height: "44px" }}
                  >
                    {checklistTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={() => setCopyDialog({ open: false, question: null })}
            color="secondary"
          >
            Cancel
          </MDButton>
          <MDButton onClick={executeCopy} color="info">
            Copy
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Checklist;
