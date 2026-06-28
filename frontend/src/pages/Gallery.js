import React from 'react';
import './Gallery.css';

const Gallery = () => {
  const galleryItems = [
    { id: 1,  category: 'Hair',    title: 'Modern Haircut',       img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80' },
    { id: 2,  category: 'Hair',    title: 'Color Treatment',      img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
    { id: 3,  category: 'Hair',    title: 'Blow-Dry Styling',     img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },
    { id: 4,  category: 'Hair',    title: 'Hair Extensions',      img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
    { id: 5,  category: 'Nails',   title: 'Manicure Design',      img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' },
    { id: 6,  category: 'Nails',   title: 'Pedicure Art',         img: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80' },
    { id: 7,  category: 'Nails',   title: 'Nail Art',             img: 'https://images.unsplash.com/photo-1614159303955-b38c9c97d1e3?auto=format&fit=crop&w=800&q=80' },
    { id: 8,  category: 'Nails',   title: 'Gel Nails',            img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80' },
    { id: 9,  category: 'Makeup',  title: 'Bridal Makeup',        img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' },
    { id: 10, category: 'Makeup',  title: 'Party Makeup',         img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80' },
    { id: 11, category: 'Makeup',  title: 'Makeup Artist',        img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80' },
    { id: 12, category: 'Makeup',  title: 'Eye Makeup',           img: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?auto=format&fit=crop&w=800&q=80' },
    { id: 13, category: 'Facials', title: 'Facial Treatment',     img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80' },
    { id: 14, category: 'Facials', title: 'Skin Glow',            img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80' },
    { id: 15, category: 'Facials', title: 'Spa Facial',           img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80' },
    { id: 16, category: 'Massage', title: 'Relaxation Massage',   img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80' },
  ];

  const [filter, setFilter] = React.useState('All');

  const filteredItems = filter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === filter);

  const categories = ['All', ...new Set(galleryItems.map(item => item.category))];

  const stats = [
    { icon: '😊', number: '5,000+', label: 'Happy Clients' },
    { icon: '✨', number: '1,000+', label: 'Transformations' },
    { icon: '💅', number: '15+',    label: 'Expert Professionals' },
    { icon: '⭐', number: '4.9',    label: 'Average Rating' },
  ];

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-header">
        <h1>Our Gallery</h1>
        <p>Explore our salon's stunning transformations and services</p>
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
        <div className="gallery-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="gallery-item">
              <div
                className="gallery-image"
                style={{ backgroundImage: `url(${item.img})` }}
                aria-label={item.title}
              />
              <div className="gallery-info">
                <p className="gallery-category">{item.category}</p>
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <section className="gallery-stats">
        <h2>Why Our Gallery Matters</h2>
        <p className="gallery-stats-sub">Real results from real clients — see what we've achieved together</p>
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-number">{s.number}</span>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
