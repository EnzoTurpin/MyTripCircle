const auth = {
  forgotPassword: {
    title: "Forgot Password",
    subtitle: "Enter your email address and we'll send you a reset link",
    resetPasswordTitle: "Reset Password",
    resetPasswordSubtitle: "Enter your new password",
    emailPlaceholder: "Enter your email address",
    newPasswordLabel: "New password",
    newPasswordPlaceholder: "Enter your new password",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your new password",
    sendResetLink: "Send Reset Link",
    resetPassword: "Reset Password",
    emailSentTitle: "Email Sent",
    emailSentMessage: "We've sent a password reset link to {{email}}",
    checkEmailHint: "Please check your inbox and follow the instructions.",
    successTitle: "Password Reset",
    successMessage:
      "Your password has been reset successfully. You can now log in with your new password.",
    requestError: "Failed to send reset email. Please try again.",
    resetError:
      "Failed to reset password. The link may have expired. Please request a new one.",
    passwordsDontMatch: "Passwords do not match.",
    verifyingToken: "Verifying…",
    invalidLinkTitle: "Invalid link",
    invalidLinkMessage:
      "This reset link is invalid or has already been used.",
    backToLogin: "Back to sign in",
    spamHint:
      "Check your spam folder if you don't receive the email within 5 minutes.",
  },
  otp: {
    title: "Check your email",
    subtitlePrefix: "A 6-digit code was sent to ",
    subtitleEmailFallback: "your email address",
    otpBoxPlaceholder: "–",
    codeLengthError: "The code must be 6 digits.",
    invalidCodeError: "Invalid code.",
    genericVerifyError: "Something went wrong. Please try again.",
    verifyButton: "Verify code",
    verifying: "Verifying…",
    resendCountdown: "Didn't get it? Resend in {{count}}s",
    resendDone: "Code sent ✓",
    resendLink: "Didn't get it? Resend code",
    resendAlertTitle: "Code sent",
    resendAlertWithEmail: "A new code has been sent to {{email}}.",
    resendAlertNoEmail: "A new code has been sent.",
    resendErrorTitle: "Error",
    resendErrorMessage: "Unable to resend the code.",
  },
};

export default auth;
