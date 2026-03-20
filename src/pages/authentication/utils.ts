import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { PAGES } from '../../types';
import { logError } from '../../utils/logger';

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
      return 'Unable to create account with this email. Try signing in or use a different email.';
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

/**
 * Authenticate, sync account with backend, and navigate based on sync status.
 * Shared by Google sign-in (both pages) and email sign-in.
 */
export async function authenticateAndNavigate(
    authenticate: () => Promise<unknown>,
    syncAccount: () => Promise<{ status: string }>,
    logoutStrict: () => Promise<void>,
    navigate: NavigateFunction,
    setLoading: (loading: boolean) => void,
): Promise<void> {
    setLoading(true);
    try {
        await authenticate();
        try {
            const { status } = await syncAccount();
            navigate(status === 'created' ? PAGES.ONBOARDING.PATH : PAGES.HOME.PATH);
        } catch (syncError) {
            logError('auth_sync_failed_forced_logout_attempt', syncError);
            try {
                await logoutStrict();
                toast.error('We could not finish setting up your account. Please try again.');
            } catch (logoutError) {
                logError('auth_sync_failed_forced_logout_failed', logoutError);
                toast.error('Setup failed and we could not safely sign you out. Please refresh and try again.');
            }
        }
    } catch (error: any) {
        toast.error(getAuthErrorMessage(error));
        logError('Authentication failed:', error);
    } finally {
        setLoading(false);
    }
}
