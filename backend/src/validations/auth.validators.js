export const nameValidator = (name) => {
  const errors = [];

  if (typeof name !== "string") {
    errors.push("Name must be a string");
    return { valid: false, errors };
  }

  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    errors.push("Name must be between 3 to 50 characters");
  }

  // Must not start with number or underscore
  if (/^[0-9_]/.test(trimmed)) {
    errors.push("Name must not start with a number or underscore");
  }

  // allowed: letters, numbers, spaces, underscores
  if (!/^[A-Za-z0-9_\s]+$/.test(trimmed)) {
    errors.push("Name must not contain any special characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};



export const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};



export const passwordValidator = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push("Password must contain at least 1 letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least 1 number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};



export const avatarValidator = (file) => {
  const maxSize = 2 * 1024 * 1024; // 2 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!file) return true;

  return file.size <= maxSize && allowedTypes.includes(file.mimetype);
};


