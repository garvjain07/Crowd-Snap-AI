import { useEffect, useRef, useState } from 'react';
import {
  FiCamera, FiCheckCircle, FiCpu, FiDatabase, FiLayers,
  FiShield, FiTrash2, FiUpload, FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';
import {
  deleteDemoSession,
  getDemoAssetUrl,
  processDemoGallery,
  searchDemoGallery,
} from '../services/api';

export default function DemoPage() {
  const galleryInput = useRef(null);
  const selfieInput = useRef(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [demoInfo, setDemoInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
      if (sessionId) deleteDemoSession(sessionId).catch(() => {});
    };
  }, [sessionId]);

  const handleGalleryFiles = (event) => {
    const files = Array.from(event.target.files).slice(0, 3);
    if (files.length !== 3) {
      toast.error('Select exactly 3 photos for this demo.');
      return;
    }
    galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    setGalleryFiles(files);
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
    setSessionId('');
    setDemoInfo(null);
    setResults(null);
  };

  const handleSelfieFile = (file) => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfie(file);
    setSelfiePreview(URL.createObjectURL(file));
    setResults(null);
  };

  const processGallery = async () => {
    if (galleryFiles.length !== 3) {
      toast.error('Upload exactly 3 gallery photos first.');
      return;
    }
    setProcessing(true);
    try {
      const response = await processDemoGallery(galleryFiles);
      setSessionId(response.data.session_id);
      setDemoInfo(response.data);
      toast.success('Three photos processed locally.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Demo processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const searchGallery = async () => {
    if (!sessionId) {
      toast.error('Process the three photos first.');
      return;
    }
    if (!selfie) {
      toast.error('Upload or capture a selfie.');
      return;
    }
    setSearching(true);
    setResults(null);
    try {
      const response = await searchDemoGallery(sessionId, selfie);
      setResults(response.data);
      if (response.data.total_matches === 0) {
        toast('No match found in these three photos.', { icon: 'ℹ️' });
      } else {
        toast.success(`${response.data.total_matches} photo match found.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Demo search failed.');
    } finally {
      setSearching(false);
    }
  };

  const clearDemo = async () => {
    if (sessionId) {
      await deleteDemoSession(sessionId).catch(() => {});
    }
    galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setSelfie(null);
    setSelfiePreview('');
    setSessionId('');
    setDemoInfo(null);
    setResults(null);
    toast.success('Temporary demo files cleared.');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 mb-5">
              <FiZap size={14} />
              Interactive product demo
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950">
              See face matching in action.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Upload three temporary photos, add a selfie, and watch how the system compares faces.
              No admin account, database record, or Cloudinary upload is used.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_14px_45px_rgba(34,49,79,0.06)]">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm">1</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Upload three gallery photos</h2>
                    <p className="text-sm text-slate-500">Choose exactly 3 JPG, PNG, or WebP images.</p>
                  </div>
                </div>
                {galleryFiles.length === 3 && <FiCheckCircle className="text-emerald-500 shrink-0" size={22} />}
              </div>

              <input
                ref={galleryInput}
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryFiles}
                className="hidden"
              />

              {galleryPreviews.length ? (
                <div className="grid grid-cols-3 gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={preview} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                      <img src={preview} alt={`Demo gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">
                        Photo {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => galleryInput.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center hover:border-primary-400 bg-slate-50/60 transition"
                >
                  <FiUpload className="mx-auto mb-3 text-slate-400" size={28} />
                  <span className="block font-bold text-slate-800">Choose 3 photos</span>
                  <span className="mt-1 block text-xs text-slate-500">A small gallery is enough for the demo</span>
                </button>
              )}

              {galleryPreviews.length > 0 && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => galleryInput.current?.click()} className="btn-secondary flex-1 !py-2.5">
                    Replace photos
                  </button>
                  <button onClick={processGallery} disabled={processing} className="btn-primary flex-1 !py-2.5">
                    {processing ? 'Processing...' : 'Process gallery'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_14px_45px_rgba(34,49,79,0.06)]">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm">2</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Add your selfie</h2>
                    <p className="text-sm text-slate-500">Upload a clear photo or capture it from the camera.</p>
                  </div>
                </div>
                {selfie && <FiCheckCircle className="text-emerald-500 shrink-0" size={22} />}
              </div>

              <input
                ref={selfieInput}
                type="file"
                accept="image/*"
                onChange={(event) => event.target.files[0] && handleSelfieFile(event.target.files[0])}
                className="hidden"
              />

              <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Demo selfie" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <FiCamera className="text-slate-300" size={36} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <button onClick={() => selfieInput.current?.click()} className="btn-secondary flex items-center justify-center gap-2">
                    <FiUpload size={17} /> Upload selfie
                  </button>
                  <button onClick={() => setShowWebcam(true)} className="btn-primary flex items-center justify-center gap-2">
                    <FiCamera size={17} /> Use camera
                  </button>
                </div>
              </div>

              <button
                onClick={searchGallery}
                disabled={searching || !sessionId || !selfie}
                className="mt-5 w-full btn-primary !py-3.5 disabled:opacity-40"
              >
                {searching ? 'Comparing faces...' : 'Find my demo photos'}
              </button>
            </div>

            {results && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Search complete</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                      {results.total_matches ? `${results.total_matches} photo match${results.total_matches > 1 ? 'es' : ''}` : 'No match found'}
                    </h2>
                  </div>
                  <button onClick={clearDemo} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600">
                    <FiTrash2 size={16} /> Clear demo
                  </button>
                </div>
                {results.results.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.results.map((photo) => (
                      <div key={photo.photo_id} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                        <img
                          src={getDemoAssetUrl(photo.url)}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                            event.currentTarget.insertAdjacentHTML(
                              'beforebegin',
                              '<span class="px-3 text-center text-xs font-semibold text-slate-500">Photo preview unavailable</span>'
                            );
                          }}
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">
                          {Math.round(photo.similarity_score * 100)}% match
                        </span>
                        <span className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-slate-950/70 px-2 py-1 text-[10px] text-white">
                          {photo.filename}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">How it works</p>
              <div className="mt-5 space-y-5">
                {[
                  { icon: <FiLayers />, title: '1. Temporary upload', text: 'Three files are saved in the server temp cache.' },
                  { icon: <FiCpu />, title: '2. Face encoding', text: 'AI detects faces and creates 128-number face signatures.' },
                  { icon: <FiZap />, title: '3. Face comparison', text: 'Your selfie signature is compared with each gallery photo.' },
                  { icon: <FiDatabase />, title: '4. No permanent save', text: 'Nothing is added to MongoDB or Cloudinary.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-primary-300">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
              <FiShield className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Demo privacy</h3>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Files expire after 30 minutes and are deleted when you clear the demo or close this page.
                </p>
              </div>
            </div>

            {demoInfo && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                <strong className="block text-slate-900 mb-1">Temporary session ready</strong>
                {demoInfo.processed_faces} faces processed across 3 photos.
              </div>
            )}
          </aside>
        </div>
      </section>

      {showWebcam && (
        <WebcamCapture
          onCapture={(file) => {
            handleSelfieFile(file);
            setShowWebcam(false);
          }}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
}
