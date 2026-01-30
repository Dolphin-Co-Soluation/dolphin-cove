import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// ============================================================================
// POST /api/upload - Upload a file to Supabase Storage
// ============================================================================
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const file = req.file;
    const userId = req.body.userId || 'anonymous';
    const folder = req.body.folder || 'uploads';

    // Generate unique filename
    const extension = file.originalname.split('.').pop();
    const filename = `${folder}/${userId}/${uuidv4()}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dolphin-cove-files')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ success: false, error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('dolphin-cove-files')
      .getPublicUrl(filename);

    res.json({
      success: true,
      data: {
        filename: file.originalname,
        path: filename,
        url: urlData.publicUrl,
        size: file.size,
        contentType: file.mimetype,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

// ============================================================================
// POST /api/upload/avatar - Upload user avatar
// ============================================================================
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const file = req.file;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Only allow images for avatars
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'Only images are allowed for avatars' });
    }

    const extension = file.originalname.split('.').pop();
    const filename = `avatars/${userId}/${uuidv4()}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dolphin-cove-files')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ success: false, error: 'Failed to upload avatar' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('dolphin-cove-files')
      .getPublicUrl(filename);

    // Update user's avatar in database
    await supabase
      .from('users')
      .update({ avatar: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);

    res.json({
      success: true,
      data: {
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }
});

// ============================================================================
// DELETE /api/upload - Delete a file from Supabase Storage
// ============================================================================
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const { error } = await supabase.storage
      .from('dolphin-cove-files')
      .remove([path]);

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete file' });
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

export default router;
