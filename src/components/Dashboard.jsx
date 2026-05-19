import { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const emptyForm = {
  username: '',
  fullName: '',
  title: '',
  bio: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  tiktok: '',
  imageUrl: ''
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'edit'
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (viewMode === 'grid') {
      const fetchCards = async () => {
        if (!auth.currentUser) return;
        const q = query(collection(db, 'users'), where('ownerId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedCards = [];
        querySnapshot.forEach((doc) => {
          fetchedCards.push({ id: doc.id, ...doc.data() });
        });
        setCards(fetchedCards);
      };
      fetchCards();
    }
  }, [viewMode]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'username') {
      value = value.replace(/\s+/g, '').toLowerCase(); // Strips spaces immediately
    }
    setFormData({ ...formData, [e.target.name]: value });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalUsername = formData.username;
      if (!finalUsername) {
        finalUsername = Math.random().toString(36).substring(2, 8); // Auto-generate 6-character slug
      }

      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `profile_images/${finalUsername}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await setDoc(doc(db, 'users', finalUsername), {
        ...formData,
        username: finalUsername,
        imageUrl: imageUrl,
        ownerId: auth.currentUser.uid, // Tie the card to the authenticated user!
        updatedAt: new Date().toISOString()
      });
      
      alert('Identity saved successfully!');
      setImageFile(null);
      setViewMode('grid');
    } catch (error) {
      console.error("Error saving document: ", error);
      alert('Error saving profile. Check console.');
    } finally {
      setIsUploading(false);
    }
  };

  // -------------------------
  // RENDER: GRID VIEW
  // -------------------------
  if (viewMode === 'grid') {
    return (
      <div className="editorial-grid">
        <div style={{ padding: '80px 40px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'var(--bg-color)' }}>Command<br/>Center.</h1>
            <p style={{ marginTop: '40px', opacity: 0.8 }}>
              Manage your digital footprint. Create distinct identities for distinct interactions.
            </p>
          </div>
          <button 
            onClick={() => signOut(auth)} 
            style={{ alignSelf: 'flex-start', marginTop: '40px', backgroundColor: 'transparent', color: 'var(--bg-color)', border: '2px solid var(--bg-color)', fontSize: '12px', padding: '8px 16px' }}
          >
            Sign Out
          </button>
        </div>

        <div style={{ padding: '80px 10%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px' }}>Your Identities</h2>
            <button onClick={() => { setFormData(emptyForm); setViewMode('edit'); }}>
              Create New
            </button>
          </div>

          {cards.length === 0 ? (
            <div style={{ border: '2px dashed var(--text-primary)', padding: '64px', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>No identities found.</p>
              <p style={{ opacity: 0.7, marginTop: '8px' }}>Click 'Create New' to forge your first card.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {cards.map(card => (
                <div 
                  key={card.id} 
                  className="organic-card" 
                  style={{ transition: 'transform 0.2s ease', padding: '24px', position: 'relative' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{card.fullName}</h3>
                  <p style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.8, margin: 0 }}>{card.title}</p>
                  
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--text-primary)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* View Live Profile */}
                    <a href={`/${card.username}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔗 View Live Link
                    </a>

                    {/* Edit Button */}
                    <button 
                      onClick={() => { setFormData(card); setViewMode('edit'); }}
                      style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', padding: '4px 8px', fontSize: '12px', width: 'fit-content' }}
                    >
                      Edit Details
                    </button>
                    
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', margin: '8px 0 0 0' }}>Write to NFC Chip:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => {
                        window.location.href = `intent://configure?mode=url&url=${encodeURIComponent(`https://nfcbiz.rgdevelops.com/${card.username}`)}#Intent;scheme=nfcbiz;package=com.example.nfccardemulator;end`;
                      }} style={{ flex: 1, backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', fontSize: '10px', padding: '6px' }}>
                        🔗 As Link
                      </button>
                      <button onClick={() => {
                        const intentUrl = `intent://configure?mode=vcard&name=${encodeURIComponent(card.fullName || '')}&company=${encodeURIComponent(card.company || '')}&phone=${encodeURIComponent(card.phone || '')}&email=${encodeURIComponent(card.email || '')}#Intent;scheme=nfcbiz;package=com.example.nfccardemulator;end`;
                        window.location.href = intentUrl;
                      }} style={{ flex: 1, backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', fontSize: '10px', padding: '6px' }}>
                        👤 As Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------
  // RENDER: EDIT VIEW
  // -------------------------
  return (
    <div className="editorial-grid">
      <div style={{ padding: '80px 40px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'var(--bg-color)' }}>Forge.<br/>Identity.</h1>
          <p style={{ marginTop: '40px', opacity: 0.8 }}>
            Shape the data. Everything typed here will be written into the NFC chip payload via your public URL.
          </p>
        </div>
        <button 
          onClick={() => setViewMode('grid')} 
          style={{ alignSelf: 'flex-start', marginTop: '40px', backgroundColor: 'transparent', color: 'var(--bg-color)', border: '2px solid var(--bg-color)', fontSize: '12px', padding: '8px 16px' }}
        >
          ← Cancel / Back
        </button>
      </div>

      <div style={{ padding: '80px 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="organic-card">
          <h2 style={{ marginBottom: '40px' }}>Configuration</h2>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Username input removed for auto-generation */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Display Name</label>
              <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Job Title</label>
              <input type="text" name="title" placeholder="Lead Innovator" value={formData.title} onChange={handleChange} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Manifesto (Bio)</label>
              <textarea name="bio" rows="3" placeholder="Punchy, opinionated, concise." value={formData.bio} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Company Name</label>
              <input type="text" name="company" placeholder="Iron Digital" value={formData.company} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Phone Number</label>
              <input type="tel" name="phone" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Email Address</label>
              <input type="email" name="email" placeholder="hello@irondigital.mi" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Website</label>
              <input type="url" name="website" placeholder="https://irondigital.mi" value={formData.website} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Instagram</label>
                <input type="text" name="instagram" placeholder="@username" value={formData.instagram} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>LinkedIn</label>
                <input type="url" name="linkedin" placeholder="linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>X (Twitter)</label>
                <input type="text" name="twitter" placeholder="@username" value={formData.twitter} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>TikTok</label>
                <input type="text" name="tiktok" placeholder="@username" value={formData.tiktok} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Profile Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ border: 'none', marginTop: '8px' }} />
              {formData.imageUrl && !imageFile && (
                <p style={{ fontSize: '12px', marginTop: '8px', color: 'green' }}>✓ Image currently saved</p>
              )}
            </div>

            <button type="submit" disabled={isUploading} style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
              {isUploading ? 'Uploading...' : 'Save Identity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
