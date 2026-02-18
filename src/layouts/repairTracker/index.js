import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Grid,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Status from "layouts/repairs/components/status";
import vars from "config";
import bgImage from "assets/images/pevcxnbg.png";
import parse from "html-react-parser";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function RepairTracker() {
  const { repairId } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        // Using a public endpoint to fetch repair status by ID
        const response = await fetch(`${vars.serverUrl}/repairs/tracker`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: repairId }),
        });
        const res = await response.json();
        if (res.res === 200) {
          setRepair(res.data);
        } else {
          setError(res.message || "Repair not found");
        }
      } catch (e) {
        setError("Unable to fetch repair details. Please try again later.");
      }
      setLoading(false);
    };

    if (repairId) {
      fetchRepair();
    } else {
      setError("No repair ID provided.");
      setLoading(false);
    }
  }, [repairId]);

  return (
    <MDBox
      width="100vw"
      height="100%"
      minHeight="100vh"
      bgColor="info"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ maxWidth: 500, width: "90%", m: 2, p: 2 }}>
        <MDBox textAlign="center" mb={2}>
          <MDTypography variant="h4" fontWeight="medium">
            Repair Tracker
          </MDTypography>
          <MDTypography variant="button" color="text">
            ID: {repairId}
          </MDTypography>
        </MDBox>
        <Divider />
        <MDBox py={2}>
          {loading ? (
            <MDBox display="flex" justifyContent="center">
              <CircularProgress color="info" />
            </MDBox>
          ) : error ? (
            <MDTypography variant="h6" color="error" textAlign="center">
              {error}
            </MDTypography>
          ) : repair ? (
            <Grid container spacing={2}>
              <Grid item xs={12} textAlign="center">
                <MDTypography variant="h6" gutterBottom>
                  Current Status
                </MDTypography>
                <Status repairStatus={repair.status} />
              </Grid>
              <Grid item xs={12} mt={2}>
                <MDTypography variant="body2" fontWeight="bold">
                  Device:
                </MDTypography>
                <MDTypography variant="body2">
                  {repair.pev?.Brand?.name} {repair.pev?.Model}
                </MDTypography>
              </Grid>

              {repair.publicNotes && repair.publicNotes.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <MDTypography variant="h6" gutterBottom>
                    Technician Notes
                  </MDTypography>
                  <MDBox p={2} bgcolor="#f8f9fa" borderRadius="lg">
                    {repair.publicNotes.map((note, index) => (
                      <MDBox key={index} mb={1}>
                        <MDTypography variant="body2" component="div">
                          {parse(note.note || note)}
                        </MDTypography>
                        {note.createdAt && (
                          <MDTypography variant="caption" color="text">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    ))}
                  </MDBox>
                </Grid>
              )}

              {(repair.status === 4 || repair.status === 5 || repair.status === 6) &&
                repair.postRepairChecklist &&
                repair.postRepairChecklist.length > 0 && (
                  <Grid item xs={12} mt={2}>
                    <MDTypography variant="h6" gutterBottom>
                      Post-Repair Checklist
                    </MDTypography>
                    <List dense>
                      {repair.postRepairChecklist.map((item, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.question}
                            secondary={
                              item.answer === true
                                ? "Yes"
                                : item.answer === false
                                ? "No"
                                : String(item.answer)
                            }
                            primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
                            secondaryTypographyProps={{ variant: "caption" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
            </Grid>
          ) : null}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default RepairTracker;
