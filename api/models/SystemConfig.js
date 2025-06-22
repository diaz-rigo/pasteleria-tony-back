const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  // Estilos generales
  headerBackgroundColor: { type: String, default: '#fbeded' },
  footerBackgroundColor: { type: String, default: '#212121' },
  primaryColor: { type: String, default: '#e4b500' },

  // Medios
  logoUrl: { type: String },
  faviconUrl: { type: String },
  showheaderImage: { type: Boolean, default: true },

  // Footer
  footerText: { type: String, default: '© 2025 Repostería Tony' },
  footerLinks: [
    {
      text: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],

  // Hero section
  
  heroTitle: { type: String, default: 'Bienvenido a Repostería Tony' },
  heroSubtitle: { type: String, default: 'Dulces momentos, grandes sabores' },
  heroImageUrl: { type: String },
  heroButtonText: { type: String, default: 'Ver productos' },
  heroButtonUrl: { type: String, default: '/productos' },

  // Opciones de visibilidad
  showHeroTitle: { type: Boolean, default: true },
  showHeroSubtitle: { type: Boolean, default: true },
  showHeroImage: { type: Boolean, default: true },
  showHeroButton: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },




  
  // Sección de Contacto (nuevo)
  contactInfo: {
    businessName: { type: String, default: 'Repostería Tony' },
    address: {
      street: { type: String, default: 'Calle Principal 123' },
      city: { type: String, default: 'Ciudad' },
      state: { type: String, default: 'Estado' },
      zipCode: { type: String, default: '00000' },
      country: { type: String, default: 'México' }
    },
    phones: [
      {
        type: { type: String, enum: ['mobile', 'office', 'whatsapp'], default: 'mobile' },
        number: { type: String },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    emails: [
      {
        address: { type: String, default: 'contacto@reposteria-tony.com' },
        isPrimary: { type: Boolean, default: true }
      }
    ],
    businessHours: [
      {
        days: { type: String, default: 'Lunes a Viernes' },
        hours: { type: String, default: '9:00 AM - 6:00 PM' },
        isOpen: { type: Boolean, default: true }
      }
    ],
    socialMedia: [
      {
        platform: { 
          type: String, 
          enum: ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'pinterest'],
          required: true
        },
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true }
      }
    ],
    mapEmbedUrl: { type: String },
    contactFormEnabled: { type: Boolean, default: true }
  },

  // SEO y Metadata
  metaTitle: { type: String, default: 'Repostería Tony - Los mejores postres artesanales' },
  metaDescription: { type: String, default: 'Descubre nuestros deliciosos postres artesanales hechos con ingredientes de la más alta calidad' },
  metaKeywords: [{ type: String }],
});

module.exports = mongoose.model('Config', configSchema);
