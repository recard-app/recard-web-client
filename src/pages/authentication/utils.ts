/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Prevents user enumeration by using generic messages for auth failures.
 */
export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled';
    default:
      return error?.message || 'An error occurred. Please try again';
  }
};
