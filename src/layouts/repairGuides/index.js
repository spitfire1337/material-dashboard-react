import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Card,
  Grid,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Icon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  OutlinedInput,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import {
  RichTextEditorProvider,
  RichTextField,
  RichTextReadOnly,
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
  MenuButtonAddTable,
} from "mui-tiptap";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const GuideDetail = ({ data }) => {
  return (
    <MDBox p={3} bgcolor="#f8f9fa">
      {data.type === "video" || data.videoUrl ? (
        <MDBox
          component="iframe"
          src={getYoutubeEmbedUrl(data.videoUrl)}
          width="100%"
          height="400px"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{ borderRadius: "8px" }}
        />
      ) : (
        <MDBox sx={{ border: "1px solid #eee", borderRadius: "8px", p: 2, bgcolor: "white" }}>
          <RichTextReadOnly
            content={data.content}
            extensions={[
              StarterKit,
              Link,
              Table.configure({ resizable: true }),
              TableRow,
              TableHeader,
              TableCell,
            ]}
          />
        </MDBox>
      )}
    </MDBox>
  );
};

function RepairGuides() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [models, setModels] = useState([]);
  const [guides, setGuides] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [editingGuideId, setEditingGuideId] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [guideToCopy, setGuideToCopy] = useState(null);
  const [targetModelId, setTargetModelId] = useState("");
  const [copyTargetBrand, setCopyTargetBrand] = useState("");
  const [guideTagFilter, setGuideTagFilter] = useState("All");
  const [addModalBrand, setAddModalBrand] = useState("");

  const [newGuide, setNewGuide] = useState({
    title: "",
    type: "text", // 'text' or 'video'
    content: "",
    videoUrl: "",
    pevId: "",
    tags: [],
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: newGuide.content,
    onUpdate: ({ editor }) => {
      setNewGuide((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  const fetchModels = async () => {
    setShowLoad(true);
    try {
      // Assuming endpoint exists to get models with guide counts
      const response = await fetch(`${vars.serverUrl}/repairGuides`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setModels(res.data);
      }
    } catch (error) {
      console.error(error);
    }
    setShowLoad(false);
  };

  const fetchGuides = async (pev) => {
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairGuides/model/${pev}`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setGuides(res.data);
      } else {
        setGuides([]);
      }
    } catch (error) {
      console.error(error);
      setGuides([]);
    }
    setShowLoad(false);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (showAddModal && editor) {
      editor.commands.setContent(newGuide.content);
    }
  }, [showAddModal, editor]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setSelectedModel(null);
      handleAddGuide();
      setSearchParams((params) => {
        params.delete("action");
        return params;
      });
    }
  }, [searchParams]);

  const handleOpenGuides = async (row) => {
    setSelectedModel(row);
    await fetchGuides(row._id);
    setGuideTagFilter("All");
    setShowGuidesModal(true);
  };

  const handleAddGuide = () => {
    setNewGuide({ title: "", type: "text", content: "", videoUrl: "", tags: [] });
    setEditingGuideId(null);
    setAddModalBrand("");
    setShowAddModal(true);
  };

  const handleEditGuide = (guide) => {
    setNewGuide({
      title: guide.title,
      type: guide.videoUrl ? "video" : "text",
      content: guide.content || "",
      videoUrl: guide.videoUrl || "",
      tags: guide.tags || [],
    });
    setEditingGuideId(guide._id);
    setShowAddModal(true);
  };

  const handleDeleteGuide = async (guide) => {
    if (!window.confirm(`Are you sure you want to delete "${guide.title}"?`)) return;
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairGuides/delete/${guide._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({ type: "success", message: "Guide deleted", show: true, icon: "check" });
        fetchGuides(selectedModel._id);
        fetchModels();
      } else {
        setSnackBar({
          type: "error",
          message: "Failed to delete guide",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      console.error(e);
      setSnackBar({ type: "error", message: "Server error", show: true, icon: "warning" });
    }
    setShowLoad(false);
  };

  const handleOpenCopy = (guide) => {
    setGuideToCopy(guide);
    setTargetModelId("");
    setCopyTargetBrand(selectedModel?.Brand?.name || "");
    setShowCopyModal(true);
  };

  const handleCopyGuide = async () => {
    if (!targetModelId) {
      setSnackBar({
        type: "error",
        message: "Please select a target model",
        show: true,
        icon: "warning",
      });
      return;
    }
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairGuides/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guideToCopy._id, targetModelId }),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          message: "Guide copied successfully",
          show: true,
          icon: "check",
        });
        setShowCopyModal(false);
        setGuideToCopy(null);
        setTargetModelId("");
        await fetchModels();
      } else {
        setSnackBar({
          type: "error",
          message: "Failed to copy guide",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      console.error(e);
      setSnackBar({ type: "error", message: "Server error", show: true, icon: "warning" });
    }
    setShowLoad(false);
  };

  const handleSaveGuide = async () => {
    if (!newGuide.title || (!newGuide.content && !newGuide.videoUrl)) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please fill in title and content/url",
        show: true,
        icon: "warning",
      });
      return;
    }

    const targetPevId = selectedModel ? selectedModel._id : newGuide.pevId;

    if (!targetPevId) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please select a PEV model",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    try {
      const payload = {
        ...newGuide,
        pev: selectedModel._id,
        pev: targetPevId,
      };

      let url = `${vars.serverUrl}/repairGuides/create`;
      if (editingGuideId) {
        url = `${vars.serverUrl}/repairGuides/update`;
        payload._id = editingGuideId;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: editingGuideId ? "Guide updated successfully" : "Guide added successfully",
          show: true,
          icon: "check",
        });
        setShowAddModal(false);
        setNewGuide({ title: "", type: "text", content: "", videoUrl: "", tags: [], pevId: "" });
        setEditingGuideId(null);
        if (selectedModel) {
          fetchGuides(selectedModel._id);
        }
        fetchModels(); // Refresh counts
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Failed to add guide",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      console.error(e);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const columns = [
    { name: "Brand", selector: (row) => row.Brand?.name, sortable: true },
    { name: "Model", selector: (row) => row.Model, sortable: true },
    {
      name: "Guides",
      selector: (row) => row.guideCount || 0,
      sortable: true,
      cell: (row) => (
        <MDButton
          variant="text"
          color="info"
          onClick={() => handleOpenGuides(row)}
          sx={{ fontWeight: "bold", fontSize: "1.1em" }}
        >
          {row.guideCount || 0}
        </MDButton>
      ),
    },
  ];

  const guidesColumns = [
    {
      name: "Type",
      selector: (row) => row.type,
      width: "100px",
      sortable: true,
      cell: (row) => (
        <MDBox display="flex" alignItems="center">
          <Icon fontSize="medium" color={row.type === "video" || row.videoUrl ? "error" : "info"}>
            {row.type === "video" || row.videoUrl ? "play_circle_filled" : "description"}
          </Icon>
          <MDTypography variant="caption" ml={1} fontWeight="medium">
            {row.type === "video" || row.videoUrl ? "Video" : "Text"}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
      cell: (row) => (
        <MDTypography variant="button" fontWeight="medium">
          {row.title}
        </MDTypography>
      ),
    },
    {
      name: "Tags",
      selector: (row) => (row.tags ? row.tags.join(", ") : ""),
      sortable: false,
      cell: (row) =>
        row.tags && row.tags.length > 0 ? (
          <MDBox display="flex" gap={0.5} flexWrap="wrap">
            {row.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </MDBox>
        ) : null,
    },
    {
      name: "Added By",
      selector: (row) => row.createdBy?.name || row.createdBy || "Unknown",
      sortable: true,
    },
    {
      name: "Date Added",
      selector: (row) => row.createdAt,
      sortable: true,
      format: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: "Actions",
      width: "150px",
      cell: (row) => (
        <MDBox display="flex" gap={0.5}>
          <Tooltip title="Edit Guide">
            <IconButton size="small" color="info" onClick={() => handleEditGuide(row)}>
              <Icon>edit</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to another model">
            <IconButton size="small" color="warning" onClick={() => handleOpenCopy(row)}>
              <Icon>content_copy</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Guide">
            <IconButton size="small" color="error" onClick={() => handleDeleteGuide(row)}>
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  const uniqueBrands = [...new Set(models.map((m) => m.Brand?.name).filter((n) => n))].sort();

  const filteredModels = models.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const brand = item.Brand?.name?.toLowerCase() || "";
    const model = item.Model?.toLowerCase() || "";
    const matchesSearch = brand.includes(searchLower) || model.includes(searchLower);
    const matchesBrand = selectedBrand ? item.Brand?.name === selectedBrand : true;
    return matchesSearch && matchesBrand;
  });

  const filteredGuides = guides.filter((guide) => {
    if (guideTagFilter === "All") return true;
    return guide.tags && guide.tags.includes(guideTagFilter);
  });

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
                  Repair Guides by Model
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Search Brand or Model"
                      variant="outlined"
                      fullWidth
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Brand</InputLabel>
                      <Select
                        value={selectedBrand}
                        label="Brand"
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {uniqueBrands.map((brand) => (
                          <MenuItem key={brand} value={brand}>
                            {brand}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <DataTable columns={columns} data={filteredModels} pagination />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Guides List Modal */}
      <Modal
        open={showGuidesModal}
        onClose={() => setShowGuidesModal(false)}
        aria-labelledby="guides-modal-title"
      >
        <MDBox sx={style}>
          <Grid container justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography id="guides-modal-title" variant="h5" component="h2">
              Guides for {selectedModel?.Brand?.name} {selectedModel?.Model}
            </MDTypography>
            <MDButton
              variant="contained"
              color="success"
              onClick={handleAddGuide}
              startIcon={<Icon>add</Icon>}
            >
              Add Guide
            </MDButton>
          </Grid>

          <MDBox mb={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Tag</InputLabel>
              <Select
                value={guideTagFilter}
                label="Filter by Tag"
                onChange={(e) => setGuideTagFilter(e.target.value)}
                sx={{ height: "44px" }}
              >
                <MenuItem value="All">All Tags</MenuItem>
                <MenuItem value="Troubleshooting">Troubleshooting</MenuItem>
                <MenuItem value="Guide">Guide</MenuItem>
              </Select>
            </FormControl>
          </MDBox>

          <MDBox mt={2}>
            {guides.length === 0 ? (
              <MDTypography>No guides available for this model.</MDTypography>
            ) : (
              <DataTable
                columns={guidesColumns}
                data={filteredGuides}
                pagination
                expandableRows
                expandableRowsComponent={GuideDetail}
                expandOnRowClicked
              />
            )}
          </MDBox>
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={() => setShowGuidesModal(false)}>
              Close
            </MDButton>
          </MDBox>
        </MDBox>
      </Modal>

      {/* Add Guide Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingGuideId ? "Edit Guide" : "Add New Guide"}</DialogTitle>
        <DialogContent>
          {!selectedModel && (
            <Grid container spacing={2} mt={1} mb={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={addModalBrand}
                    label="Brand"
                    onChange={(e) => {
                      setAddModalBrand(e.target.value);
                      setNewGuide({ ...newGuide, pevId: "" });
                    }}
                    sx={{ height: "44px" }}
                  >
                    {uniqueBrands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!addModalBrand}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={newGuide.pevId}
                    label="Model"
                    onChange={(e) => setNewGuide({ ...newGuide, pevId: e.target.value })}
                    sx={{ height: "44px" }}
                  >
                    {models
                      .filter((m) => m.Brand?.name === addModalBrand)
                      .sort((a, b) => a.Model.localeCompare(b.Model))
                      .map((m) => (
                        <MenuItem key={m._id} value={m._id}>
                          {m.Model}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Guide Title"
                value={newGuide.title}
                onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  value={newGuide.tags}
                  onChange={(e) =>
                    setNewGuide({
                      ...newGuide,
                      tags:
                        typeof e.target.value === "string"
                          ? e.target.value.split(",")
                          : e.target.value,
                    })
                  }
                  input={<OutlinedInput label="Tags" />}
                  renderValue={(selected) => (
                    <MDBox sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </MDBox>
                  )}
                >
                  <MenuItem value="Troubleshooting">Troubleshooting</MenuItem>
                  <MenuItem value="Guide">Guide</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newGuide.type}
                  label="Type"
                  onChange={(e) => setNewGuide({ ...newGuide, type: e.target.value })}
                  sx={{ height: "44px" }}
                >
                  <MenuItem value="text">Text / Rich Content</MenuItem>
                  <MenuItem value="video">Video (YouTube)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newGuide.type === "video" ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="YouTube URL"
                  value={newGuide.videoUrl}
                  onChange={(e) => setNewGuide({ ...newGuide, videoUrl: e.target.value })}
                  helperText="e.g. https://www.youtube.com/watch?v=..."
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <MDBox>
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
                            <MenuButtonAddTable />
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
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowAddModal(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSaveGuide} color="success">
            Save Guide
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Copy Guide Modal */}
      <Dialog open={showCopyModal} onClose={() => setShowCopyModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Copy Guide to Another Model</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" mb={2}>
            Copying <strong>&quot;{guideToCopy?.title}&quot;</strong>
          </MDTypography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Brand</InputLabel>
            <Select
              value={copyTargetBrand}
              label="Target Brand"
              onChange={(e) => {
                setCopyTargetBrand(e.target.value);
                setTargetModelId("");
              }}
              sx={{ height: "44px" }}
            >
              {uniqueBrands.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }} disabled={!copyTargetBrand}>
            <InputLabel>Target Model</InputLabel>
            <Select
              value={targetModelId}
              label="Target Model"
              onChange={(e) => setTargetModelId(e.target.value)}
              sx={{ height: "44px" }}
            >
              {models
                .filter(
                  (m) =>
                    m._id !== selectedModel?._id &&
                    (copyTargetBrand ? m.Brand?.name === copyTargetBrand : false)
                )
                .sort((a, b) => a.Model.localeCompare(b.Model))
                .map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.Model}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowCopyModal(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleCopyGuide} color="info">
            Copy
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default RepairGuides;
