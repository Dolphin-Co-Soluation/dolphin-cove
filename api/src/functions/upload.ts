import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../types';

const connectionString = process.env.STORAGE_CONNECTION_STRING || '';
const containerName = process.env.STORAGE_CONTAINER || 'uploads';

// ============================================================================
// POST /api/upload - Upload file to Azure Blob Storage
// ============================================================================
app.http('uploadFile', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'general';
      const userId = formData.get('userId') as string;

      if (!file) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'No file provided' } as ApiResponse,
        };
      }

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'File type not allowed' } as ApiResponse,
        };
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'File size exceeds 50MB limit' } as ApiResponse,
        };
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${folder}/${userId}/${uuidv4()}.${fileExtension}`;

      // Upload to Azure Blob Storage
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Ensure container exists
      await containerClient.createIfNotExists({ access: 'blob' });

      const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilename);

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      const fileUrl = blockBlobClient.url;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            url: fileUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
            path: uniqueFilename,
          },
          message: 'File uploaded successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error uploading file:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to upload file' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/upload/multiple - Upload multiple files
// ============================================================================
app.http('uploadMultipleFiles', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload/multiple',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const formData = await request.formData();
      const files = formData.getAll('files') as File[];
      const folder = (formData.get('folder') as string) || 'general';
      const userId = formData.get('userId') as string;

      if (!files || files.length === 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'No files provided' } as ApiResponse,
        };
      }

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Max 10 files at a time
      if (files.length > 10) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Maximum 10 files allowed per upload' } as ApiResponse,
        };
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      const maxSize = 50 * 1024 * 1024;

      // Validate all files first
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return {
            status: 400,
            jsonBody: { success: false, error: `File type not allowed: ${file.name}` } as ApiResponse,
          };
        }
        if (file.size > maxSize) {
          return {
            status: 400,
            jsonBody: { success: false, error: `File too large: ${file.name}` } as ApiResponse,
          };
        }
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      await containerClient.createIfNotExists({ access: 'blob' });

      const uploadedFiles: Array<{
        url: string;
        filename: string;
        size: number;
        type: string;
        path: string;
      }> = [];

      for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${folder}/${userId}/${uuidv4()}.${fileExtension}`;

        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await blockBlobClient.uploadData(buffer, {
          blobHTTPHeaders: {
            blobContentType: file.type,
          },
        });

        uploadedFiles.push({
          url: blockBlobClient.url,
          filename: file.name,
          size: file.size,
          type: file.type,
          path: uniqueFilename,
        });
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: uploadedFiles,
          message: `${uploadedFiles.length} file(s) uploaded successfully`,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error uploading files:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to upload files' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/upload - Delete file from Azure Blob Storage
// ============================================================================
app.http('deleteFile', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const path = request.query.get('path');
      const userId = request.query.get('userId');

      if (!path) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'File path is required' } as ApiResponse,
        };
      }

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Verify user owns the file (path should contain userId)
      if (!path.includes(`/${userId}/`)) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You can only delete your own files' } as ApiResponse,
        };
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);

      await blockBlobClient.deleteIfExists();

      return {
        status: 200,
        jsonBody: { success: true, message: 'File deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting file:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete file' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/upload/sas - Get SAS URL for direct upload (optional for large files)
// ============================================================================
app.http('getSasUrl', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'upload/sas',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const filename = request.query.get('filename');
      const folder = request.query.get('folder') || 'general';
      const userId = request.query.get('userId');

      if (!filename || !userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Filename and User ID are required' } as ApiResponse,
        };
      }

      const fileExtension = filename.split('.').pop();
      const uniqueFilename = `${folder}/${userId}/${uuidv4()}.${fileExtension}`;

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilename);

      // Generate SAS URL valid for 15 minutes
      const expiresOn = new Date(new Date().valueOf() + 15 * 60 * 1000);
      
      // Note: For production, you should use Azure.Identity and proper SAS token generation
      // This is a simplified version
      const sasUrl = blockBlobClient.url;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            sasUrl,
            blobPath: uniqueFilename,
            expiresAt: expiresOn.toISOString(),
          },
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error generating SAS URL:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to generate upload URL' } as ApiResponse,
      };
    }
  },
});
