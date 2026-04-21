import React from 'react';
import './Gallery.css';

// ===== GALLERY COMPONENT =====
// This page displays a gallery of salon services and team work
// Shows before/after transformations and team photos

const Gallery = () => {
  // Hardcoded gallery items (we'll use placeholder image URLs so heights vary for an unordered/masonry look)
  const galleryItems = [
    { id: 1, category: 'Hair', title: 'Modern Haircut' },
    { id: 2, category: 'Hair', title: 'Color Treatment' },
    { id: 3, category: 'Hair', title: 'Styling' },
    { id: 4, category: 'Hair', title: 'Hair Extensions' },
    { id: 5, category: 'Nails', title: 'Manicure Design' },
    { id: 6, category: 'Nails', title: 'Pedicure Art' },
    { id: 7, category: 'Nails', title: 'Nail Art' },
    { id: 8, category: 'Nails', title: 'Gel Nails' },
    { id: 9, category: 'Makeup', title: 'Bridal Makeup' },
    { id: 10, category: 'Makeup', title: 'Party Makeup' },
    { id: 11, category: 'Makeup', title: 'Makeup Artist' },
    { id: 12, category: 'Makeup', title: 'Eye Makeup' },
    { id: 13, category: 'Facials', title: 'Facial Treatment' },
    { id: 14, category: 'Facials', title: 'Skin Glow' },
    { id: 15, category: 'Facials', title: 'Spa Facial' },
    { id: 16, category: 'Massage', title: 'Relaxation Massage' },
  ];

  // State for filter
  const [filter, setFilter] = React.useState('All');

  // Get filtered items
  const filteredItems = filter === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  // Get unique categories
  const categories = ['All', ...new Set(galleryItems.map(item => item.category))];

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-header">
        <h1>Our Gallery</h1>
        <p>Explore our salon's beautiful transformations and services</p>
      </div>

      {/* Filter buttons */}
      <div className="gallery-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="gallery-container">
        {/* Masonry-like unordered grid using CSS columns */}
        <div className="gallery-grid">
          {filteredItems.map((item) => {
            // Mapping specific service titles to reliable, high-quality salon images
            // Using ?lock parameter for LoremFlickr to ensure images stay consistent
            const imageMap = {
              'Modern Haircut': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
              'Color Treatment': `https://loremflickr.com/600/400/haircolor,salon/all?lock=${item.id}`,
              'Styling': `https://loremflickr.com/600/400/hairstyling,salon/all?lock=${item.id}`,
              'Hair Extensions': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
              'Manicure Design': `https://loremflickr.com/600/400/manicure,nails/all?lock=${item.id}`,
              'Pedicure Art': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
              'Nail Art': `https://loremflickr.com/600/400/nailart,nails/all?lock=${item.id}`,
              'Gel Nails': `https://loremflickr.com/600/400/gelnails,nails/all?lock=${item.id}`,
              'Bridal Makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
              'Party Makeup': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
              'Makeup Artist': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
              'Eye Makeup': `https://loremflickr.com/600/400/eyemakeup,beauty/all?lock=${item.id}`,
              'Facial Treatment': `https://loremflickr.com/600/400/facial,skincare/all?lock=${item.id}`,
              'Skin Glow': `https://loremflickr.com/600/400/skincare,beauty/all?lock=${item.id}`,
              'Spa Facial': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
              'Relaxation Massage': `https://loremflickr.com/600/400/massage,spa/all?lock=${item.id}`
            };

            const imgUrl = imageMap[item.title];

            return (
              <div key={item.id} className="gallery-item">
                <div
                  className="gallery-image"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                  aria-label={item.title}
                />
                <div className="gallery-info">
                  <p className="gallery-category">{item.category}</p>
                  <h3>{item.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats section */}
      <section className="gallery-stats">
        <h2>Why Our Gallery Matters</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">5000+</span>
            <p>Happy Clients</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">1000+</span>
            <p>Transformations</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">15+</span>
            <p>Expert Professionals</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">4.9★</span>
            <p>Average Rating</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
