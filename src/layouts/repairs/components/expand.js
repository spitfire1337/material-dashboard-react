import { Grid, Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import parse from "html-react-parser";
import Status from "./status";
import Actions from "./quickActions";
const ExpandedComponent = ({ data, reRender }) => {
  console.log("Expanded component data: ", data);
  let repairDetails = data.allData;
  return (
    <Grid container mt={2} padding={2} spacing={2}>
      <Grid item xs={4}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Customer Details
            </MDTypography>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <MDTypography variant="subtitle2">
              {repairDetails.Customer.given_name} {repairDetails.Customer.family_name}
              {repairDetails.Customer.address != undefined
                ? [<br key="" />, repairDetails.Customer.address.address_line_1]
                : ""}
              {repairDetails.Customer.address != undefined
                ? repairDetails.Customer.address.address_line_2 != undefined
                  ? [<br key="" />, repairDetails.Customer.address.address_line_2]
                  : ""
                : ""}
              {repairDetails.Customer.address != undefined
                ? [
                    <br key="" />,
                    repairDetails.Customer.address.locality || "",
                    ", ",
                    repairDetails.Customer.address.administrative_district_level_1 || "",
                    " ",
                    repairDetails.Customer.address.postal_code || "",
                  ]
                : ""}
              {repairDetails.Customer.email_address != undefined
                ? [<br key="" />, repairDetails.Customer.email_address]
                : ""}
              {repairDetails.Customer.phone_number != undefined
                ? [<br key="" />, repairDetails.Customer.phone_number]
                : ""}
            </MDTypography>
          </MDBox>
        </Card>
      </Grid>
      <Grid item xs={5}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <Grid container>
              <Grid item xs={6} alignItems="center">
                <MDTypography variant="h6" color="white">
                  Repair Details
                </MDTypography>
              </Grid>
              <Grid item xs={6} alignItems="center" textAlign="right">
                <Status repairStatus={repairDetails.status} />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <MDTypography variant="body1">
              {repairDetails.pev.Brand.name} {repairDetails.pev.Model}
            </MDTypography>
            <MDTypography variant="body1">Repair Type:</MDTypography>
            <MDTypography variant="body2">
              {repairDetails.RepairType.map((type) => {
                return ` ${type}, `;
              })}
            </MDTypography>
            <MDTypography variant="body1">Details:</MDTypography>
            <MDTypography variant="body2">{parse(repairDetails.Details)}</MDTypography>
          </MDBox>
        </Card>
      </Grid>
      <Grid xs={12} sm={3} mt={2}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Quick Actions
            </MDTypography>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <Actions
              status={repairDetails.status}
              repairID={repairDetails._id}
              repairTime={repairDetails.repairTime}
              reRender={reRender}
            />
          </MDBox>
        </Card>
      </Grid>
    </Grid>
    // <pre>{JSON.stringify(data.allData, null, 2)}</pre>
  );
};
export default ExpandedComponent;
