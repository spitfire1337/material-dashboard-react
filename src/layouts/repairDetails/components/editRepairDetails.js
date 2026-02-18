import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  RichTextEditorProvider,
  RichTextField,
  MenuControlsContainer,
  MenuSelectHeading,
  MenuDivider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonEditLink,
} from "mui-tiptap";

const EditRepairDetails = ({ open, onClose, repair, onSave }) => {
  const [repairType, setRepairType] = useState([]);
  const [warranty, setWarranty] = useState(false);
  const [accessories, setAccessories] = useState([]);
  const [newAccessory, setNewAccessory] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: repair?.Details || "",
  });

  useEffect(() => {
    if (open && repair) {
      setRepairType(repair.RepairType || []);
      setWarranty(repair.warranty || false);
      setAccessories(repair.accessories || []);
      if (editor) {
        editor.commands.setContent(repair.Details || "");
      }
    }
  }, [open, repair, editor]);

  const handleAddAccessory = () => {
    if (newAccessory.trim()) {
      setAccessories([...accessories, { name: newAccessory.trim() }]);
      setNewAccessory("");
    }
  };

  const toggleRepairType = (type) => {
    if (repairType.includes(type)) setRepairType(repairType.filter((t) => t !== type));
    else setRepairType([...repairType, type]);
  };

  const handleSave = () => {
    const data = {
      _id: repair._id,
      Details: editor ? editor.getHTML() : "",
      RepairType: repairType,
      warranty: warranty,
      accessories: accessories,
    };
    onSave(data);
  };

  const types = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Repair Details</DialogTitle>
      <DialogContent>
        <MDBox mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="bold">
                Repair Type
              </MDTypography>
              <MDBox display="flex" gap={1} flexWrap="wrap" mt={1}>
                {types.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => toggleRepairType(type)}
                    color={repairType.includes(type) ? "info" : "default"}
                    variant={repairType.includes(type) ? "filled" : "outlined"}
                  />
                ))}
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                Details
              </MDTypography>
              <MDBox border="1px solid #ccc" borderRadius="4px">
                {editor && (
                  <RichTextEditorProvider editor={editor}>
                    <RichTextField
                      controls={
                        <MenuControlsContainer>
                          <MenuSelectHeading />
                          <MenuDivider />
                          <MenuButtonBold />
                          <MenuButtonItalic />
                          <MenuDivider />
                          <MenuButtonOrderedList />
                          <MenuButtonBulletedList />
                          <MenuDivider />
                          <MenuButtonEditLink />
                          <MenuDivider />
                          <MenuButtonUndo />
                          <MenuButtonRedo />
                        </MenuControlsContainer>
                      }
                    />
                  </RichTextEditorProvider>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox checked={warranty} onChange={(e) => setWarranty(e.target.checked)} />
                }
                label="Warranty Repair"
              />
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="bold">
                Accessories
              </MDTypography>
              <MDBox display="flex" gap={1} mt={1} mb={1}>
                <TextField
                  label="Add Accessory"
                  size="small"
                  value={newAccessory}
                  onChange={(e) => setNewAccessory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAccessory()}
                />
                <MDButton variant="outlined" color="info" size="small" onClick={handleAddAccessory}>
                  Add
                </MDButton>
              </MDBox>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                {accessories.map((acc, i) => (
                  <Chip
                    key={i}
                    label={acc.name}
                    onDelete={() => setAccessories(accessories.filter((_, idx) => idx !== i))}
                  />
                ))}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancel
        </MDButton>
        <MDButton onClick={handleSave} color="success">
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditRepairDetails;
