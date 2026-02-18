import BasicLayout from "../../layouts/authentication/components/BasicLayout";
import bgImage from "../../assets/images/pe";
import MDBox from "../MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import MDTypography from "../MDTypography";

const Loading = () => {
  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <CircularProgress />
        </MDBox>
      </Card>
    </BasicLayout>
  );
};
export default Loading;
