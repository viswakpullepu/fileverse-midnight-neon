import React, { createContext, useContext, useState } from 'react';

const FileContext = createContext(null);

export function FileProvider({ children }) {
  const [sharedFiles, setSharedFiles] = useState([]);

  // Backward-compatible single file representation
  const sharedFile = sharedFiles.length > 0 ? sharedFiles[0] : null;

  const fileMetadata = sharedFile
    ? {
        name: sharedFile.name,
        size: sharedFile.size,
        type: sharedFile.type,
        lastModified: sharedFile.lastModified,
        extension: sharedFile.name.split('.').pop()?.toLowerCase() || '',
      }
    : null;

  const filesMetadata = sharedFiles.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension: file.name.split('.').pop()?.toLowerCase() || '',
  }));

  const setFiles = (files) => {
    if (!files) {
      setSharedFiles([]);
      return;
    }
    const arr = Array.isArray(files) ? files : [files];
    setSharedFiles(arr.filter(Boolean));
  };

  const setFile = (file) => {
    if (!file) {
      setSharedFiles([]);
    } else {
      setSharedFiles([file]);
    }
  };

  const addFiles = (newFiles) => {
    if (!newFiles) return;
    const arr = Array.isArray(newFiles) ? newFiles : [newFiles];
    setSharedFiles((prev) => {
      // De-duplicate by name + size + lastModified
      const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}_${f.lastModified}`));
      const uniqueNew = arr.filter((f) => f && !existingKeys.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...uniqueNew];
    });
  };

  const removeFile = (index) => {
    setSharedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSharedFiles([]);
  };

  const clearFile = () => {
    setSharedFiles([]);
  };

  return (
    <FileContext.Provider
      value={{
        sharedFiles,
        sharedFile,
        filesMetadata,
        fileMetadata,
        setFiles,
        setFile,
        addFiles,
        removeFile,
        clearFiles,
        clearFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
