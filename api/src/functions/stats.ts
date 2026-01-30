import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';

// Simple in-memory cache for stats (refreshes every 5 minutes)
let statsCache: { developers: number; projects: number } | null = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Get platform stats (public endpoint)
app.http('getStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'stats',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const now = Date.now();
      
      // Return cached stats if still valid
      if (statsCache && (now - lastCacheTime) < CACHE_DURATION_MS) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: statsCache,
            cached: true,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      // Count total users (developers) - cross-partition query
      const usersQuery = await containers.users.items
        .query(
          'SELECT VALUE COUNT(1) FROM c',
          { maxItemCount: -1 } // Allow unlimited items for aggregate
        )
        .fetchAll();
      const developersCount = usersQuery.resources[0] || 0;

      // Count total freelance jobs (projects) - cross-partition query
      const jobsQuery = await containers.freelanceJobs.items
        .query(
          'SELECT VALUE COUNT(1) FROM c',
          { maxItemCount: -1 }
        )
        .fetchAll();
      const projectsCount = jobsQuery.resources[0] || 0;

      // Update cache
      statsCache = {
        developers: developersCount,
        projects: projectsCount,
      };
      lastCacheTime = now;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: statsCache,
          cached: false,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      context.error('Error fetching stats:', error);
      
      // Return cached data if available, even on error
      if (statsCache) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: statsCache,
            cached: true,
            stale: true,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: 'Failed to fetch platform stats',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  },
});
