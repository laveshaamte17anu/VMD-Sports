require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const WebsiteSettings = require('../models/WebsiteSettings');

const seed = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in environment');
        if (exitOnComplete) process.exit(1);
        return;
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    }

    // 1. Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vmdsports.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'VMDAdmin@2024';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'VMD Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('ℹ️  Admin user already exists:', adminEmail);
    }

    // 2. Create default categories
    const categoriesData = [
      { name: 'Track Pants', slug: 'track', description: 'Premium performance cricket track suits and training pants.', sortOrder: 1 },
      { name: 'T-Shirts', slug: 't-shirts', description: 'AeroDry match-day jerseys and breathable practice tees.', sortOrder: 2 },
      { name: 'Shorts', slug: 'shorts', description: 'Ergonomic cricket fielding shorts and compression base layers.', sortOrder: 3 },
      { name: 'Sleeves', slug: 'sleeves', description: 'UV-protective bowling and fielding compression arm sleeves.', sortOrder: 4 },
      { name: 'Accessories', slug: 'accessories', description: 'Official cricket sports caps, wristbands, and kit duffel bags.', sortOrder: 5 }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
      categoryMap[cat.slug] = existing._id;
    }

    // 3. Create default website settings
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({
        brandName: 'VMD Sports',
        tagline: "Behind Every Great Match, There's a Story.",
        purchaseWhatsApp: '919819483036',
        livestreamWhatsApp: '919819483036',
        bookingWhatsApp: '919819483036',
        generalPhone: '+91 98194 83036',
        contactEmail: 'vdhavade50@gmail.com',
        bookingEmail: 'bookings@vmdsports.com',
        youtubeChannel: 'https://www.youtube.com/@vmdsportslive',
        youtubeChannelName: 'VMD Sports Live',
        instagram: 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==',
        facebook: 'https://facebook.com/vmdsports',
        twitter: 'https://twitter.com/vmdsports',
        footerAbout: 'VMD Sports – Premium cricket media, broadcast live streaming, cameraman booking, and official athlete merchandise.',
        address: 'VMD Sports Production Hub, Shivaji Park, Dadar, Mumbai - 400028',
        livestreamInfo: 'Television-grade multi-camera cricket broadcasting with instant replays and animated scoreboards.'
      });
      console.log('✅ Default website settings created with configurable phone numbers');
    }

    // 4. Create sample merchandise products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'VMD Pro Strike Cricket Track Pants',
          slug: 'vmd-pro-strike-cricket-track-pants',
          description: 'Engineered for intense pre-match warmups and athletic fielding sessions. Crafted from four-way stretch interlock fabric with zippered ankle cuffs and moisture-wicking neon lime accents.',
          shortDescription: 'Four-way stretch pro training track suit with zippered cuffs.',
          category: categoryMap['track'],
          price: 2499,
          discountPrice: 1999,
          status: 'active',
          isFeatured: true,
          material: 'Poly-Spandex Interlock (88% Polyester, 12% Spandex)',
          careInstructions: 'Machine wash cold inside out. Do not tumble dry.',
          sizes: [
            { size: 'S', stock: 12 },
            { size: 'M', stock: 20 },
            { size: 'L', stock: 25 },
            { size: 'XL', stock: 18 },
            { size: 'XXL', stock: 8 }
          ],
          colors: [
            { name: 'Stealth Black & Lime', hex: '#BFFF00' },
            { name: 'Onyx Monochrome', hex: '#111111' }
          ],
          images: [
            { url: '/images/vmd_track_pants.jpg', publicId: 'sample-track-1' }
          ]
        },
        {
          name: 'VMD AeroDry Match Day Jersey',
          slug: 'vmd-aerodry-match-day-jersey',
          description: 'Official match-grade cricket jersey featuring ultra-lightweight AeroDry micro-mesh side ventilation panels to keep cricketers cool under blazing sun.',
          shortDescription: 'Ultra-lightweight match jersey with laser-perforated cooling panels.',
          category: categoryMap['t-shirts'],
          price: 1299,
          discountPrice: 999,
          status: 'active',
          isFeatured: true,
          material: '100% Breathable Recycled Micro-Poly Mesh',
          careInstructions: 'Cold hand wash or gentle cycle. Dry in shade.',
          sizes: [
            { size: 'S', stock: 15 },
            { size: 'M', stock: 30 },
            { size: 'L', stock: 35 },
            { size: 'XL', stock: 20 },
            { size: 'XXL', stock: 10 }
          ],
          colors: [
            { name: 'Neon Lime Surge', hex: '#BFFF00' },
            { name: 'Pure White Classic', hex: '#FFFFFF' }
          ],
          images: [
            { url: '/images/vmd_cricket_jersey.jpg', publicId: 'sample-tee-1' }
          ]
        },
        {
          name: 'VMD Speedster Fielding Shorts',
          slug: 'vmd-speedster-fielding-shorts',
          description: 'Optimized for high-velocity slide fielding and sprinting. Deep ball pockets, reinforced flatlock seams, and ergonomic elastic waistband with drawcord.',
          shortDescription: 'Ergonomic cricket shorts with deep ball pockets.',
          category: categoryMap['shorts'],
          price: 999,
          discountPrice: 799,
          status: 'active',
          isFeatured: true,
          material: '92% Micro-Poly, 8% Elastane',
          careInstructions: 'Machine wash warm, do not iron directly on print.',
          sizes: [
            { size: 'S', stock: 10 },
            { size: 'M', stock: 25 },
            { size: 'L', stock: 30 },
            { size: 'XL', stock: 15 },
            { size: 'XXL', stock: 5 }
          ],
          colors: [
            { name: 'Pitch Charcoal', hex: '#222222' },
            { name: 'Cricket White', hex: '#FFFFFF' }
          ],
          images: [
            { url: '/images/vmd_cricket_shorts.jpg', publicId: 'sample-shorts-1' }
          ]
        },
        {
          name: 'VMD Seam Precision UV Arm Sleeves',
          slug: 'vmd-seam-precision-uv-arm-sleeves',
          description: 'Graduated compression arm sleeves designed for fast bowlers and boundary fielders. UPF 50+ sun protection with anti-slip silicone upper grip.',
          shortDescription: 'UPF 50+ compression arm sleeves with silicone gripper.',
          category: categoryMap['sleeves'],
          price: 599,
          discountPrice: 449,
          status: 'active',
          isFeatured: true,
          material: 'High-Tension Nylon-Spandex Compression Weave',
          careInstructions: 'Hand wash cold. Line dry in shade.',
          sizes: [
            { size: 'S', stock: 20 },
            { size: 'M', stock: 40 },
            { size: 'L', stock: 40 },
            { size: 'XL', stock: 20 },
            { size: 'XXL', stock: 10 }
          ],
          colors: [
            { name: 'Neon Lime Accent', hex: '#BFFF00' },
            { name: 'Stealth Black', hex: '#000000' }
          ],
          images: [
            { url: '/images/vmd_arm_sleeves.jpg', publicId: 'sample-sleeves-1' }
          ]
        },
        {
          name: 'VMD Elite Cricket Gear & Accessories Kit',
          slug: 'vmd-elite-cricket-gear-accessories-kit',
          description: 'Complete athlete bundle featuring the official VMD pro cricket cap, moisture-absorbing wristbands, and heavy-duty water-resistant duffel kit bag.',
          shortDescription: 'Official cricket cap, dual wristbands, and premium gear bag.',
          category: categoryMap['accessories'],
          price: 1899,
          discountPrice: 1499,
          status: 'active',
          isFeatured: true,
          material: 'Reinforced 600D Cordura & Cotton Terrycloth',
          careInstructions: 'Spot clean bag with damp cloth. Hand wash wristbands.',
          sizes: [
            { size: 'Free Size', stock: 50 }
          ],
          colors: [
            { name: 'VMD Stealth Edition', hex: '#000000' },
            { name: 'VMD Lime Surge', hex: '#BFFF00' }
          ],
          images: [
            { url: '/images/vmd_sports_accessories.jpg', publicId: 'sample-acc-1' }
          ]
        }
      ];

      for (const prod of sampleProducts) {
        await Product.create(prod);
        console.log(`✅ Product created: ${prod.name}`);
      }
    }

    // 5. Create sample gallery items
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      const sampleGallery = [
        {
          title: 'Cover Drive In The Floodlights',
          tournamentName: 'T20 Championship 2026',
          imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop',
          caption: 'Classic textbook follow-through during the playoff semifinal.',
          photographer: 'VMD Senior Lens'
        },
        {
          title: 'Flying Catch At Backward Point',
          tournamentName: 'Mumbai Premier Cup',
          imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
          caption: 'Airborne horizontal dive to dismiss the set batsman.',
          photographer: 'VMD Media Crew'
        },
        {
          title: 'Fast Bowler Delivery Stride',
          tournamentName: 'State Trophy Final',
          imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=1200&auto=format&fit=crop',
          caption: 'High-speed capture of seam release at 142 km/h.',
          photographer: 'VMD Action Team'
        },
        {
          title: 'Trophy Lifting Celebration',
          tournamentName: 'Corporate Super League',
          imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
          caption: 'Golden hour confetti burst with victorious squad.',
          photographer: 'VMD Lead Lead'
        }
      ];

      for (const item of sampleGallery) {
        await Gallery.create(item);
        console.log(`✅ Gallery item created: ${item.title}`);
      }
    }

    // 6. Create sample YouTube broadcast videos
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      const sampleVideos = [
        {
          title: 'Final Over Thriller! Last Ball 6 Needed - Mumbai Corporate Cup',
          youtubeId: 'dQw4w9WgXcQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop',
          duration: '14:20',
          category: 'Match Highlights',
          isFeatured: true
        },
        {
          title: 'Top 10 Unplayable Deliveries & Shattered Stumps 2026',
          youtubeId: 'dQw4w9WgXcQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=800&auto=format&fit=crop',
          duration: '08:45',
          category: 'Wicket Compilation',
          isFeatured: true
        },
        {
          title: 'Full Match Live Stream Replay: Rising Stars vs Super Kings',
          youtubeId: 'dQw4w9WgXcQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop',
          duration: '3:15:00',
          category: 'Full Match Broadcast',
          isFeatured: false
        }
      ];

      for (const vid of sampleVideos) {
        await Video.create(vid);
        console.log(`✅ Video created: ${vid.title}`);
      }
    }

    // 7. Create sample booking requests with workflow states
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const sampleBookings = [
        {
          referenceNumber: 'VMD-202611-0001',
          customerName: 'Aditya Deshmukh',
          mobileNumber: '9820011223',
          email: 'aditya.cricket@mumbai.com',
          serviceType: 'Full Match Coverage',
          matchDate: new Date(Date.now() + 86400000 * 3),
          matchLocation: 'Wankhede Club Ground #1, Mumbai',
          tournamentName: 'Mumbai Champions League Final',
          expectedDuration: '6-8 Hours (Single ODI / Double Header)',
          additionalRequirements: 'Need 2 slow motion boundary cameras and awards stage photography.',
          status: 'Confirmed',
          estimatedPrice: 22000,
          quotationDetails: 'Package includes 3 Cinema Cameras, 1x 200-600mm lens operator, 4K digital delivery and highlight montage.',
          assignedCameraman: 'Ramesh Sharma (Rig Lead #1)',
          statusHistory: [
            { status: 'Pending', note: 'Request received via online booking form.' },
            { status: 'Under Review', note: 'Checked equipment roster. Sony FX6 and 600mm lens confirmed available.' },
            { status: 'Quotation Sent', note: 'Quotation of ₹22,000 emailed and WhatsApped to client.' },
            { status: 'Confirmed', note: 'Client accepted quote. Rig #1 assigned to Wankhede Club.' }
          ]
        },
        {
          referenceNumber: 'VMD-202611-0002',
          customerName: 'Karan Mehra',
          mobileNumber: '9833445566',
          email: 'karan@delhicricket.org',
          serviceType: 'Cricket Photography',
          matchDate: new Date(Date.now() + 86400000 * 5),
          matchLocation: 'Shivaji Park Ground #4, Dadar, Mumbai',
          tournamentName: 'Dadar Premier T20 Cup',
          expectedDuration: '3-4 Hours (Single T20 Match)',
          additionalRequirements: 'Player headshots and batsman cover drive stills.',
          status: 'Quotation Sent',
          estimatedPrice: 7500,
          quotationDetails: 'High-speed action stills, full match coverage, cloud delivery in 24 hours.',
          statusHistory: [
            { status: 'Pending', note: 'Booking submitted.' },
            { status: 'Under Review', note: 'Venue logistics verified.' },
            { status: 'Quotation Sent', note: 'Quotation of ₹7,500 sent.' }
          ]
        },
        {
          referenceNumber: 'VMD-202611-0003',
          customerName: 'Sameer Verma',
          mobileNumber: '9877112233',
          email: 'sameer@techcricket.in',
          serviceType: 'Live Streaming',
          matchDate: new Date(Date.now() + 86400000 * 8),
          matchLocation: 'Gymkhana Cricket Oval, Mumbai',
          tournamentName: 'Corporate Tech Cup 2026',
          expectedDuration: 'Full Day (Multiple Matches / League Day)',
          additionalRequirements: 'Direct YouTube live stream with live scorecard and commentary audio.',
          status: 'Under Review',
          statusHistory: [
            { status: 'Pending', note: 'Request received.' },
            { status: 'Under Review', note: 'Testing 5G cellular uplink availability at Gymkhana ground.' }
          ]
        }
      ];

      for (const bk of sampleBookings) {
        await Booking.create(bk);
        console.log(`✅ Booking created: ${bk.referenceNumber} (${bk.status})`);
      }
    }

    console.log('\n🎉 Database seeded successfully with complete cricket data!');
    console.log('📧 Admin login:', adminEmail);
    console.log('🔑 Admin password:', adminPassword);

    if (exitOnComplete) process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    if (exitOnComplete) process.exit(1);
  }
};

module.exports = seed;

if (require.main === module) {
  seed(true);
}
