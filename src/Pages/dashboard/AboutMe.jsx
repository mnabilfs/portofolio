import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { User, Upload, ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

export default function AboutMe() {
  const [dataId, setDataId] = useState(null);
  const [cvLink, setCvLink] = useState("");
  const [profileImg, setProfileImg] = useState("");
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("about_me").select("*").limit(1);
    if (data && data.length > 0) {
      setDataId(data[0].id);
      setCvLink(data[0].cv_link || "");
      setProfileImg(data[0].profile_img || "");
      setPreview(data[0].profile_img || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadImage = async (f) => {
    const fileName = `profile-${Date.now()}-${f.name}`;
    // Using project-images bucket since it's already configured for other images
    await supabase.storage.from("project-images").upload(fileName, f);
    const { data } = supabase.storage.from("project-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imgUrl = profileImg;
      if (file) {
        imgUrl = await uploadImage(file);
      }

      const payload = {
        cv_link: cvLink,
        profile_img: imgUrl
      };

      if (dataId) {
        // Update
        await supabase.from("about_me").update(payload).eq("id", dataId);
      } else {
        // Insert
        const { data } = await supabase.from("about_me").insert(payload).select();
        if (data && data.length > 0) {
          setDataId(data[0].id);
        }
      }

      // Sync the new profile image to Admin's comments (Pinned comments)
      await supabase
        .from("portfolio_comments")
        .update({ profile_image: imgUrl })
        .eq("is_pinned", true);
      
      setProfileImg(imgUrl);
      setFile(null);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data About Me berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#6366f1',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat memperbarui data.',
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
          <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">About Me</h1>
          <p className="text-gray-500 text-xs">Manage your profile and CV link</p>
        </div>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <InputField
              label="Download CV Link (Google Drive)"
              value={cvLink}
              onChange={(e) => setCvLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />

            <div className="space-y-1.5">
              <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                Profile Image
              </label>
              <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
                {preview ? (
                  <img
                    src={preview}
                    className="h-20 w-20 object-cover rounded-full border border-white/10"
                    alt="preview"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-300">
                    {preview ? "Change image" : "Click to upload image"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    PNG, JPG, WEBP supported
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="relative group/s">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
                <div className="relative flex items-center gap-2 px-6 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="text-sm text-gray-200">
                    {saving ? "Saving..." : "Save Changes"}
                  </span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
