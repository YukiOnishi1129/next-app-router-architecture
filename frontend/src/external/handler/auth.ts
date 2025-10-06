'use server';

import { z } from 'zod';
import { AuthenticationService } from '@/external/service/AuthenticationService';
import { UserRepository } from '@/external/domain/user';
import { AuditService } from '@/external/service/AuditService';
import { cookies } from 'next/headers';

// Validation schemas
const signInSchema = z.object({
  provider: z.enum(['google']),
  redirectUrl: z.string().url().optional(),
});

const sessionSchema = z.object({
  userId: z.string().optional(),
});

// Response types
export type SignInResponse = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export type SignOutResponse = {
  success: boolean;
  error?: string;
};

export type SessionResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
    roles: string[];
  };
  isAuthenticated: boolean;
};

// Initialize services (in production, these would be properly injected)
const userRepository = new UserRepository();
const auditService = new AuditService();
const authService = new AuthenticationService(
  userRepository,
  auditService,
  {
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.FIREBASE_APP_ID!,
  }
);

/**
 * Sign in with OAuth provider
 */
export async function signIn(data: unknown): Promise<SignInResponse> {
  try {
    const validated = signInSchema.parse(data);
    
    if (validated.provider === 'google') {
      const result = await authService.authenticateWithGoogle({
        ipAddress: 'server',
        userAgent: 'server-action',
      });
      
      // Store auth token in secure cookie
      const cookieStore = cookies();
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return {
        success: true,
        redirectUrl: validated.redirectUrl || '/dashboard',
      };
    }
    
    return {
      success: false,
      error: 'Unsupported provider',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<SignOutResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'No active session',
      };
    }
    
    const user = await authService.verifyToken(token);
    if (user) {
      await authService.signOut(user.getId().getValue(), {
        ipAddress: 'server',
        userAgent: 'server-action',
      });
    }
    
    // Clear auth cookie
    cookieStore.delete('auth-token');
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
}

/**
 * Get current session
 */
export async function getSession(data?: unknown): Promise<SessionResponse> {
  try {
    const validated = sessionSchema.parse(data || {});
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return {
        isAuthenticated: false,
      };
    }
    
    const user = await authService.verifyToken(token);
    if (!user) {
      return {
        isAuthenticated: false,
      };
    }
    
    // If userId is provided, verify it matches the authenticated user
    if (validated.userId && validated.userId !== user.getId().getValue()) {
      return {
        isAuthenticated: false,
      };
    }
    
    return {
      user: {
        id: user.getId().getValue(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        status: user.getStatus(),
        roles: user.getRoles(),
      },
      isAuthenticated: true,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
    };
  }
}

/**
 * Check if user has permission
 */
export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return false;
    }
    
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return false;
    }
    
    return authService.hasPermission(user, permission);
  } catch (error) {
    return false;
  }
}