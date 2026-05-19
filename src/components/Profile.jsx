import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Profile() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', username.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  if (loading) return <div style={{ padding: '20vh 5vw', fontSize: '24px' }}>Loading identity...</div>;
  if (!profileData) return <div style={{ padding: '20vh 5vw', fontSize: '48px', fontFamily: 'Playfair Display' }}>Identity Not Found.</div>;

  const imageUrl = profileData.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop";

  return (
    <div style={{ minHeight: '100vh', padding: '5vw' }}>
      
      {/* Magazine Style Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        borderBottom: '4px solid var(--text-primary)',
        paddingBottom: '24px',
        marginBottom: '64px'
      }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
            No. 01 / Profile
          </p>
          <h1 style={{ marginTop: '16px' }}>{profileData.fullName}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '24px', margin: 0 }}>
            {profileData.title}
          </p>
        </div>
      </header>

      {/* Asymmetrical Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)', 
        gap: '24px',
        alignItems: 'center'
      }}>
        
        {/* Left Col: High-grain style image frame */}
        <div style={{ 
          gridColumn: '1 / 6', 
          position: 'relative',
          paddingBottom: '120%', /* Aspect ratio hack */
          overflow: 'hidden',
          borderRadius: '2px 40px 2px 2px',
          filter: 'grayscale(100%) contrast(1.2)' /* Gritty film style */
        }}>
          <img 
            src={imageUrl} 
            alt="Profile" 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }} 
          />
        </div>

        {/* Right Col: Bio and Actions */}
        <div style={{ gridColumn: '7 / 12', paddingLeft: '4vw' }}>
          <h2 style={{ fontSize: '48px', marginBottom: '32px' }}>The<br/>Manifesto.</h2>
          <p style={{ fontSize: '18px', fontWeight: '500', maxWidth: '400px' }}>
            {profileData.bio}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
            <button onClick={() => {
              const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${profileData.fullName}\nORG:${profileData.title}\nNOTE:${profileData.bio}\nEND:VCARD`;
              const blob = new Blob([vCardData], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${profileData.fullName.replace(/\s+/g, '_')}.vcf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}>
              Save Contact
            </button>
            <button style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '2px solid var(--text-primary)' }}>
              Visit Website
            </button>
          </div>
        </div>

      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        opacity: 0.5
      }}>
        Powered by Iron Digital
      </div>
    </div>
  );
}
