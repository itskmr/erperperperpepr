# Authentication Components

This directory contains specialized login and registration form components for different user roles in the School ERP system.

## Components

- `ParentLoginForm.tsx`: A multi-step registration/login form for parents with parent-specific UI and messaging
- `StudentLoginForm.tsx`: A multi-step registration/login form for students with student-specific UI and messaging

## Forms Directory

The `forms/` directory contains the field components that are used in the login forms:

- `ParentLoginFields.tsx`: Input fields for the parent login process
- `StudentLoginFields.tsx`: Input fields for the student login process

## Authentication Flow

The login flow follows these steps:

1. **Invitation Verification**: User enters an invitation code (UUID) provided by the school
2. **Email Entry**: After verification, user enters their email address
3. **Password Creation**: User creates a secure password with validation
4. **Password Confirmation**: User confirms their password to complete registration

## Implementation Details

- Each form has a dedicated hardcoded UUID for testing purposes:
  - Parent: `5f9d3c4a-6e8b-4f1c-9d2e-0b7a8c6d5e4f`
  - Student: `e76c8a5b-3f9d-4e8c-b7a1-2d5f9c8b3a6e`

- The forms use Framer Motion for smooth transitions between steps
- Each step has its own validation rules
- Demo mode auto-fills all fields and advances through verification

## Props Interface

Both specialized forms accept the same props:

```typescript
interface LoginFormProps {
  onSubmit: (formData: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error: string;
  useDemo: boolean;
  setUseDemo: (useDemo: boolean) => void;
  onBack: () => void;
}
```

## Demo Accounts

Each component maintains its own demo account credentials to pre-fill the form when the demo mode is selected.

## Theming

- Parent login uses pink-themed colors and UI elements
- Student login uses amber-themed colors and UI elements

## Connection to Main Login

The specialized forms handle their own form validation and UI state but delegate the actual submission and authentication to the parent `LoginForm` component. 