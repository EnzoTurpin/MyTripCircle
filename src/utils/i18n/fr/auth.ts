const auth = {
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
};

export default auth;
