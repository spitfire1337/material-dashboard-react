import { useState } from "react";
import ImageListItem, { imageListItemClasses } from "@mui/material/ImageListItem";
import { Modal, ImageList, ImageListItemBar, createTheme, Box, ThemeProvider } from "@mui/material";
import MDBox from "components/MDBox";
import ImageZoom from "react-image-zooom";
import vars from "../../../config";
const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      bigMobile: 350,
      tablet: 650,
      desktop: 900,
    },
  },
});
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  //   width: "80%",
  height: "80vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};
export default function RepairImages({ itemData }) {
  const [zoomedImage, setZoomedImg] = useState();
  const [zoomedImageDesc, setZoomedImgDesc] = useState();
  const [showZoom, setShowZoom] = useState(false);
  return (
    <>
      {/* //<ImageList sx={{ width: 500, height: 200 }} cols={4} gap={8}> */}
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            height: 200,
            display: "grid",
            gridTemplateColumns: {
              mobile: "repeat(1, 1fr)",
              bigMobile: "repeat(2, 1fr)",
              tablet: "repeat(3, 1fr)",
              desktop: "repeat(3, 1fr)",
            },
            overflowY: "scroll",
            [`& .${imageListItemClasses.root}`]: {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {itemData.map((item) => (
            <ImageListItem key={item._id} sx={{ maxWidth: "50" }}>
              <img
                srcSet={`${vars.serverUrl}/repairs/images/${item._id}?w=60&fit=crop&auto=format&dpr=2 2x`}
                src={`${vars.serverUrl}/repairs/images/${item._id}?w=60&fit=crop&auto=format`}
                alt={item.description}
                height="50px"
                style={{ maxWidth: "50" }}
                onClick={() => {
                  setZoomedImg(`${vars.serverUrl}/repairs/images/${item._id}`);
                  setZoomedImgDesc(item.description);
                  setShowZoom(true);
                }}
              />
              <ImageListItemBar title={item.description} subtitle={<span>by: {item.user}</span>} />
            </ImageListItem>
          ))}
        </Box>
        {/* </ImageList> */}
        <Modal
          open={showZoom}
          onClose={() => setShowZoom(false)}
          // onClose={() => {
          //   setNewRepair(false);
          // }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <MDBox sx={style}>
            <div className="gallery">
              <ImageZoom
                src={zoomedImage}
                alt={zoomedImageDesc}
                zoom="300"
                className="gallery-img"
                height="100%"
              />
            </div>
          </MDBox>
        </Modal>
      </ThemeProvider>
    </>
  );
}
