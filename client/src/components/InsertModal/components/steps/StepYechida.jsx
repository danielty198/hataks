import React from 'react';
import { Fade, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import FormCard from '../FormCard';
import { SelectField, InputField } from '../FormFields';
import { FieldsRow } from '../../styles/styledComponents';
import { ogdotOptions,colors  } from '../../../../assets';

const StepYechida = ({
  formData,
  onChange,
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
          <InputField
            name="sendingBrigade"
            label="חטיבה מוסרת"
            value={formData.sendingBrigade}
            onChange={onChange}
          />
          <InputField
            name="sendingBattalion"
            label="גדוד מוסר"
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
          <InputField
            name="recivingBrigade"
            label="חטיבה מקבלת"
            value={formData.recivingBrigade}
            onChange={onChange}
          />
          <InputField
            name="recivingBattalion"
            label="גדוד מקבל"
            value={formData.recivingBattalion}
            onChange={onChange}
          />
        </FieldsRow>
      </FormCard>
    </Box>
  </Fade>
);

export default StepYechida;