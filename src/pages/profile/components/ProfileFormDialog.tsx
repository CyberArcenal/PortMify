// src/pages/profile/components/ProfileFormDialog.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import profileAPI, { Profile, ProfileUpdateData } from "@/api/core/profile";
import DragDropFileInput from "./DragDropFileInput";

interface ProfileFormDialogProps {
  isOpen: boolean;
  initialData: Partial<Profile> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  address: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  resume: string;
};

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      email: "",
      phone: "",
      address: "",
      github_url: "",
      linkedin_url: "",
      twitter_url: "",
      resume: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        title: initialData.title || "",
        bio: initialData.bio || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        github_url: initialData.github_url || "",
        linkedin_url: initialData.linkedin_url || "",
        twitter_url: initialData.twitter_url || "",
        resume: initialData.resume_url || "",
      });
      setSelectedProfileImage(null);
      setSelectedResumeFile(null);
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    if (!initialData?.id) {
      dialogs.error("Profile ID missing");
      return;
    }

    try {
      const payload: ProfileUpdateData = {
        name: data.name,
        title: data.title,
        bio: data.bio,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        github_url: data.github_url || undefined,
        linkedin_url: data.linkedin_url || undefined,
        twitter_url: data.twitter_url || undefined,
        resume: data.resume || undefined,
      };

      if (selectedResumeFile) {
        payload.resume_file = selectedResumeFile;
        delete payload.resume;
      }

      if (selectedProfileImage) {
        payload.profile_image = selectedProfileImage;
      }

      await profileAPI.patch(initialData.id, payload);
      dialogs.success("Profile updated successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to update profile");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose={true}
      onClose={onClose}
      title="Edit Profile"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1">
            Personal Information
          </h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Full Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
            {errors.name && <p className="text-xs text-[var(--danger-color)] mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Title *
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
            {errors.title && <p className="text-xs text-[var(--danger-color)] mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Bio
            </label>
            <textarea
              {...register("bio")}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1">
            Contact Information
          </h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Email *
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
            {errors.email && <p className="text-xs text-[var(--danger-color)] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Phone
            </label>
            <input
              {...register("phone")}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Address
            </label>
            <input
              {...register("address")}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1">
            Social Links
          </h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              GitHub URL
            </label>
            <input
              {...register("github_url")}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              LinkedIn URL
            </label>
            <input
              {...register("linkedin_url")}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Twitter URL
            </label>
            <input
              {...register("twitter_url")}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </div>
        </div>

        {/* Resume & Profile Image */}
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1">
            Resume & Profile Image
          </h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
              Resume URL (optional)
            </label>
            <input
              {...register("resume")}
              placeholder="https://example.com/resume.pdf"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            />
            {initialData?.resume_url && !selectedResumeFile && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                <span>Current:</span>
                <a
                  href={initialData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] hover:underline truncate max-w-[200px] inline-block"
                  title={initialData.resume_url}
                >
                  {initialData.resume_url}
                </a>
              </p>
            )}
          </div>

          <DragDropFileInput
            label="Upload Resume (PDF, DOC, etc.)"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onFileSelect={setSelectedResumeFile}
            currentFileUrl={initialData?.resume_url}
            currentFileName={initialData?.resume_url?.split('/').pop()}
            icon="file"
            helpText="Drag & drop or click to select"
          />

          <DragDropFileInput
            label="Profile Image"
            accept="image/*"
            onFileSelect={setSelectedProfileImage}
            currentFileUrl={initialData?.profile_image_url}
            currentFileName={initialData?.profile_image_url?.split('/').pop()}
            icon="image"
            helpText="Drag & drop an image or click to select"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (
                !(await dialogs.confirm({
                  title: "Cancel Form",
                  message: "Are you sure you want to cancel? Any unsaved changes will be lost.",
                  confirmText: "Cancel Anyway",
                }))
              )
                return;
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileFormDialog;