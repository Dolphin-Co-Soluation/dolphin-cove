import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { User, UpdateFreelancerModeRequest, ApiResponse, BankInfo, FreelancerProfile } from '../types';

// ============================================================================
// GET /api/freelancer-mode/:userId - Get freelancer mode status
// ============================================================================
app.http('getFreelancerMode', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancer-mode/{userId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.userId;

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Return freelancer mode status (without exposing bank info)
      const freelancerStatus = {
        isFreelancer: user.isFreelancer || false,
        freelancerProfile: user.freelancerProfile ? {
          title: user.freelancerProfile.title,
          hourlyRate: user.freelancerProfile.hourlyRate,
          availability: user.freelancerProfile.availability,
          completedJobs: user.freelancerProfile.completedJobs,
          rating: user.freelancerProfile.rating,
          totalReviews: user.freelancerProfile.totalReviews,
          hasBankInfo: !!user.freelancerProfile.bankInfo?.accountNumber,
        } : null,
      };

      return {
        status: 200,
        jsonBody: { success: true, data: freelancerStatus } as ApiResponse,
      };
    } catch (error) {
      context.error('Error getting freelancer mode:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to get freelancer mode' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/freelancer-mode/:userId - Update freelancer mode (enable/disable)
// ============================================================================
app.http('updateFreelancerMode', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'freelancer-mode/{userId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.userId;
      const body = (await request.json()) as UpdateFreelancerModeRequest;

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Enabling freelancer mode
      if (body.isFreelancer) {
        // Check if bank info is provided when enabling
        if (!user.freelancerProfile?.bankInfo && !body.freelancerProfile?.bankInfo) {
          return {
            status: 400,
            jsonBody: { 
              success: false, 
              error: 'Bank information is required to enable freelancer mode',
              requiresBankInfo: true,
            } as ApiResponse,
          };
        }

        // Validate bank info if provided
        if (body.freelancerProfile?.bankInfo) {
          const bankInfo = body.freelancerProfile.bankInfo;
          if (!bankInfo.bankName?.trim()) {
            return {
              status: 400,
              jsonBody: { success: false, error: 'Bank name is required' } as ApiResponse,
            };
          }
          if (!bankInfo.accountNumber?.trim()) {
            return {
              status: 400,
              jsonBody: { success: false, error: 'Account number is required' } as ApiResponse,
            };
          }
          if (!bankInfo.accountHolderName?.trim()) {
            return {
              status: 400,
              jsonBody: { success: false, error: 'Account holder name is required' } as ApiResponse,
            };
          }
        }

        // Initialize or update freelancer profile
        const existingProfile = user.freelancerProfile || {
          availability: 'available',
          completedJobs: 0,
          rating: 0,
          totalReviews: 0,
        };

        const updatedBankInfo: BankInfo = body.freelancerProfile?.bankInfo 
          ? {
              bankName: body.freelancerProfile.bankInfo.bankName.trim(),
              accountNumber: body.freelancerProfile.bankInfo.accountNumber.trim(),
              accountHolderName: body.freelancerProfile.bankInfo.accountHolderName.trim(),
              ifscCode: body.freelancerProfile.bankInfo.ifscCode?.trim(),
              swiftCode: body.freelancerProfile.bankInfo.swiftCode?.trim(),
              routingNumber: body.freelancerProfile.bankInfo.routingNumber?.trim(),
              isVerified: false,
            }
          : existingProfile.bankInfo!;

        user.freelancerProfile = {
          ...existingProfile,
          title: body.freelancerProfile?.title?.trim() || existingProfile.title,
          hourlyRate: body.freelancerProfile?.hourlyRate ?? existingProfile.hourlyRate,
          availability: body.freelancerProfile?.availability || existingProfile.availability || 'available',
          bankInfo: updatedBankInfo,
        };

        user.isFreelancer = true;
      } else {
        // Disabling freelancer mode
        // Check if user has active tasks
        const { resources: activeTasks } = await containers.tasks.items
          .query({
            query: 'SELECT VALUE COUNT(1) FROM c WHERE c.freelancerId = @userId AND c.status = "in_progress"',
            parameters: [{ name: '@userId', value: userId }],
          })
          .fetchAll();

        if (activeTasks[0] > 0) {
          return {
            status: 400,
            jsonBody: { 
              success: false, 
              error: 'Cannot disable freelancer mode while you have active tasks. Please complete or cancel all in-progress tasks first.' 
            } as ApiResponse,
          };
        }

        user.isFreelancer = false;
        // Keep the profile data but mark as inactive
        if (user.freelancerProfile) {
          user.freelancerProfile.availability = 'unavailable';
        }
      }

      user.updatedAt = now;

      await containers.users.item(userId, userId).replace(user);

      // Return updated status (without exposing bank info)
      const freelancerStatus = {
        isFreelancer: user.isFreelancer,
        freelancerProfile: user.freelancerProfile ? {
          title: user.freelancerProfile.title,
          hourlyRate: user.freelancerProfile.hourlyRate,
          availability: user.freelancerProfile.availability,
          completedJobs: user.freelancerProfile.completedJobs,
          rating: user.freelancerProfile.rating,
          totalReviews: user.freelancerProfile.totalReviews,
          hasBankInfo: !!user.freelancerProfile.bankInfo?.accountNumber,
        } : null,
      };

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: freelancerStatus,
          message: user.isFreelancer 
            ? 'Freelancer mode enabled successfully!' 
            : 'Freelancer mode disabled',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating freelancer mode:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update freelancer mode' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/freelancer-profile/:userId - Update freelancer profile
// ============================================================================
app.http('updateFreelancerProfile', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'freelancer-profile/{userId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.userId;
      const body = (await request.json()) as {
        title?: string;
        hourlyRate?: number;
        availability?: 'available' | 'busy' | 'unavailable';
        bankInfo?: Omit<BankInfo, 'isVerified'>;
      };

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      if (!user.isFreelancer || !user.freelancerProfile) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User is not a freelancer. Enable freelancer mode first.' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const profile = user.freelancerProfile;

      // Update profile fields
      if (body.title !== undefined) {
        profile.title = body.title?.trim() || undefined;
      }

      if (body.hourlyRate !== undefined) {
        if (body.hourlyRate < 0) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Hourly rate cannot be negative' } as ApiResponse,
          };
        }
        profile.hourlyRate = body.hourlyRate;
      }

      if (body.availability) {
        profile.availability = body.availability;
      }

      // Update bank info if provided
      if (body.bankInfo) {
        const bankInfo = body.bankInfo;

        // Validate required fields
        if (!bankInfo.bankName?.trim()) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Bank name is required' } as ApiResponse,
          };
        }
        if (!bankInfo.accountNumber?.trim()) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Account number is required' } as ApiResponse,
          };
        }
        if (!bankInfo.accountHolderName?.trim()) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Account holder name is required' } as ApiResponse,
          };
        }

        profile.bankInfo = {
          bankName: bankInfo.bankName.trim(),
          accountNumber: bankInfo.accountNumber.trim(),
          accountHolderName: bankInfo.accountHolderName.trim(),
          ifscCode: bankInfo.ifscCode?.trim(),
          swiftCode: bankInfo.swiftCode?.trim(),
          routingNumber: bankInfo.routingNumber?.trim(),
          isVerified: false, // Reset verification when bank info changes
        };
      }

      user.freelancerProfile = profile;
      user.updatedAt = now;

      await containers.users.item(userId, userId).replace(user);

      // Return updated profile (with masked bank info)
      const responseProfile = {
        title: profile.title,
        hourlyRate: profile.hourlyRate,
        availability: profile.availability,
        completedJobs: profile.completedJobs,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
        bankInfo: profile.bankInfo ? {
          bankName: profile.bankInfo.bankName,
          accountNumber: maskAccountNumber(profile.bankInfo.accountNumber),
          accountHolderName: profile.bankInfo.accountHolderName,
          ifscCode: profile.bankInfo.ifscCode,
          swiftCode: profile.bankInfo.swiftCode,
          routingNumber: profile.bankInfo.routingNumber,
          isVerified: profile.bankInfo.isVerified,
        } : null,
      };

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: responseProfile,
          message: 'Freelancer profile updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating freelancer profile:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update freelancer profile' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelancer-profile/:userId/bank-info - Get masked bank info (for self)
// ============================================================================
app.http('getFreelancerBankInfo', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancer-profile/{userId}/bank-info',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.userId;
      const requestingUserId = request.query.get('requestingUserId');

      // Can only view your own bank info
      if (userId !== requestingUserId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You can only view your own bank information' } as ApiResponse,
        };
      }

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      if (!user.isFreelancer || !user.freelancerProfile?.bankInfo) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'No bank information found' } as ApiResponse,
        };
      }

      const bankInfo = user.freelancerProfile.bankInfo;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            bankName: bankInfo.bankName,
            accountNumber: maskAccountNumber(bankInfo.accountNumber),
            accountHolderName: bankInfo.accountHolderName,
            ifscCode: bankInfo.ifscCode,
            swiftCode: bankInfo.swiftCode,
            routingNumber: bankInfo.routingNumber,
            isVerified: bankInfo.isVerified,
          },
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error getting bank info:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to get bank information' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelancers - Get list of available freelancers
// ============================================================================
app.http('getFreelancers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancers',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const skills = request.query.get('skills')?.split(',');
      const availability = request.query.get('availability');
      const minRating = request.query.get('minRating');
      const search = request.query.get('search');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.skills, c.bio, c.freelancerProfile FROM c WHERE c.isFreelancer = true';
      const parameters: { name: string; value: any }[] = [];

      // Search in username, displayName, or bio
      if (search) {
        query += ' AND (CONTAINS(LOWER(c.username), LOWER(@search)) OR CONTAINS(LOWER(c.displayName), LOWER(@search)) OR CONTAINS(LOWER(c.bio), LOWER(@search)) OR CONTAINS(LOWER(c.freelancerProfile.title), LOWER(@search)))';
        parameters.push({ name: '@search', value: search });
      }

      // Filter by skills
      if (skills && skills.length > 0) {
        const skillConditions = skills.map((_, i) => `ARRAY_CONTAINS(c.skills, @skill${i})`).join(' OR ');
        query += ` AND (${skillConditions})`;
        skills.forEach((skill, i) => {
          parameters.push({ name: `@skill${i}`, value: skill.trim() });
        });
      }

      // Filter by availability
      if (availability) {
        query += ' AND c.freelancerProfile.availability = @availability';
        parameters.push({ name: '@availability', value: availability });
      }

      // Filter by minimum rating
      if (minRating) {
        query += ' AND c.freelancerProfile.rating >= @minRating';
        parameters.push({ name: '@minRating', value: parseFloat(minRating) });
      }

      // Get total count
      const countQuery = query.replace('SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.skills, c.bio, c.freelancerProfile', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.users.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination and sorting (by rating desc)
      query += ' ORDER BY c.freelancerProfile.rating DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: freelancers } = await containers.users.items
        .query({ query, parameters })
        .fetchAll();

      // Clean up the response (don't expose bank info)
      const cleanFreelancers = freelancers.map((f: any) => ({
        id: f.id,
        username: f.username,
        displayName: f.displayName,
        avatar: f.avatar,
        isVerified: f.isVerified,
        skills: f.skills,
        bio: f.bio,
        freelancerProfile: f.freelancerProfile ? {
          title: f.freelancerProfile.title,
          hourlyRate: f.freelancerProfile.hourlyRate,
          availability: f.freelancerProfile.availability,
          completedJobs: f.freelancerProfile.completedJobs,
          rating: f.freelancerProfile.rating,
          totalReviews: f.freelancerProfile.totalReviews,
        } : null,
      }));

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: cleanFreelancers,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasNext: offset + freelancers.length < total,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      context.error('Error fetching freelancers:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch freelancers' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Mask account number for display (e.g., "1234567890" -> "****7890")
 */
function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return '****';
  }
  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
}
