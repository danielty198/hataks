import React from 'react';
import { Fade, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import FormCard from '../FormCard';
import { SelectField, AutocompleteField } from '../FormFields';
import { FieldsRow } from '../../styles/styledComponents';
import { colors } from '../../constants';

const StepYechida = ({
  formData,
  onChange,
  ogdotOptions,
  brigadeOptions,
  battalionOptions,
}) => (
  <Fade in={true} timeout={400}>
    <Box>
      <FormCard
        icon={GroupsIcon}
        title="יחידה מוסרת"
        subtitle="פרטי היחידה שמוסרת את הציוד"
      >
        <FieldsRow>
          <SelectField
            name="sendingDivision"
            label="אוגדה מוסרת"
            options={ogdotOptions}
            value={formData.sendingDivision}
            onChange={onChange}
          />
          <AutocompleteField
            name="sendingBrigade"
            label="חטיבה מוסרת"
            options={brigadeOptions}
            value={formData.sendingBrigade}
            onChange={onChange}
          />
          <AutocompleteField
            name="sendingBattalion"
            label="גדוד מוסר"
            options={battalionOptions}
            value={formData.sendingBattalion}
            onChange={onChange}
          />
        </FieldsRow>
      </FormCard>

      <FormCard
        icon={GroupsIcon}
        title="יחידה מקבלת"
        subtitle="פרטי היחידה שמקבלת את הציוד"
        iconGradient={`linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`}
      >
        <FieldsRow>
          <SelectField
            name="recivingDivision"
            label="אוגדה מקבלת"
            options={ogdotOptions}
            value={formData.recivingDivision}
            onChange={onChange}
          />
          <AutocompleteField
            name="recivingBrigade"
            label="חטיבה מקבלת"
            options={brigadeOptions}
            value={formData.recivingBrigade}
            onChange={onChange}
          />
          <AutocompleteField
            name="recivingBattalion"
            label="גדוד מקבל"
            options={battalionOptions}
            value={formData.recivingBattalion}
            onChange={onChange}
          />
        </FieldsRow>
      </FormCard>
    </Box>
  </Fade>
);

export default StepYechida;