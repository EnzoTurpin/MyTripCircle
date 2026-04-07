const auth = {
  en: {
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
  },
  fr: {
    forgotPassword: {
      title: "Mot de passe oublié",
      subtitle:
        "Entre ton email pour recevoir un lien de réinitialisation",
      resetPasswordTitle: "Réinitialiser le mot de passe",
      resetPasswordSubtitle: "Entrez votre nouveau mot de passe",
      emailPlaceholder: "Entrez votre adresse e-mail",
      newPasswordLabel: "Nouveau mot de passe",
      newPasswordPlaceholder: "Entrez votre nouveau mot de passe",
      confirmPasswordLabel: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "Ré-entrez votre nouveau mot de passe",
      sendResetLink: "Envoyer le lien de réinitialisation",
      resetPassword: "Réinitialiser le mot de passe",
      emailSentTitle: "E-mail envoyé",
      emailSentMessage:
        "Nous avons envoyé un lien de réinitialisation à {{email}}",
      checkEmailHint:
        "Veuillez vérifier votre boîte de réception et suivre les instructions.",
      successTitle: "Mot de passe réinitialisé",
      successMessage:
        "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      requestError:
        "Échec de l'envoi de l'e-mail de réinitialisation. Veuillez réessayer.",
      resetError:
        "Échec de la réinitialisation du mot de passe. Le lien a peut-être expiré. Veuillez en demander un nouveau.",
      passwordsDontMatch: "Les mots de passe ne correspondent pas.",
      verifyingToken: "Vérification…",
      invalidLinkTitle: "Lien invalide",
      invalidLinkMessage:
        "Ce lien de réinitialisation est invalide ou a déjà été utilisé.",
      backToLogin: "Retour à la connexion",
      spamHint:
        "Vérifie aussi tes spams si tu ne reçois pas l'email dans les 5 minutes.",
    },
    otp: {
      title: "Vérifie ton email",
      subtitlePrefix: "Un code à 6 chiffres a été envoyé à ",
      subtitleEmailFallback: "ton adresse email",
      otpBoxPlaceholder: "–",
      codeLengthError: "Le code doit contenir 6 chiffres.",
      invalidCodeError: "Code invalide.",
      genericVerifyError: "Une erreur est survenue. Réessaie.",
      verifyButton: "Vérifier le code",
      verifying: "Vérification…",
      resendCountdown: "Pas reçu ? Renvoyer dans {{count}}s",
      resendDone: "Code renvoyé ✓",
      resendLink: "Pas reçu ? Renvoyer le code",
      resendAlertTitle: "Code renvoyé",
      resendAlertWithEmail: "Un nouveau code a été envoyé à {{email}}.",
      resendAlertNoEmail: "Un nouveau code a été envoyé.",
      resendErrorTitle: "Erreur",
      resendErrorMessage: "Impossible de renvoyer le code.",
    },
  },
};

export default auth;
