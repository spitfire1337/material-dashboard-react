import React, { useState, useRef } from "react";
//Global
import { globalFuncs } from "../../../context/global";

import SignatureCanvas from "react-signature-canvas";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import moment from "moment";
import parse from "html-react-parser";
import { FormControl, Grid } from "@mui/material";

import vars from "../../../config";

const step5 = ({
  globalFunc,
  repairID,
  nextRepairStep,
  newConsignmentData,
  updateConsignmentData,
  reRender,
  setNewRepair,
  customerName,
}) => {
  const { setSnackBar } = globalFuncs();
  const signatureCanvasRef = useRef(null);

  const clearSignature = () => {
    signatureCanvasRef.current.clear();
  };

  const saveSignature = () => {
    if (signatureCanvasRef.current.isEmpty()) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Signature is required to continue",
        show: true,
        icon: "warning",
      });
      return;
    }
    const signatureImage = signatureCanvasRef.current.toDataURL();
    let consignmentData = { ...newConsignmentData };
    updateConsignmentData({
      ...newConsignmentData,
      customerSignature: signatureImage,
    });
    console.log("Signature ", signatureImage);
    nextRepairStep(6);
  };
  const submitConsignment = async (pev) => {
    try {
      let postData = {
        id: repairID,
      };
      const response = await fetch(`${vars.serverUrl}/repairs/printDropOff`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        reRender();
        setNewRepair(false);
        nextRepairStep(5);
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Sent to printer",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error occurred saving repair progress.",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Error occurred saving repair progress.",
        show: true,
        icon: "warning",
      });
    }
  };

  return (
    <>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <MDTypography variant="h4" color="text">
                <u>Consignment Agreement (Please read carefully and sign below)</u>
              </MDTypography>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="body2" color="text">
                This Consignment Agreement (Agreement) is entered into on this{" "}
                <u>{moment().format("DD")}</u> day of <u>{moment().format("MMMM")}</u>,{" "}
                <u>{moment().format("YYYY")}</u>, by and between:
              </MDTypography>
            </Grid>
            <Grid item sm={6}>
              <MDTypography variant="body2" color="text">
                <u>Consignor: </u>
                <br /> {customerName.name} (Owner of the Item) <br /> {customerName.address1}
                {customerName.address2 != undefined ? <br /> & `${customerName.address2}` : " "}
                <br /> {customerName.city}, {customerName.state} {customerName.zip}
                <br /> {customerName.email}
                <br /> {customerName.phone}
              </MDTypography>
            </Grid>
            <Grid item sm={6}>
              <MDTypography variant="body2" color="text" style={{ textAlign: "right" }}>
                <u>Consignee: </u>
                <br /> PEV Connection, LLC <br /> 1831 N Highland Ave
                <br /> Suite 50
                <br /> Clearwater, FL 33755
                <br /> support@pevconnection.com
                <br /> (727)-223-4766
              </MDTypography>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                1. APPOINTMENT OF CONSIGNMENT:
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body1">
                  The Consignor grants PEV Connection, LLC the exclusive right to display and sell
                  the items listed in Exhibit A (the &quot;Goods&quot;) under the terms and
                  conditions of this Agreement.
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                2. OWNERSHIP & REPRESENTATION:
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body1">
                  The Consignor warrants that they are the sole owner of the Goods and that the
                  Goods are free of all liens, encumbrances, or security interests. Ownership
                  remains with the Consignor until the item is sold.
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                3. PRICING & SALES:
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body1">
                  Agreed List Price:{" "}
                  <u>
                    $
                    {(
                      Number(
                        newConsignmentData.itemData.variations[0].itemVariationData.priceMoney
                          .amount
                      ) / 100
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </u>
                  <br />
                  PEV Connection, LLC agrees not to sell the Goods below the List Price without{" "}
                  written or electronic consent from the Consignor.
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                4. COMMISSION & PAYMENT STRUCTURE:
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body1">
                  Upon the successful sale of the Goods, PEV Connection, LLC shall retain a
                  commission based on the final gross sales price and the payment method used by the
                  buyer (examples below):
                  <Grid container>
                    <Grid sm={4} sx={{ border: "#000 1px" }}>
                      Payment Method
                    </Grid>
                    <Grid sm={4} sx={{ border: "#000 1px" }}>
                      % Consignor Payout
                    </Grid>
                    <Grid sm={4}>$ Consignor Payout</Grid>
                    <Grid sm={4}>Cash/Acima</Grid>
                    <Grid sm={4}>90%</Grid>
                    <Grid sm={4}>
                      $
                      {(
                        (Number(
                          newConsignmentData.itemData.variations[0].itemVariationData.priceMoney
                            .amount
                        ) /
                          100) *
                        0.9
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Grid>
                    <Grid sm={4}>Credit/Debit card</Grid>
                    <Grid sm={4}>85%</Grid>
                    <Grid sm={4}>
                      $
                      {(
                        (Number(
                          newConsignmentData.itemData.variations[0].itemVariationData.priceMoney
                            .amount
                        ) /
                          100) *
                        0.85
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Grid>
                    <Grid sm={4}>Afterpay</Grid>
                    <Grid sm={4}>80%</Grid>
                    <Grid sm={4}>
                      $
                      {(
                        (Number(
                          newConsignmentData.itemData.variations[0].itemVariationData.priceMoney
                            .amount
                        ) /
                          100) *
                        0.8
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Grid>
                    <Grid sm={12}>
                      Note: Commissions are calculated based on the total sale price, excluding any{" "}
                      applicable Florida sales tax collected.
                    </Grid>
                  </Grid>
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                5. DURATION & TERMINATION
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body">
                  This Agreement shall be effective for a period of <u>90</u> days. The expiration
                  date of this aggreement unless otherwise agreed or extended will be on{" "}
                  {moment().add(90, "days").format("MM/DD/YYYY")}. If the Goods remain unsold after
                  this period, the Consignor may:
                  <div style={{ paddingLeft: "30px" }}>
                    <ul>
                      <li style={{ marginLeft: "20px" }}>Extend the agreement</li>
                      <li style={{ marginLeft: "20px" }}>
                        Retrieve the goods at no cost (provided all transport costs are handled by
                        the Consignor)
                      </li>
                      <li style={{ marginLeft: "20px" }}>Authorize a price reduction.</li>
                    </ul>
                  </div>
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                6. LOSS & DAMAGE
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body">
                  PEV Connection, LLC agrees to take reasonable care of the Goods while in their{" "}
                  possession. However, the Consignor acknowledges that the Goods are consigned at
                  the Consignor&lsquo;s risk. PEV Connection, LLC is not liable for loss or damage
                  due to fire, theft, or natural disasters unless caused by gross negligence.
                </MDTypography>
              </div>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                7. GOVERNING LAW
              </MDTypography>
              <div style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <MDTypography variant="body">
                  This Agreement shall be governed by and construed in accordance with the laws of
                  the State of Florida. Any disputes arising from this Agreement shall be
                  jurisdiction of Pinellas County, Florida.
                </MDTypography>
              </div>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="h5" sx={{ marginTop: "10px" }}>
                EXHIBIT A: DESCRIPTION OF GOODS
              </MDTypography>
              <MDTypography variant="body">
                <div style={{ paddingLeft: "30px" }}>
                  <ul>
                    <li style={{ marginLeft: "20px" }}>
                      Make/Model: {newConsignmentData.itemData.name}
                    </li>
                    <li style={{ marginLeft: "20px" }}>
                      Serial number: {newConsignmentData.PEVSerialNumber}
                    </li>
                    <li style={{ marginLeft: "20px" }}>
                      Other info: <br />{" "}
                      <div style={{ paddingLeft: "20px" }}>
                        {parse(newConsignmentData.itemData.descriptionHtml)}
                      </div>
                    </li>
                  </ul>
                </div>
              </MDTypography>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="h6" color="text">
                Acknowledgement:
              </MDTypography>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="body2" color="text">
                By signing below, I acknowledge that I have read and agree to the terms and
                conditions of this consignment agreement. I understand that the consignor is
                responsible for ensuring that the item(s) being consigned are in good working
                condition and free from any liens or encumbrances. I agree to the consignment fees
                and understand that the consignor will receive payment only after the item(s) have
                been sold. I acknowledge that the consignor is not responsible for any loss or
                damage to the item(s) while in their care. I certify that all information provided
                in this agreement is accurate and complete to the best of my knowledge.
              </MDTypography>
            </Grid>
            <Grid item sm={9}>
              <div className={"container"}>
                <div className={"sigContainer"}>
                  <SignatureCanvas
                    ref={signatureCanvasRef}
                    penColor="blue"
                    canvasProps={{ className: "signature-canvas" }}
                  />
                </div>
              </div>
            </Grid>
            <Grid item sm={3} sx={{ textAlign: "center", width: "100%" }}>
              <MDTypography variant="body" sx={{ textAlign: "center", width: "100%" }}>
                {moment().format("MM/DD/YYYY")}
              </MDTypography>
            </Grid>
            <Grid item sm={9} sx={{ textAlign: "center", width: "100%" }}>
              <MDTypography variant="body">Customer signature</MDTypography>
            </Grid>
            <Grid item sm={3} sx={{ textAlign: "center", width: "100%" }}>
              <MDTypography variant="body">Date</MDTypography>
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth color="success" onClick={() => saveSignature()}>
                Submit
              </MDButton>
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth color="warning" onClick={() => clearSignature()}>
                Clear signature
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step5;
