import React from "react";
import { Fade, Box } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FormCard from "../FormCard";
import { SelectField, DateField, InputField } from "../FormFields";
import { FieldsRow } from "../../styles/styledComponents";
import {
  manoiyaOptions,
  performenceExpectationOptions,
  intendedOptions,
} from "../../../../assets";

const StepPkuda = ({ formData, onChange }) => {
  return (
    <Fade in={true} timeout={400}>
      <Box>
        <FormCard
          icon={AssignmentIcon}
          title='פקודת חט"כ'
          subtitle="פרטי פקודה והקצאה"
        >
          <FieldsRow>
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
          </FieldsRow>
        </FormCard>
      </Box>
    </Fade>
  );
};

export default StepPkuda;
