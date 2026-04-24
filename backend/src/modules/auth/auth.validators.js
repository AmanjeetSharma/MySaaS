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
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const result = {
    valid: true,
    errors: []
  };

  if (!file) return result;

  if (!allowedTypes.includes(file.mimetype)) {
    result.valid = false;
    result.errors.push("Only JPEG, PNG, and WebP images are allowed");
    return result; // if type is invalid, no need to check size
  }

  if (file.size > maxSize) {
    result.valid = false;
    result.errors.push("Image size must be 5 MB or less");
  }

  return result;
};

