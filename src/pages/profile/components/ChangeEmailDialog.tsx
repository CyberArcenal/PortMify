// src/pages/profile/components/ChangeEmailDialog.tsx
import React from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import profileAPI from "@/api/core/profile";
import { dialogs } from "../../../utils/dialogs";

interface Props {
  isOpen: boolean;
  currentEmail: string;
  profileId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  email: string;
};

const ChangeEmailDialog: React.FC<Props> = ({
  isOpen,
  currentEmail,
  profileId,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ email: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await profileAPI.patch(profileId, { email: data.email });
      dialogs.success("Email updated successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to update email.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Email" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
            Current Email
          </label>
          <input
            type="email"
            value={currentEmail}
            disabled
            className="w-full px-3 py-2 rounded-lg border text-sm opacity-70 cursor-not-allowed"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-secondary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
            New Email *
          </label>
          <input
            type="email"
            {...register("email", {
              required: "New email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email address",
              },
            })}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
            placeholder="Enter new email"
          />
          {errors.email && <p className="text-xs text-[var(--danger-color)] mt-1">{errors.email.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeEmailDialog;