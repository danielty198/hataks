import React from "react";
import { Fade, Box } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FormCard from "../FormCard";
import { SelectField, InputField } from "../FormFields";
import { FieldsRow } from "../../styles/styledComponents";
import {
  manoiyaOptions,
  waitingHHTypeOptions,
  waitingHHTypeRequiredString,
  engineFaultBankOptions,
  minseretFaultBankOptions,
} from "../../../../assets";

const StepAcher = ({ formData, errors = {}, onChange }) => {
  const isWaitingHHTypeRequired =
    formData.hatakStatus === waitingHHTypeRequiredString;

  return (
    <Fade in={true} timeout={400}>
      <Box>
        <FormCard
          icon={MoreHorizIcon}
          title="פרטים נוספים"
          subtitle="מידע נוסף על הציוד והטיפול"
        >
          <FieldsRow>
            <SelectField
              name="waitingHHType"
              label='ח"ח ממתין'
              multiple
              options={waitingHHTypeOptions}
              value={formData.waitingHHType}
              onChange={onChange}
              error={errors.waitingHHType}
              required={isWaitingHHTypeRequired}
            />
            <InputField
              name="detailsHH"
              options={[]}
              label="פירוט חח"
              value={formData.detailsHH || ""}
              onChange={onChange}
              disable={formData.waitingHHType?.includes("אחר") ? false : true}
            />
            <SelectField
              name="shinoa"
              label="שינוע"
              options={manoiyaOptions}
              value={formData.shinoa}
              onChange={onChange}
            />
            <InputField name="pca" label='פק"ע' value={formData.pca || ""} onChange={onChange} />
            <InputField
              name="outgoingEngine"
              label="מנוע יוצא"
              value={formData.outgoingEngine || ""}
              onChange={onChange}
            />
            <InputField
              name="shamOutgoingEngine"
              label='שע"מ מנוע יוצא'
              value={formData.shamOutgoingEngine || ""}
              onChange={onChange}
            />
            <InputField
              name="outgoingMinseret"
              label="ממסרת יוצאת"
              value={formData.outgoingMinseret || ""}
              onChange={onChange}
            />
            <InputField
              name="shamOutgoingMinseret"
              label='שע"מ ממסרת יוצאת'
              value={formData.shamOutgoingMinseret || ""}
              onChange={onChange}
            />
            <SelectField
              name="engineFaultBank"
              label="בנק תקלות מנוע"
              options={engineFaultBankOptions}
              value={formData.engineFaultBank}
              onChange={onChange}
            />
            <SelectField
              name="minseretFaultBank"
              label="בנק תקלות ממסרת"
              options={minseretFaultBankOptions}
              value={formData.minseretFaultBank}
              onChange={onChange}
            />
            <InputField
              name="engineDeactivationNumber"
              label="מספר השבתה מנוע"
              value={formData.engineDeactivationNumber || ""}
              onChange={onChange}
            />
            <InputField
              name="minseretDeactivationNumber"
              label="מספר השבתה ממסרת"
              value={formData.minseretDeactivationNumber || ""}
              onChange={onChange}
            />
          </FieldsRow>
        </FormCard>
      </Box>
    </Fade>
  );
};

export default StepAcher;
