import { useState, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface FormValidationReturn<T> {
  values: T;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isFieldValid: (name: keyof T) => boolean;
  isFieldFilled: (name: keyof T) => boolean;
  isFieldTouched: (name: keyof T) => boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  validateAll: () => boolean;
  reset: () => void;
}

const useFormValidation = <T extends Record<string, any>>(initialValues: T, validationRules: { [K in keyof T]?: ValidationRule[] }): FormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field
  const validateField = (name: keyof T, value: any): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        return rule.message;
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        return rule.message;
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }
    }

    return '';
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    for (const fieldName in validationRules) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName as string] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input change with appropriate validation timing
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Check if this is a required field
    const rules = validationRules[name];
    const isRequired = rules?.some(rule => rule.required);

    // Always validate required fields, and also validate when there's content or an existing error
    if (isRequired || value !== '' || errors[name as string]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      // Clear the error if the field is empty and not required
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name as string]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Reset form
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  // Check if the form is valid (no errors and all required fields are filled)
  const isFormValid = () => {
    // First check if there are any errors (non-empty error strings) in the errors object
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      return false;
    }

    // Check that all required fields are filled
    for (const fieldName in validationRules) {
      const rules = validationRules[fieldName as keyof T];
      if (rules) {
        const isRequired = rules.some(rule => rule.required);
        if (isRequired) {
          const value = values[fieldName as keyof T];
          // Check if the value is undefined, null, or an empty string after trimming
          if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
            return false; // Required field is not filled
          }
        }
      }
    }

    return true;
  };

  return {
    values,
    errors,
    touched,
    isValid: isFormValid(),
    isFieldValid: (name: keyof T) => !errors[name as string] && values[name as string] !== undefined,
    isFieldFilled: (name: keyof T) => values[name as string] !== undefined && values[name as string] !== '',
    isFieldTouched: (name: keyof T) => !!touched[name as string],
    handleChange,
    handleBlur,
    validateAll,
    reset
  };
};

export default useFormValidation;