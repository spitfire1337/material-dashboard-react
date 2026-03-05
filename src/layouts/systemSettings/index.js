import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Icon,
  Divider,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function SystemSettings() {
  const socket = useSocket();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [settings, setSettings] = useState([]);
  const [groupedSettings, setGroupedSettings] = useState({});
  const [changedSettings, setChangedSettings] = useState({}); // Track changes before save

  const fetchSettings = () => {
    if (!socket) return;
    setShowLoad(true);
    socket.emit("getAppSettings", {}, (res) => {
      setShowLoad(false);
      if (res.res === 200) {
        setSettings(res.data);
        groupSettings(res.data);
      }
    });
  };

  const groupSettings = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const mod = curr.module || "General";
      const sec = curr.section || "General";
      if (!acc[mod]) acc[mod] = {};
      if (!acc[mod][sec]) acc[mod][sec] = [];
      acc[mod][sec].push(curr);
      return acc;
    }, {});
    setGroupedSettings(grouped);
  };

  useEffect(() => {
    if (socket) {
      fetchSettings();
    }
  }, [socket]);

  const handleValueChange = (id, newValue) => {
    setChangedSettings((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleSave = (setting) => {
    const newValue = changedSettings[setting._id];
    if (newValue === undefined) return; // No change

    setShowLoad(true);
    const payload = { ...setting, value: newValue };

    socket.emit("updateAppSetting", payload, (res) => {
      setShowLoad(false);
      if (res.res === 200) {
        setSnackBar({ type: "success", message: "Setting updated", show: true });
        // Update local state to reflect saved
        const newSettings = settings.map((s) =>
          s._id === setting._id ? { ...s, value: newValue } : s
        );
        setSettings(newSettings);
        groupSettings(newSettings);
        // Remove from changedSettings
        const newChanged = { ...changedSettings };
        delete newChanged[setting._id];
        setChangedSettings(newChanged);
      } else {
        setSnackBar({ type: "error", message: "Error updating setting", show: true });
      }
    });
  };

  const renderInput = (setting) => {
    const currentValue =
      changedSettings[setting._id] !== undefined ? changedSettings[setting._id] : setting.value;

    switch (setting.inputType) {
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Switch
                checked={currentValue === true || currentValue === "true"}
                onChange={(e) => handleValueChange(setting._id, e.target.checked)}
              />
            }
            label={setting.setting?.name || setting.setting?.key}
          />
        );
      case "select":
        return (
          <FormControl fullWidth>
            <InputLabel>{setting.setting?.name}</InputLabel>
            <Select
              value={currentValue}
              label={setting.setting?.name}
              onChange={(e) => handleValueChange(setting._id, e.target.value)}
              sx={{ height: "44px" }}
            >
              {setting.selectOptions &&
                setting.selectOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        );
      case "longtext":
        return (
          <TextField
            label={setting.setting?.name}
            fullWidth
            multiline
            rows={4}
            value={currentValue}
            onChange={(e) => handleValueChange(setting._id, e.target.value)}
          />
        );
      case "number":
        return (
          <TextField
            label={setting.setting?.name}
            fullWidth
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(setting._id, e.target.value)}
          />
        );
      default:
        return (
          <TextField
            label={setting.setting?.name}
            fullWidth
            value={currentValue}
            onChange={(e) => handleValueChange(setting._id, e.target.value)}
          />
        );
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
                <MDTypography variant="h6" color="white">
                  System Configuration
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2} pb={3}>
                {Object.keys(groupedSettings)
                  .sort()
                  .map((module) => (
                    <Accordion
                      key={module}
                      defaultExpanded
                      sx={{ mb: 2, boxShadow: "none", border: "1px solid #eee" }}
                    >
                      <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                        <MDTypography variant="h6" textTransform="capitalize">
                          {module}
                        </MDTypography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {Object.keys(groupedSettings[module])
                          .sort()
                          .map((section) => (
                            <MDBox key={section} mb={3}>
                              <MDTypography
                                variant="button"
                                fontWeight="bold"
                                color="text"
                                textTransform="uppercase"
                                sx={{ mb: 2, display: "block" }}
                              >
                                {section}
                              </MDTypography>
                              <Grid container spacing={3}>
                                {groupedSettings[module][section]
                                  .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                                  .map((setting) => (
                                    <Grid item xs={12} md={6} lg={4} key={setting._id}>
                                      <MDBox display="flex" alignItems="center" gap={1}>
                                        <MDBox flexGrow={1}>
                                          {renderInput(setting)}
                                          {setting.setting?.description && (
                                            <MDTypography
                                              variant="caption"
                                              color="text"
                                              display="block"
                                              mt={0.5}
                                            >
                                              {setting.setting.description}
                                            </MDTypography>
                                          )}
                                        </MDBox>
                                        {changedSettings[setting._id] !== undefined && (
                                          <MDButton
                                            variant="gradient"
                                            color="info"
                                            iconOnly
                                            onClick={() => handleSave(setting)}
                                          >
                                            <Icon>save</Icon>
                                          </MDButton>
                                        )}
                                      </MDBox>
                                    </Grid>
                                  ))}
                              </Grid>
                              <Divider sx={{ my: 3 }} />
                            </MDBox>
                          ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SystemSettings;
