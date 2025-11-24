/**
 * useDocumentUpload Hook
 * Handles file upload configuration and validation
 * Shared between landlord and tenant document vaults
 */

import { notify } from '@/lib/utils/notification-helper';

export function useDocumentUpload({ category, selectedFile, setSelectedFile, getCategoryById }) {
  const uploadProps = {
    name: 'file',
    multiple: true, // Allow multiple files for all categories
    fileList: Array.isArray(selectedFile) ? selectedFile : (selectedFile ? [selectedFile] : []),
    onChange: (info) => {
      // Handle file list changes - store as array for multiple files
      setSelectedFile(info.fileList);
    },
    onRemove: (file) => {
      const currentList = Array.isArray(selectedFile) ? selectedFile : (selectedFile ? [selectedFile] : []);
      const newFileList = currentList.filter(f => f.uid !== file.uid);
      setSelectedFile(newFileList.length > 0 ? newFileList : null);
    },
    beforeUpload: (file) => {
      const categoryDetails = getCategoryById(category || 'CREDIT_REPORT');
      
      // Check file type
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!categoryDetails.allowedFileTypes.includes(ext)) {
        notify.error(`${file.name}: Invalid file type. Allowed: ${categoryDetails.allowedFileTypes.join(', ')}`);
        return false; // Prevent upload
      }
      
      // Check file size
      if (file.size > categoryDetails.maxFileSize) {
        const maxSizeMB = (categoryDetails.maxFileSize / (1024 * 1024)).toFixed(0);
        notify.error(`${file.name}: File size must be less than ${maxSizeMB}MB`);
        return false; // Prevent upload
      }
      
      return false; // Prevent auto upload
    },
  };

  return { uploadProps };
}

export default useDocumentUpload;
