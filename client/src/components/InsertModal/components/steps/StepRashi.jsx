import React from 'react';
import { Fade, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import FormCard from '../FormCard';
import { SelectField, AutocompleteField, InputField, DateField } from '../FormFields';
import { FieldsRow, FieldsRowTwo, FullWidthField } from '../../styles/styledComponents';
import { hatakStatusOptions, hatakTypeOptions, manoiyaOptions, tipulTypeOptions, zadikOptions } from '../../../../assets';
import { useEngineSerials } from '../../../../contexts/EngineSerialContext';

const StepRashi = ({
  formData,
  errors,
  onChange,
}) => {

  const { enginesList, loading, error, fetchEngineSerials } = useEngineSerials()


  return (
    <Fade in={true} timeout={400}>
      <Box>
        <FormCard
          icon={SettingsIcon}
          title="פרטי הציוד"
          subtitle="הזן את פרטי הציוד הבסיסיים"
        >
          <FieldsRow>
            <SelectField
              name="manoiya"
              label="מנועיה"
              options={manoiyaOptions}
              value={formData.manoiya}
              onChange={onChange}
              required
              error={errors.manoiya}
            />
            <SelectField
              name="hatakType"
              label='סוג חט"כ'
              options={hatakTypeOptions}
              value={formData.hatakType}
              onChange={onChange}
              required
              error={errors.hatakType}
            />
            <AutocompleteField
              name="zadik"
              label="צ' כלי"
              freeSolo
              options={zadikOptions}
              value={formData.zadik}
              onChange={onChange}
            />
          </FieldsRow>

          <FieldsRow>
            <AutocompleteField
              name="engineSerial"
              label="מספר מנוע"
              options={enginesList} // Pass existing engine serials here if you have them
              value={formData.engineSerial}
              onChange={onChange}
              required
              error={errors.engineSerial}
              freeSolo={true}
            />
            <InputField
              name="minseretSerial"
              label="מספר ממסרת"
              value={formData.minseretSerial}
              onChange={onChange}
            />
            <SelectField
              name="hatakStatus"
              label='סטטוס חט"כ'
              options={hatakStatusOptions}
              value={formData.hatakStatus}
              onChange={onChange}
              required
              error={errors.hatakStatus}
            />
          </FieldsRow>
        </FormCard>

        <FormCard
          icon={BuildIcon}
          title="פרטי הטיפול"
          subtitle="הזן את פרטי הטיפול והתקלה"
        >
          <FieldsRowTwo>
            <SelectField
              name="tipulType"
              label="סוג טיפול"
              options={tipulTypeOptions}
              value={formData.tipulType}
              onChange={onChange}
              required
              error={errors.tipulType}
            />
            <DateField
              name="reciveDate"
              label="תאריך קבלה"
              value={formData.reciveDate}
              onChange={onChange}
              required
              error={errors.reciveDate}
            />
          </FieldsRowTwo>

          <FullWidthField>
            <InputField
              name="problem"
              label="פירוט תקלה"
              value={formData.problem}
              onChange={onChange}
              required
              error={errors.problem}
              multiline
            />
          </FullWidthField>
        </FormCard>
      </Box>
    </Fade>
  );
}

export default StepRashi;