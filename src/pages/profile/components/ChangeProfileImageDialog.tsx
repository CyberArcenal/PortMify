// src/pages/profile/components/ChangeProfileImageDialog.tsx
import React, { useState, useEffect } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import DragDropFileInput from "./DragDropFileInput";
import profileAPI from "@/api/core/profile";
import { dialogs } from "../../../utils/dialogs";

interface Props {
  isOpen: boolean;
  currentImageUrl: string | null;
  profileId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeProfileImageDialog: React.FC<Props> = ({
  isOpen,
  currentImageUrl,
  profileId,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedFile) {
      dialogs.error("Please select an image.");
      return;
    }
    setIsSubmitting(true);
    try {
      await profileAPI.patch(profileId, { profile_image: selectedFile });
      dialogs.success("Profile image updated successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to update image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Profile Image" size="md">
      <div className="space-y-4">
        <div className="flex justify-center">
          {displayImage ? (
            <img
              src={displayImage}
              alt={previewUrl ? "New profile preview" : "Current profile"}
              className="w-32 h-32 rounded-full object-cover border-2 border-[var(--border-color)]"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[var(--card-secondary-bg)] flex items-center justify-center text-[var(--text-secondary)]">
              No image
            </div>
          )}
        </div>

        <DragDropFileInput
          label="Upload New Image"
          accept="image/*"
          onFileSelect={setSelectedFile}
          icon="image"
          helpText="Drag & drop or click to select"
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeProfileImageDialog;