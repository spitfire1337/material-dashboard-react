import { useState } from "react";
import { Modal, ImageList, ImageListItem, ImageListItemBar } from "@mui/material";
import MDBox from "components/MDBox";
import ImageZoom from "react-image-zooom";
import vars from "../../../config";

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
      <ImageList sx={{ width: 500, height: 200 }} cols={4} gap={8}>
        {itemData.map((item) => (
          <ImageListItem key={item._id}>
            <img
              srcSet={`${vars.serverUrl}/repairs/images/${item._id}?w=60&fit=crop&auto=format&dpr=2 2x`}
              src={`${vars.serverUrl}/repairs/images/${item._id}?w=60&fit=crop&auto=format`}
              alt={item.description}
              loading="lazy"
              height="50px"
              onClick={() => {
                setZoomedImg(`${vars.serverUrl}/repairs/images/${item._id}`);
                setZoomedImgDesc(item.description);
                setShowZoom(true);
              }}
            />
            <ImageListItemBar
              title={item.description}
              subtitle={<span>by: {item.user}</span>}
              position="below"
            />
          </ImageListItem>
        ))}
      </ImageList>
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
    </>
  );
}
