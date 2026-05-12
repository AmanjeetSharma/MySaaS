export const organizationNameValidator = (name) => {
    const errors = [];

    if (typeof name !== "string") {
        errors.push("Organization name must be a string");

        return {
            valid: false,
            errors,
        };
    }

    const trimmed = name.trim();

    if (!trimmed) {
        errors.push("Organization name is required");
    }

    // Length check
    if (trimmed.length < 3 || trimmed.length > 80) {
        errors.push("Organization name must be between 3 and 80 characters");
    }

    /**
     * Allowed:
     * Letters
     * Numbers
     * Spaces
     * & . , ' ( ) - _
     */
    const allowedRegex = /^[A-Za-z0-9&.,'()\-_\s]+$/;

    if (!allowedRegex.test(trimmed)) {
        errors.push(
            "Organization name contains invalid characters"
        );
    }

    // Prevent starting with weird symbols
    if (/^[-_.,&'()]/.test(trimmed)) {
        errors.push(
            "Organization name cannot start with special characters"
        );
    }

    // Prevent only-symbol names
    if (!/[A-Za-z0-9]/.test(trimmed)) {
        errors.push(
            "Organization name must contain at least one letter or number"
        );
    }

    // Prevent multiple consecutive spaces
    if (/\s{2,}/.test(trimmed)) {
        errors.push(
            "Organization name cannot contain multiple consecutive spaces"
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};