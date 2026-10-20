'use client';
import { useState } from 'react';
import Cover from './Cover';
import { api, uploadFile } from '../lib/api';
import { saveSession } from '../lib/session';

// Shared by sign-up (step 2) and the edit-profile page.
export default function ProfileForm({ artist, token, submitLabel, onSaved, onSkip }) {
  const [bio, setBio] = useState(artist.bio || '');
  const [mobile, setMobile] = useState(artist.mobileNumber || '');
  const [photos, setPhotos] = useState({
    profilePhoto: { preview: artist.profilePhoto, path: null },
    coverPhoto: { preview: artist.coverPhoto, path: null },
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pick = async (field, file) => {
    if (!file) return;
    setError('');
    setPhotos((p) => ({ ...p, [field]: { ...p[field], preview: URL.createObjectURL(file) } }));
    setUploading(true);
    try {
      const path = await uploadFile('image', file, token);
      setPhotos((p) => ({ ...p, [field]: { ...p[field], path } }));
    } catch (err) {
      setError(err.message);
      setPhotos((p) => ({ ...p, [field]: { preview: artist[field], path: null } }));
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const body = { bio, mobileNumber: mobile };
    if (photos.profilePhoto.path) body.profilePhoto = photos.profilePhoto.path;
    if (photos.coverPhoto.path) body.coverPhoto = photos.coverPhoto.path;
    try {
      const data = await api('/api/auth/me', { method: 'PATCH', token, body });
      saveSession(token, data.artist);
      onSaved(data.artist);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="label">Cover photo</span>
        <label className="block cursor-pointer overflow-hidden rounded-xl border border-dashed border-ink-600">
          <Cover src={photos.coverPhoto.preview} label="+" className="h-32 w-full text-2xl" />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick('coverPhoto', e.target.files[0])} />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <label className="block cursor-pointer overflow-hidden rounded-full border border-dashed border-ink-600">
          <Cover src={photos.profilePhoto.preview} label="+" className="h-20 w-20 text-2xl" />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick('profilePhoto', e.target.files[0])} />
        </label>
        <div>
          <p className="text-sm font-medium text-white">Profile photo</p>
          <p className="text-xs text-zinc-400">{uploading ? 'Uploading...' : 'Tap the circle to choose a photo. JPG, PNG or WebP, up to 5 MB.'}</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea id="bio" className="input resize-none" rows={4} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell listeners about your sound." />
        <p className="mt-1 text-right text-xs text-zinc-500">{bio.length}/500</p>
      </div>

      <div>
        <label className="label" htmlFor="mobile">Mobile money number</label>
        <input id="mobile" type="tel" className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="0772 000 000" />
        <p className="mt-1 text-xs text-zinc-500">Used for payouts. Never shown publicly.</p>
      </div>

      {error && <p className="notice-error">{error}</p>}

      <div className="flex gap-3">
        {onSkip && (
          <button className="btn btn-ghost flex-1" onClick={onSkip} disabled={saving}>
            Skip
          </button>
        )}
        <button className="btn btn-primary flex-[2]" onClick={save} disabled={saving || uploading}>
          {saving ? 'Saving...' : uploading ? 'Uploading photo...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
