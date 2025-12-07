import React from 'react';
import { Box, Typography } from '@mui/material';
import { FormCardStyled, SectionTitle, SectionIcon } from '../styles/styledComponents';
import { colors } from '../constants';

const FormCard = ({ icon: Icon, title, subtitle, children, iconGradient }) => (
  <FormCardStyled elevation={0}>
    <SectionTitle>
      <SectionIcon sx={iconGradient ? { background: iconGradient } : {}}>
        <Icon />
      </SectionIcon>
      <Box>
        <Typography variant="h6" fontWeight={700} color={colors.primary}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </SectionTitle>
    {children}
  </FormCardStyled>
);

export default FormCard;