import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "react-data-table-component";

function AppSettings() {
  const socket = useSocket();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [settings, setSettings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  // New/Edit setting state
  const [formData, setFormData] = useState({
    module: "",
    section: "",
    group: "",
    setting: {
      name: "",
      key: "",
      description: "",
      required: false,
    },
    inputType: "text",
    value: "",
    selectOptions: [], // for select
    isActive: true,
    sequence: 0,
  });

  const [optionInput, setOptionInput] = useState("");

  const fetchSettings = () => {
    if (!socket) return;
    setShowLoad(true);
    socket.emit("getAppSettings", {}, (res) => {
      setShowLoad(false);
      if (res.res === 200) {
        setSettings(res.data);
      }
    });
  };

  useEffect(() => {
    if (socket) {
      fetchSettings();
    }
  }, [socket]);

  const handleOpenModal = (setting = null) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        module: setting.module || "",
        section: setting.section || "",
        group: setting.group || "",
        setting: {
          name: setting.setting?.name || "",
          key: setting.setting?.key || "",
          description: setting.setting?.description || "",
          required: setting.setting?.required || false,
        },
        inputType: setting.inputType || "text",
        value: setting.value,
        selectOptions: setting.selectOptions || [],
        isActive: setting.isActive !== undefined ? setting.isActive : true,
        sequence: setting.sequence || 0,
      });
    } else {
      setEditingSetting(null);
      setFormData({
        module: "",
        section: "",
        group: "",
        setting: {
          name: "",
          key: "",
          description: "",
          required: false,
        },
        inputType: "text",
        value: "",
        selectOptions: [],
        isActive: true,
        sequence: 0,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.setting.key || !formData.setting.name) {
      setSnackBar({ type: "error", message: "Key and Name are required", show: true });
      return;
    }

    setShowLoad(true);
    const payload = { ...formData };
    if (editingSetting) {
      payload._id = editingSetting._id;
    }

    const event = editingSetting ? "updateAppSetting" : "createAppSetting";

    socket.emit(event, payload, (res) => {
      setShowLoad(false);
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          message: `Setting ${editingSetting ? "updated" : "created"} successfully`,
          show: true,
        });
        setShowModal(false);
        fetchSettings();
      } else {
        setSnackBar({ type: "error", message: res.message || "Error saving setting", show: true });
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      setShowLoad(true);
      socket.emit("deleteAppSetting", { id }, (res) => {
        setShowLoad(false);
        if (res.res === 200) {
          setSnackBar({ type: "success", message: "Setting deleted", show: true });
          fetchSettings();
        } else {
          setSnackBar({ type: "error", message: "Error deleting setting", show: true });
        }
      });
    }
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        selectOptions: [...prev.selectOptions, optionInput.trim()],
      }));
      setOptionInput("");
    }
  };

  const handleRemoveOption = (optToRemove) => {
    setFormData((prev) => ({
      ...prev,
      selectOptions: prev.selectOptions.filter((o) => o !== optToRemove),
    }));
  };

  const columns = [
    { name: "Module", selector: (row) => row.module, sortable: true },
    { name: "Section", selector: (row) => row.section, sortable: true },
    { name: "Name", selector: (row) => row.setting?.name, sortable: true },
    { name: "Key", selector: (row) => row.setting?.key, sortable: true },
    { name: "Type", selector: (row) => row.inputType, sortable: true },
    {
      name: "Value",
      selector: (row) => {
        if (row.inputType === "boolean") return row.value ? "True" : "False";
        return row.value;
      },
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <MDBox>
          <IconButton color="info" onClick={() => handleOpenModal(row)}>
            <Icon>edit</Icon>
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row._id)}>
            <Icon>delete</Icon>
          </IconButton>
        </MDBox>
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
                  App Settings
                </MDTypography>
                <MDButton variant="gradient" color="dark" onClick={() => handleOpenModal()}>
                  <Icon>add</Icon>&nbsp;Add Setting
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <DataTable columns={columns} data={settings} pagination />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingSetting ? "Edit Setting" : "Add New Setting"}</DialogTitle>
        <DialogContent>
          <MDBox component="form" role="form" pt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Module"
                  fullWidth
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Section"
                  fullWidth
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Label"
                  fullWidth
                  value={formData.setting.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      setting: { ...formData.setting, name: e.target.value },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Key (Internal ID)"
                  fullWidth
                  value={formData.setting.key}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      setting: { ...formData.setting, key: e.target.value },
                    })
                  }
                  disabled={!!editingSetting}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.inputType}
                    label="Type"
                    onChange={(e) =>
                      setFormData({ ...formData, inputType: e.target.value, value: "" })
                    }
                    disabled={!!editingSetting}
                    sx={{ height: "44px" }}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="select">Select (Dropdown)</MenuItem>
                    <MenuItem value="longtext">Long Text</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Sequence"
                  type="number"
                  fullWidth
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                />
              </Grid>

              {formData.inputType === "select" && (
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography variant="caption">Options</MDTypography>
                    <MDBox display="flex" gap={1} mb={1}>
                      <TextField
                        label="Add Option"
                        size="small"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                      />
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={handleAddOption}
                      >
                        Add
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                      {formData.selectOptions.map((opt, i) => (
                        <Chip key={i} label={opt} onDelete={() => handleRemoveOption(opt)} />
                      ))}
                    </MDBox>
                  </MDBox>
                </Grid>
              )}

              <Grid item xs={12}>
                {formData.inputType === "boolean" ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.value === true || formData.value === "true"}
                        onChange={(e) => setFormData({ ...formData, value: e.target.checked })}
                      />
                    }
                    label="Value"
                  />
                ) : formData.inputType === "select" ? (
                  <FormControl fullWidth>
                    <InputLabel>Value</InputLabel>
                    <Select
                      value={formData.value}
                      label="Value"
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      sx={{ height: "44px" }}
                    >
                      {formData.selectOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Value"
                    fullWidth
                    multiline={formData.inputType === "longtext"}
                    rows={formData.inputType === "longtext" ? 4 : 1}
                    type={formData.inputType === "number" ? "number" : "text"}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.setting.required}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          setting: { ...formData.setting, required: e.target.checked },
                        })
                      }
                    />
                  }
                  label="Required"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowModal(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSave} color="info">
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default AppSettings;
