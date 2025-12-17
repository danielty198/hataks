import React from 'react';
import { Fade, Box } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FormCard from '../FormCard';
import { SelectField, DateField } from '../FormFields';
import { FieldsRow } from '../../styles/styledComponents';
import { intendedOptions, manoiyaOptions, waitingHHTypeOptions, michlalNeedOptions, performenceOptions, waitingHHTypeRequiredString } from '../../../../assets';

const StepAcher = ({
  formData,
  errors = {},
  onChange,
}) => {
  // Check if waitingHHType is required based on hatakStatus
  const isWaitingHHTypeRequired = formData.hatakStatus === waitingHHTypeRequiredString;

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
          </FieldsRow>

          <FieldsRow>
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
              options={performenceOptions}
              value={formData.performenceExpectation}
              onChange={onChange}
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

export default StepAcher;