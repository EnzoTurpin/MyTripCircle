const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

export const isEmailValid = (email: string): boolean => EMAIL_REGEX.test(email);

export const isPasswordPresent = (password: string): boolean => password.length > 0;

export const isPasswordStrong = (password: string): boolean => STRONG_PASSWORD_REGEX.test(password);

export const isNameValid = (name: string): boolean => name.trim().length >= 2;

export const isPhoneValid = (phone: string): boolean => {
  const value = phone.trim();
  if (!value) return true; // phone is optional
  return PHONE_REGEX.test(value);
};

export const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replaceAll(/\D/g, "");
  const trimmed = cleaned.slice(0, 10);
  return trimmed.replaceAll(/(\d{2})(?=\d)/g, "$1 ");
};
