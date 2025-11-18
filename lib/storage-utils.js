/**
 * Storage Utility Module
 * 
 * This module provides a unified interface for file storage operations.
 * Currently supports local file system storage, but designed to easily
 * integrate with cloud storage providers (AWS S3, Google Cloud Storage, Vercel Blob)
 * 
 * Best Practice: Store file references (URLs/paths) in the database,
 * not binary data. This keeps the database lightweight and scalable.
 */

const fs = require('fs');
const path = require('path');

/**
 * Storage configuration
 * Set STORAGE_PROVIDER in .env to switch providers:
 * - 'local' (default): Local file system
 * - 's3': AWS S3
 * - 'gcs': Google Cloud Storage
 * - 'vercel-blob': Vercel Blob Storage
 */
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';

/**
 * Upload a file to storage
 * 
 * @param {Buffer} fileBuffer - File content as Buffer
 * @param {string} filename - Desired filename
 * @param {string} directory - Directory/bucket path (e.g., 'n4-forms')
 * @returns {Promise<Object>} - Storage metadata { url, provider, size, path }
 */
async function uploadFile(fileBuffer, filename, directory = 'uploads') {
  switch (STORAGE_PROVIDER) {
    case 'local':
      return await uploadToLocal(fileBuffer, filename, directory);
    
    case 's3':
      // FUTURE: AWS S3 integration - not currently needed (using local storage)
      // return await uploadToS3(fileBuffer, filename, directory);
      throw new Error('S3 storage not yet implemented');
    
    case 'gcs':
      // FUTURE: Google Cloud Storage integration - not currently needed (using local storage)
      // return await uploadToGCS(fileBuffer, filename, directory);
      throw new Error('GCS storage not yet implemented');
    
    case 'vercel-blob':
      // FUTURE: Vercel Blob integration - not currently needed (using local storage)
      // return await uploadToVercelBlob(fileBuffer, filename, directory);
      throw new Error('Vercel Blob storage not yet implemented');
    
    default:
      throw new Error(`Unknown storage provider: ${STORAGE_PROVIDER}`);
  }
}

/**
 * Upload file to local file system
 * @private
 */
async function uploadToLocal(fileBuffer, filename, directory) {
  const uploadsDir = path.join(process.cwd(), 'uploads', directory);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);
  
  const stats = fs.statSync(filePath);
  
  return {
    url: `file://${filePath}`,
    provider: 'local',
    size: stats.size,
    path: filePath,
    filename: filename,
  };
}

/**
 * Delete a file from storage
 * 
 * @param {string} storageUrl - URL/path from database
 * @param {string} provider - Storage provider
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFile(storageUrl, provider = STORAGE_PROVIDER) {
  switch (provider) {
    case 'local':
      return await deleteFromLocal(storageUrl);
    
    case 's3':
      // FUTURE: AWS S3 integration - not currently needed (using local storage)
      throw new Error('S3 storage not yet implemented');
    
    case 'gcs':
      // FUTURE: Google Cloud Storage integration - not currently needed (using local storage)
      throw new Error('GCS storage not yet implemented');
    
    case 'vercel-blob':
      // FUTURE: Vercel Blob integration - not currently needed (using local storage)
      throw new Error('Vercel Blob storage not yet implemented');
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

/**
 * Delete file from local file system
 * @private
 */
async function deleteFromLocal(storageUrl) {
  try {
    // Remove file:// protocol if present
    const filePath = storageUrl.replace('file://', '');
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted:', filePath);
      return true;
    } else {
      console.log('File not found:', filePath);
      return false;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get file from storage
 * 
 * @param {string} storageUrl - URL/path from database
 * @param {string} provider - Storage provider
 * @returns {Promise<Buffer>} - File content as Buffer
 */
async function getFile(storageUrl, provider = STORAGE_PROVIDER) {
  switch (provider) {
    case 'local':
      return await getFromLocal(storageUrl);
    
    case 's3':
      // FUTURE: AWS S3 integration - not currently needed (using local storage)
      throw new Error('S3 storage not yet implemented');
    
    case 'gcs':
      // FUTURE: Google Cloud Storage integration - not currently needed (using local storage)
      throw new Error('GCS storage not yet implemented');
    
    case 'vercel-blob':
      // FUTURE: Vercel Blob integration - not currently needed (using local storage)
      throw new Error('Vercel Blob storage not yet implemented');
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

/**
 * Get file from local file system
 * @private
 */
async function getFromLocal(storageUrl) {
  // Remove file:// protocol if present
  const filePath = storageUrl.replace('file://', '');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  return fs.readFileSync(filePath);
}

/**
 * Check if file exists in storage
 * 
 * @param {string} storageUrl - URL/path from database
 * @param {string} provider - Storage provider
 * @returns {Promise<boolean>} - Exists status
 */
async function fileExists(storageUrl, provider = STORAGE_PROVIDER) {
  switch (provider) {
    case 'local':
      const filePath = storageUrl.replace('file://', '');
      return fs.existsSync(filePath);
    
    case 's3':
      // FUTURE: AWS S3 integration - not currently needed (using local storage)
      throw new Error('S3 storage not yet implemented');
    
    case 'gcs':
      // FUTURE: Google Cloud Storage integration - not currently needed (using local storage)
      throw new Error('GCS storage not yet implemented');
    
    case 'vercel-blob':
      // FUTURE: Vercel Blob integration - not currently needed (using local storage)
      throw new Error('Vercel Blob storage not yet implemented');
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFile,
  fileExists,
  STORAGE_PROVIDER,
};

