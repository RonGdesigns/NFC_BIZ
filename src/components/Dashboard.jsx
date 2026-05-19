import { useState } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    title: '',
    bio: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `profile_images/${formData.username.toLowerCase()}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await setDoc(doc(db, 'users', formData.username.toLowerCase()), {
        username: formData.username.toLowerCase(),
        fullName: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
      alert('Profile successfully deployed to the database! Redirecting to your public URL...');
      navigate(`/${formData.username.toLowerCase()}`);
    } catch (error) {
      console.error("Error saving document: ", error);
      alert('Error saving profile. Check console.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="editorial-grid">
      {/* Left Column: Asymmetrical Typography Area */}
      <div style={{ padding: '80px 40px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}>
        <h1 style={{ color: 'var(--bg-color)' }}>Digital.<br/>Identity.</h1>
        <p style={{ marginTop: '40px', opacity: 0.8 }}>
          Forget the generic gloss. Craft an identity that cuts through the noise. 
          Your NFC card points here. Set the coordinates.
        </p>
      </div>

      {/* Right Column: The Form */}
      <div style={{ padding: '80px 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="organic-card">
          <h2 style={{ marginBottom: '40px' }}>Configuration</h2>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Unique Username
              </label>
              <input 
                type="text" 
                name="username" 
                placeholder="e.g. johndoe" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Display Name
              </label>
              <input 
                type="text" 
                name="fullName" 
                placeholder="John Doe" 
                value={formData.fullName}
                onChange={handleChange}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Job Title
              </label>
              <input 
                type="text" 
                name="title" 
                placeholder="Lead Innovator" 
                value={formData.title}
                onChange={handleChange}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Manifesto (Bio)
              </label>
              <textarea 
                name="bio" 
                rows="3" 
                placeholder="Punchy, opinionated, concise." 
                value={formData.bio}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Profile Image
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ border: 'none', marginTop: '8px' }}
              />
            </div>

            <button type="submit" disabled={isUploading} style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
              {isUploading ? 'Uploading...' : 'Engage Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
