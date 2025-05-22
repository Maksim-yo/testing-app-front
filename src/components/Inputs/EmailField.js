import { useEffect, useState } from "react";
import { TextField, IconButton, Tooltip, Typography, Box } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckIcon from "@mui/icons-material/Check";
import EmailIcon from "@mui/icons-material/Email";

function EmailField({
  control,
  emailVerified,
  originalEmail,
  triggerEmailVerification,
  isSaving,
  setError,
  clearErrors,
}) {
  const { watch, setValue } = control;
  const email = watch("email");
  const [emailChanged, setEmailChanged] = useState(false);
  const [showVerificationHint, setShowVerificationHint] = useState(false);

  const emailNeedsVerification = email !== originalEmail || !emailVerified;

  useEffect(() => {
    setEmailChanged(email !== originalEmail);
  }, [email, originalEmail]);

  useEffect(() => {
    if (isSaving && emailNeedsVerification) {
      setError("email", {
        type: "manual",
        message: "Подтвердите почту перед сохранением.",
      });
      setShowVerificationHint(true);
    } else {
      clearErrors("email");
      setShowVerificationHint(false);
    }
  }, [isSaving]);

  return (
    <Box position="relative">
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={email}
        onChange={(e) => setValue("email", e.target.value)}
        error={showVerificationHint}
        helperText={
          showVerificationHint ? "Подтвердите почту перед сохранением." : ""
        }
        InputProps={{
          endAdornment: emailNeedsVerification && (
            <>
              <Tooltip title="Требуется подтверждение">
                <ErrorOutlineIcon color="warning" sx={{ mr: 1 }} />
              </Tooltip>
              <Tooltip title="Отправить подтверждение">
                <IconButton onClick={() => triggerEmailVerification(email)}>
                  <EmailIcon color="primary" />
                </IconButton>
              </Tooltip>
            </>
          ),
        }}
      />
    </Box>
  );
}
