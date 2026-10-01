import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { organizerApi } from '../../api/organizer';
import type { OrganizerEvent } from '../../api/types';

interface Props {
  event: OrganizerEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddImagesModal: React.FC<Props> = ({ event, onClose, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  if (!event) return null;

  const currentCount = event.images?.length || 0;
  const remainingAllowed = Math.max(0, 10 - currentCount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > remainingAllowed) {
      toast.error(`You can only upload up to ${remainingAllowed} more image(s)`);
      return;
    }
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least 1 image to upload');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await organizerApi.addEventImages(event.id, formData);
      toast.success('Images uploaded successfully!');
      setSelectedFiles([]);
      setPreviews([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (currentCount <= 1) {
      toast.error('An event must keep at least 1 image banner');
      return;
    }

    if (!confirm('Are you sure you want to delete this event image?')) return;

    try {
      setDeletingImageId(imageId);
      await organizerApi.deleteEventImage(event.id, imageId);
      toast.success('Image deleted');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image');
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-black text-purple-950 font-heading flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-600" />
              Event Gallery &amp; Banners
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Current Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Current Photos ({currentCount} / 10)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {event.images?.map((img, idx) => (
                <div key={img.id || idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                  <img src={img.url} alt="event" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    disabled={deletingImageId === img.id}
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-700 disabled:opacity-50"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload New Section */}
          {remainingAllowed > 0 ? (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Upload New Photos (Up to {remainingAllowed} more)
              </h3>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/40 hover:bg-pink-50/80 cursor-pointer transition">
                <Upload className="w-7 h-7 text-pink-500 mb-1.5" />
                <span className="font-bold text-slate-800">Select photos to upload</span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, or WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                      <img src={src} alt="new-preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-amber-700 text-xs font-semibold bg-amber-50 p-3 rounded-xl">
              This event has reached the maximum quota of 10 gallery photos.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
          >
            Done
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:from-amber-600 hover:to-pink-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                `Upload ${selectedFiles.length} Photo(s)`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
