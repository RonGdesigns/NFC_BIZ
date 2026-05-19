import { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    title: '',
    bio: '',
    company: '',
    phone: '',
    email: '',
    website: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'username') {
      value = value.replace(/\s+/g, '').toLowerCase(); // Strips spaces immediately
    }
    setFormData({ ...formData, [e.target.name]: value });
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
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
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
      <div style={{ padding: '80px 40px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'var(--bg-color)' }}>Digital.<br/>Identity.</h1>
          <p style={{ marginTop: '40px', opacity: 0.8 }}>
            Forget the generic gloss. Craft an identity that cuts through the noise. 
            Your NFC card points here. Set the coordinates.
          </p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          style={{ alignSelf: 'flex-start', marginTop: '40px', backgroundColor: 'transparent', color: 'var(--bg-color)', border: '2px solid var(--bg-color)', fontSize: '12px', padding: '8px 16px' }}
        >
          Sign Out
        </button>
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
                Company Name
              </label>
              <input type="text" name="company" placeholder="Iron Digital" value={formData.company} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Phone Number
              </label>
              <input type="tel" name="phone" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Email Address
              </label>
              <input type="email" name="email" placeholder="hello@irondigital.mi" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Website
              </label>
              <input type="url" name="website" placeholder="https://irondigital.mi" value={formData.website} onChange={handleChange} />
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
