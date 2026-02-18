import { Card, Icon, Tooltip, Grid, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useNavigate } from "react-router-dom";
import NewRepairButton from "components/NewRepairButton";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <MDBox p={2}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <MDTypography variant="h6">Quick Actions</MDTypography>
          </Grid>
          <Grid item>
            <MDBox display="flex" gap={1}>
              <NewRepairButton size="icon" />
              <Tooltip title="Add PEV">
                <IconButton color="info" onClick={() => navigate("/pevDB")}>
                  <Icon>electric_scooter</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Repair Guide">
                <IconButton color="info" onClick={() => navigate("/repair-guides?action=add")}>
                  <Icon>menu_book</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Checklist Question">
                <IconButton color="info" onClick={() => navigate("/checklist?action=add")}>
                  <Icon>playlist_add</Icon>
                </IconButton>
              </Tooltip>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default QuickActions;
