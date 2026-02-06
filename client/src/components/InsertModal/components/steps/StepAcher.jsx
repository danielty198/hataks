import React from "react";
import { Fade, Box } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FormCard from "../FormCard";
import { SelectField, DateField, InputField } from "../FormFields";
import { FieldsRow } from "../../styles/styledComponents";
import {
  intendedOptions,
  manoiyaOptions,
  waitingHHTypeOptions,
  michlalNeedOptions,
  performenceExpectationOptions,
  waitingHHTypeRequiredString,
} from "../../../../assets";

const StepAcher = ({ formData, errors = {}, onChange }) => {
  // Check if waitingHHType is required based on hatakStatus
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
              name="michlalNeed"
              label="צריכת מכלל"
              options={michlalNeedOptions}
              value={formData.michlalNeed}
              onChange={onChange}
            />
            <DateField
              name="startWorkingDate"
              label="תאריך לפקודה"
              value={formData.startWorkingDate}
              onChange={onChange}
            />

            <SelectField
              name="forManoiya"
              label="מנועיה לפקודה"
              options={manoiyaOptions}
              value={formData.forManoiya}
              onChange={onChange}
            />

            <SelectField
              name="performenceExpectation"
              label="צפי ביצוע"
              options={performenceExpectationOptions}
              value={formData.performenceExpectation}
              onChange={onChange}
            />
            <InputField
              name="detailsOfNonCompliance"
              label="פירוט אי עמידה"
              options={[]}
              value={formData.detailsOfNonCompliance || ""}
              onChange={onChange}
              disable={formData.performenceExpectation === "לא" ? false : true}
            />
            <SelectField
              name="intended"
              label="מתוכנן ל"
              options={intendedOptions}
              value={formData.intended}
              onChange={onChange}
            />
            <InputField name = "pca" label='פק"ע' value={formData.pca || ""} onChange={onChange} />
            <InputField name = "deactivationCertificate" label='תעודת השבתה' value={formData.deactivationCertificate || ""} onChange={onChange} />
          </FieldsRow>
        </FormCard>
      </Box>
    </Fade>
  );
};

export default StepAcher;