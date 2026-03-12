import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
} from "@mui/material";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  RichTextEditorProvider,
  RichTextField,
  MenuControlsContainer,
  MenuSelectHeading,
  MenuDivider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonBlockquote,
  MenuButtonStrikethrough,
  MenuButtonUnderline,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonAlignJustify,
  MenuButtonEditLink,
  MenuButtonAddImage,
  MenuButtonAddTable,
  MenuButtonHorizontalRule,
  TableBubbleMenu,
  ResizableImage,
} from "mui-tiptap";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import parse from "html-react-parser";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";
import pevLogo from "assets/images/logos/pevcxnlogo.png";

function GeneralLabelEditor() {
  const socket = useSocket();
  const { setSnackBar } = globalFuncs();

  const defaultTemplates = {
    drop_off:
      "<p><strong>{customer_name}</strong></p><p>{pev_brand} {pev_model}</p><p>{customer_phone}</p>",
    repair_start:
      "<p><strong>Repair ID: {repair_id}</strong></p><p>{customer_name}</p><p>{pev_brand} {pev_model}</p>",
    repair_agreement:
      "<p><strong>REPAIR AGREEMENT</strong></p><p>Customer: {customer_name}<br>Phone: {customer_phone}<br>Email: {customer_email}</p><p>Device: {pev_brand} {pev_model}</p><p>Repair Details:<br>{repair_details}</p><p>Included Accessories:<br>{included_accessories}</p><p>Terms and Conditions:<br>1. Authorization: The customer authorizes PEV Connection to perform the repair work described above.<br>2. Warranty: Repairs are covered by a 30-day labor warranty. Parts are subject to manufacturer warranty.<br>3. Liability: We are not responsible for loss or damage to items left over 30 days.</p><p>Sign here: {customer_signature}</p>",
  };

  const [selectedTemplate, setSelectedTemplate] = useState("drop_off");
  const [templateHtml, setTemplateHtml] = useState(defaultTemplates["drop_off"]);
  const [templateId, setTemplateId] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");
  const [printer, setPrinter] = useState(0);
  const [pageSettings, setPageSettings] = useState({
    format: "Custom",
    width: "2.25",
    height: "1.25",
    unit: "in",
    orientation: "landscape",
    margin: {
      top: "0.1",
      right: "0.1",
      bottom: "0.1",
      left: "0.1",
    },
  });

  const sampleData = {
    "{customer_name}": "John Doe",
    "{customer_phone}": "(555) 123-4567",
    "{customer_email}": "john.doe@example.com",
    "{pev_brand}": "Segway",
    "{pev_model}": "Ninebot Max",
    "{repair_id}": "1001",
    "{todays_date}": new Date().toLocaleDateString(),
    "{repair_details}": "- Tire change (Rear)\n- Brake adjustment",
    "{included_accessories}": "- Charger\n- Phone mount",
    "{customer_signature}":
      "<div style='border-bottom: 1px solid black; width: 200px; margin-top: 20px; font-style: italic;'>Customer Signature</div>",
    "{logo}": `<img src="${pevLogo}" alt="Logo" width="150" />`,
    "{crm_qr}": `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CRM" alt="CRM QR" width="100" />`,
    "{customer_qr}": `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Customer" alt="Customer QR" width="100" />`,
  };

  const variables = [
    { label: "Customer Name", value: "{customer_name}" },
    { label: "Customer Phone", value: "{customer_phone}" },
    { label: "Customer Email", value: "{customer_email}" },
    { label: "Device Brand", value: "{pev_brand}" },
    { label: "Device Model", value: "{pev_model}" },
    { label: "Repair ID", value: "{repair_id}" },
    { label: "Today's Date", value: "{todays_date}" },
    { label: "Repair Details", value: "{repair_details}" },
    { label: "Accessories", value: "{included_accessories}" },
    { label: "Logo", value: "{logo}" },
    { label: "Customer Signature", value: "{customer_signature}" },
    { label: "CRM QR", value: "{crm_qr}" },
    { label: "Customer QR", value: "{customer_qr}" },
  ];

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Link,
        ResizableImage,
        Subscript,
        Superscript,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
      ].filter((e) => !!e),
      content: templateHtml,
      onUpdate: ({ editor }) => {
        setTemplateHtml(editor.getHTML());
      },
    },
    []
  );

  const insertVariable = (variable) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  };

  useEffect(() => {
    const defaultContent = defaultTemplates[selectedTemplate] || "";
    setTemplateHtml(defaultContent);
    setTemplateId(null);
    setLastUpdatedBy("");
    setLastUpdatedAt("");
    setPrinter(0);
    if (editor) editor.commands.setContent(defaultContent);

    if (socket && selectedTemplate) {
      socket.emit("getPdfTemplate", { name: selectedTemplate }, (res) => {
        let content = "";
        let id = null;
        let pOptions = null;
        if (res && res.data && res.data[0]) {
          const data = res.data[0];
          content = data.content;
          id = data._id;
          pOptions = data.pageOptions;
          setLastUpdatedBy(data.lastUpdatedBy);
          setLastUpdatedAt(data.updatedAt);
          if (data.printer !== undefined) setPrinter(data.printer);
        } else {
          content = defaultContent;
          // Set defaults based on template type if not found
          if (selectedTemplate === "repair_agreement") {
            pOptions = {
              format: "Letter",
              orientation: "portrait",
              width: "8.5",
              height: "11",
              unit: "in",
              margin: { top: "0.5", right: "0.5", bottom: "0.5", left: "0.5" },
            };
          } else {
            pOptions = {
              format: "Custom",
              width: "2.25",
              height: "1.25",
              unit: "in",
              orientation: "landscape",
              margin: { top: "0.1", right: "0.1", bottom: "0.1", left: "0.1" },
            };
          }
        }
        setTemplateHtml(content);
        setTemplateId(id);
        if (pOptions) {
          // Parse strings back to numbers/clean strings if necessary, but state assumes strings for inputs
          setPageSettings((prev) => ({
            ...prev,
            format: pOptions.format || "Custom",
            width: parseFloat(pOptions.width || "0") + "",
            height: parseFloat(pOptions.height || "0") + "",
            orientation: pOptions.orientation || "portrait",
            margin: {
              top: parseFloat(pOptions.margin?.top || "0.1") + "",
              right: parseFloat(pOptions.margin?.right || "0.1") + "",
              bottom: parseFloat(pOptions.margin?.bottom || "0.1") + "",
              left: parseFloat(pOptions.margin?.left || "0.1") + "",
            },
          }));
        }
        if (editor) {
          editor.commands.setContent(content);
        }
      });
    }
  }, [socket, selectedTemplate, editor]);

  const handlePageSettingChange = (field, value) => {
    setPageSettings((prev) => {
      const newSettings = { ...prev, [field]: value };
      // Auto-populate standard dimensions
      if (field === "format") {
        if (value === "Letter") {
          newSettings.width = "8.5";
          newSettings.height = "11";
          newSettings.unit = "in";
        } else if (value === "A4") {
          newSettings.width = "8.27";
          newSettings.height = "11.69";
          newSettings.unit = "in";
        }
      }
      return newSettings;
    });
  };

  const handleMarginChange = (side, value) => {
    setPageSettings((prev) => ({
      ...prev,
      margin: { ...prev.margin, [side]: value },
    }));
  };

  const handleSave = () => {
    if (socket) {
      socket.emit(
        "updatePdfTemplate",
        {
          name: selectedTemplate,
          description: selectedTemplate === "drop_off" ? "Drop Off Label" : "Repair Start Label",
          content: templateHtml,
          id: templateId,
          printer: printer,
          pageOptions: {
            format: pageSettings.format,
            width: `${pageSettings.width}in`,
            height: `${pageSettings.height}in`,
            orientation: pageSettings.orientation,
            margin: {
              top: `${pageSettings.margin.top}in`,
              right: `${pageSettings.margin.right}in`,
              bottom: `${pageSettings.margin.bottom}in`,
              left: `${pageSettings.margin.left}in`,
            },
          },
        },
        (res) => {
          if (res && (res.success || res.res === 200)) {
            setSnackBar({
              type: "success",
              title: "Saved",
              message: "Template saved successfully",
              show: true,
            });
            if (res.id) setTemplateId(res.id);
          } else {
            setSnackBar({
              type: "error",
              title: "Error",
              message: "Failed to save template",
              show: true,
            });
          }
        }
      );
    }
  };

  let previewContent = templateHtml;
  Object.keys(sampleData).forEach((key) => {
    previewContent = previewContent.split(key).join(sampleData[key]);
  });

  // Calculate preview box dimensions (1in = 96px approximately)
  const pxPerIn = 96;
  const previewWidth = parseFloat(pageSettings.width) * pxPerIn;
  const previewHeight = parseFloat(pageSettings.height) * pxPerIn;
  const previewScale = previewWidth > 500 ? 500 / previewWidth : 1;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <MDBox p={3}>
                <MDTypography variant="h5" gutterBottom>
                  Edit Label Template
                </MDTypography>
                <MDBox mb={3} display="flex" alignItems="center">
                  <FormControl fullWidth size="small" sx={{ mr: 2 }}>
                    <InputLabel id="template-select-label">Select Template</InputLabel>
                    <Select
                      labelId="template-select-label"
                      id="template-select"
                      value={selectedTemplate}
                      label="Select Template"
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      sx={{ height: "40px" }}
                    >
                      <MenuItem value="drop_off">Drop Off Label</MenuItem>
                      <MenuItem value="repair_start">Repair Start Label</MenuItem>
                      <MenuItem value="repair_agreement">Repair Agreement</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mr: 2 }}>
                    <InputLabel id="printer-select-label">Select Printer</InputLabel>
                    <Select
                      labelId="printer-select-label"
                      id="printer-select"
                      value={printer}
                      label="Select Printer"
                      onChange={(e) => setPrinter(e.target.value)}
                      sx={{ height: "40px" }}
                    >
                      <MenuItem value={0}>Full Size Paper</MenuItem>
                      <MenuItem value={1}>Intake Printer</MenuItem>
                      <MenuItem value={2}>Shop Printer</MenuItem>
                    </Select>
                  </FormControl>
                  <MDButton variant="gradient" color="info" onClick={handleSave}>
                    Save
                  </MDButton>
                </MDBox>
                {(lastUpdatedBy || lastUpdatedAt) && (
                  <MDBox mb={2} mt={-2}>
                    <MDTypography variant="caption" color="text">
                      Last updated:{" "}
                      {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : "N/A"}
                      {lastUpdatedBy ? ` by ${lastUpdatedBy}` : ""}
                    </MDTypography>
                  </MDBox>
                )}
                <MDBox mb={2} display="flex" gap={1} flexWrap="wrap">
                  {variables.map((v) => (
                    <MDButton
                      key={v.value}
                      size="small"
                      color="info"
                      variant="outlined"
                      onClick={() => insertVariable(v.value)}
                    >
                      {v.label}
                    </MDButton>
                  ))}
                </MDBox>
                <MDTypography variant="h6" gutterBottom>
                  Page Settings
                </MDTypography>
                <MDBox mb={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Format</InputLabel>
                        <Select
                          value={pageSettings.format}
                          label="Format"
                          onChange={(e) => handlePageSettingChange("format", e.target.value)}
                          sx={{ height: "40px" }}
                        >
                          <MenuItem value="Custom">Custom</MenuItem>
                          <MenuItem value="Letter">Letter</MenuItem>
                          <MenuItem value="A4">A4</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Orientation</InputLabel>
                        <Select
                          value={pageSettings.orientation}
                          label="Orientation"
                          onChange={(e) => handlePageSettingChange("orientation", e.target.value)}
                          sx={{ height: "40px" }}
                        >
                          <MenuItem value="portrait">Portrait</MenuItem>
                          <MenuItem value="landscape">Landscape</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {pageSettings.format === "Custom" && (
                      <>
                        <Grid item xs={6} md={3}>
                          <TextField
                            label="Width (in)"
                            size="small"
                            fullWidth
                            value={pageSettings.width}
                            onChange={(e) => handlePageSettingChange("width", e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TextField
                            label="Height (in)"
                            size="small"
                            fullWidth
                            value={pageSettings.height}
                            onChange={(e) => handlePageSettingChange("height", e.target.value)}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <MDBox mt={2}>
                    <MDTypography variant="button" fontWeight="bold">
                      Margins (in):
                    </MDTypography>
                    <Grid container spacing={2} mt={0.5}>
                      {["top", "right", "bottom", "left"].map((side) => (
                        <Grid item xs={3} key={side}>
                          <TextField
                            label={side.charAt(0).toUpperCase() + side.slice(1)}
                            size="small"
                            fullWidth
                            value={pageSettings.margin[side]}
                            onChange={(e) => handleMarginChange(side, e.target.value)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </MDBox>
                </MDBox>
                <Divider />
                <MDBox border="1px solid #ccc" borderRadius="4px" p={1}>
                  <RichTextEditorProvider editor={editor}>
                    <RichTextField
                      controls={
                        <MenuControlsContainer>
                          <MenuSelectHeading />
                          <MenuDivider />
                          <MenuButtonBold />
                          <MenuButtonUnderline />
                          <MenuButtonItalic />
                          <MenuButtonStrikethrough />
                          <MenuButtonSubscript />
                          <MenuButtonSuperscript />
                          <MenuDivider />
                          <MenuButtonAlignLeft />
                          <MenuButtonAlignCenter />
                          <MenuButtonAlignRight />
                          <MenuButtonAlignJustify />
                          <MenuDivider />
                          <MenuButtonOrderedList />
                          <MenuButtonBulletedList />
                          <MenuButtonBlockquote />
                          <MenuDivider />
                          <MenuButtonAddImage />
                          <MenuButtonAddTable />
                          <MenuButtonHorizontalRule />
                          <MenuDivider />
                          <MenuButtonEditLink />
                          <MenuButtonUndo />
                          <MenuButtonRedo />
                        </MenuControlsContainer>
                      }
                    />
                    <TableBubbleMenu />
                  </RichTextEditorProvider>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <MDBox p={3} display="flex" flexDirection="column" alignItems="center">
                <MDTypography variant="h5" gutterBottom>
                  Preview ({pageSettings.width}in x {pageSettings.height}in)
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Scale: {previewScale.toFixed(2)}x
                </MDTypography>
                <MDBox
                  mt={2}
                  sx={{
                    width: `${previewWidth}px`,
                    height: `${previewHeight}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top center",
                    border: "1px dashed grey",
                    padding: `${parseFloat(pageSettings.margin.top) * pxPerIn}px ${
                      parseFloat(pageSettings.margin.right) * pxPerIn
                    }px ${parseFloat(pageSettings.margin.bottom) * pxPerIn}px ${
                      parseFloat(pageSettings.margin.left) * pxPerIn
                    }px`,
                    overflow: "hidden",
                    fontSize: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  {parse(previewContent)}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default GeneralLabelEditor;
