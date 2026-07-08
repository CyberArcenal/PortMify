// src/pages/profile/index.tsx
import React, { useState } from "react";
import {
  Edit,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Camera,
  AtSign,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
} from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import useProfile from "./hooks/useProfile";
import useProfileForm from "./hooks/useProfileForm";
import ProfileFormDialog from "./components/ProfileFormDialog";
import profileAPI from "@/api/core/profile";
import { formatDate } from "@/utils/formatters";
import ChangeEmailDialog from "./components/ChangeEmailDialog";
import ChangeProfileImageDialog from "./components/ChangeProfileImageDialog";
import ChangePasswordDialog from "./components/ChangePasswordDialog";

const ProfilePage: React.FC = () => {
  const { profile, loading, error, reload } = useProfile();
  const formDialog = useProfileForm();
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const handleEdit = () => {
    if (profile) {
      formDialog.openEdit(profile);
    }
  };

  const handleViewPublicProfile = () => {
    // Construct public profile URL - adjust based on your routing
    const publicUrl = `https://darius-portfollio.vercel.app/`;
    window.open(publicUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-[var(--danger-color)]">Error: {error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
        <p className="text-base font-medium text-[var(--sidebar-text)]">
          No profile found.
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Please create your profile to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            My Profile
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your personal information and online presence
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Stats */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary" : "Show summary"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Refresh */}
          <button
            onClick={reload}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Change Password"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* View Public Profile */}
          <button
            onClick={handleViewPublicProfile}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title="View Public Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Change Image */}
          <button
            onClick={() => setShowImageDialog(true)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Change Profile Image"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Change Email */}
          <button
            onClick={() => setShowEmailDialog(true)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Change Email"
          >
            <AtSign className="w-4 h-4" />
          </button>

          {/* Edit Profile */}
          <Button
            onClick={handleEdit}
            variant="primary"
            size="sm"
            icon={Edit}
            iconPosition="left"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Name</p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-1 truncate">
              {profile.name}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Title</p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-1 truncate">
              {profile.title}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Email</p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-1 truncate">
              {profile.email}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Status</p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-1">
              {profile.status_display || profile.status}
            </p>
          </div>
        </div>
      )}

      {/* ─── Profile Overview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card - same as before */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-[var(--border-color)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white mb-3">
                <User className="w-12 h-12" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {profile.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {profile.title}
            </p>
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-[var(--primary-color)] hover:underline"
              >
                View Resume
              </a>
            )}
            <div className="mt-3 w-full pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {profile.status_display || profile.status}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Member since:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details - same as before */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bio */}
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <h4 className="font-medium mb-2 text-[var(--text-primary)]">Bio</h4>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
              {profile.bio || "No bio provided."}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <h4 className="font-medium mb-3 text-[var(--text-primary)]">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">Email:</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-[var(--primary-color)] hover:underline"
                >
                  {profile.email}
                </a>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">Phone:</span>
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-[var(--primary-color)] hover:underline"
                  >
                    {profile.phone}
                  </a>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">Address:</span>
                  <span className="text-[var(--text-primary)]">
                    {profile.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          {profile.location && (
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
              <h4 className="font-medium mb-3 text-[var(--text-primary)]">
                Location & Availability
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">Address:</span>
                  <span className="text-[var(--text-primary)]">
                    {profile.location.address}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">Coordinates:</span>
                  <span className="text-[var(--text-primary)]">
                    {profile.location.coordinates}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <span className="text-[var(--text-secondary)]">Availability:</span>
                  <span className="text-[var(--text-primary)]">
                    {profile.location.availability}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && (
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
              <h4 className="font-medium mb-3 text-[var(--text-primary)]">
                Social Links
              </h4>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.github_url && (
                  <a
                    href={profile.socialLinks.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin_url && (
                  <a
                    href={profile.socialLinks.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.socialLinks.twitter_url && (
                  <a
                    href={profile.socialLinks.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                )}
                {profile.socialLinks.instagram_url && (
                  <a
                    href={profile.socialLinks.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
                {profile.socialLinks.facebook_url && (
                  <a
                    href={profile.socialLinks.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Facebook className="w-4 h-4" /> Facebook
                  </a>
                )}
                {profile.socialLinks.youtube_url && (
                  <a
                    href={profile.socialLinks.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <Youtube className="w-4 h-4" /> YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Dialogs ─── */}
      <ChangeProfileImageDialog
        isOpen={showImageDialog}
        currentImageUrl={profile.profile_image_url}
        profileId={profile.id}
        onClose={() => setShowImageDialog(false)}
        onSuccess={reload}
      />

      <ChangeEmailDialog
        isOpen={showEmailDialog}
        currentEmail={profile.email}
        profileId={profile.id}
        onClose={() => setShowEmailDialog(false)}
        onSuccess={reload}
      />

      <ChangePasswordDialog
        isOpen={showPasswordDialog}
        userId={profile.id}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={reload}
      />

      <ProfileFormDialog
        isOpen={formDialog.isOpen}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />
    </div>
  );
};

export default ProfilePage;