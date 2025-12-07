import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ColorlibConnector, ColorlibStepIconRoot } from '../styles/styledComponents';
import { colors, steps } from '../constants';

const stepIcons = {
  1: <SettingsIcon sx={{ fontSize: 26 }} />,
  2: <GroupsIcon sx={{ fontSize: 26 }} />,
  3: <MoreHorizIcon sx={{ fontSize: 26 }} />,
};

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 28 }} /> : stepIcons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const StepperHeader = ({ activeStep }) => (
  <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
    <Stepper activeStep={activeStep} alternativeLabel connector={<ColorlibConnector />}>
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel StepIconComponent={ColorlibStepIcon}>
            <Typography
              variant="subtitle1"
              fontWeight={activeStep === index ? 700 : 500}
              color={activeStep === index ? colors.primary : 'text.secondary'}
              sx={{ mt: 1 }}
            >
              {step.label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

export default StepperHeader;