// utils/seedVideos.js — Seed 20 sample videos into MongoDB
// Run: node utils/seedVideos.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Video = require('../models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rsv_db';

const sampleVideos = [
    // Music
    { title: 'Top 10 Hindi Songs 2024', category: 'music', description: 'Best Hindi songs compilation 2024', thumbnailUrl: 'https://picsum.photos/seed/music1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10:32', views: 154200, tags: ['hindi', 'songs', '2024'] },
    { title: 'Bollywood Dance Hits Mix', category: 'music', description: 'Ultimate Bollywood dance music mix', thumbnailUrl: 'https://picsum.photos/seed/music2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '45:12', views: 98400, tags: ['bollywood', 'dance', 'mix'] },
    { title: 'Relaxing Guitar Instrumental', category: 'music', description: 'Soft guitar music for relaxation', thumbnailUrl: 'https://picsum.photos/seed/music3/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '1:02:45', views: 67300, tags: ['guitar', 'instrumental', 'relaxing'] },

    // Gaming
    { title: 'GTA 6 Gameplay — First Look', category: 'gaming', description: 'Exclusive first look at GTA 6 gameplay footage', thumbnailUrl: 'https://picsum.photos/seed/game1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:22', views: 5200000, tags: ['gta6', 'gameplay', 'rockstar'] },
    { title: 'Minecraft Build Tutorial — Epic Castle', category: 'gaming', description: 'Step by step guide to build an epic castle in Minecraft', thumbnailUrl: 'https://picsum.photos/seed/game2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '32:10', views: 430000, tags: ['minecraft', 'build', 'tutorial'] },
    { title: 'Valorant Pro Player Tips 2024', category: 'gaming', description: 'Pro tips to improve your Valorant ranking', thumbnailUrl: 'https://picsum.photos/seed/game3/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '14:55', views: 213000, tags: ['valorant', 'tips', 'pro'] },

    // Education
    { title: 'Learn JavaScript in 1 Hour', category: 'education', description: 'Complete JavaScript beginner crash course in 60 minutes', thumbnailUrl: 'https://picsum.photos/seed/edu1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '1:02:00', views: 1200000, tags: ['javascript', 'coding', 'beginners'] },
    { title: 'MongoDB Full Course for Beginners', category: 'education', description: 'Learn MongoDB from scratch with Mongoose', thumbnailUrl: 'https://picsum.photos/seed/edu2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '2:15:33', views: 875000, tags: ['mongodb', 'database', 'backend'] },
    { title: 'Node.js REST API Tutorial', category: 'education', description: 'Build a production-ready REST API with Node.js', thumbnailUrl: 'https://picsum.photos/seed/edu3/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '1:45:12', views: 640000, tags: ['nodejs', 'api', 'express'] },
    { title: 'React Full Course 2024', category: 'education', description: 'Complete React.js tutorial from beginner to advanced', thumbnailUrl: 'https://picsum.photos/seed/edu4/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '3:10:00', views: 2100000, tags: ['react', 'frontend', 'javascript'] },

    // Trending
    { title: 'IPL 2024 Best Moments Compilation', category: 'trending', description: 'Best catches, sixes and wickets from IPL 2024', thumbnailUrl: 'https://picsum.photos/seed/trend1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:08', views: 3400000, tags: ['ipl', 'cricket', 'sports'] },
    { title: 'Viral Street Food India 2024', category: 'trending', description: 'Most viral street food videos from across India', thumbnailUrl: 'https://picsum.photos/seed/trend2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:44', views: 1800000, tags: ['food', 'india', 'viral'] },

    // Technology
    { title: 'iPhone 16 Pro — Full Review', category: 'technology', description: 'In-depth review of Apple iPhone 16 Pro', thumbnailUrl: 'https://picsum.photos/seed/tech1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '24:30', views: 920000, tags: ['iphone', 'apple', 'review'] },
    { title: 'AI Tools That Will Replace Your Job', category: 'technology', description: 'The most powerful AI tools of 2024 that are changing work', thumbnailUrl: 'https://picsum.photos/seed/tech2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:10', views: 2600000, tags: ['ai', 'tools', 'future'] },
    { title: 'Build a Chat App with Socket.io', category: 'technology', description: 'Real-time chat application with Node.js and Socket.io', thumbnailUrl: 'https://picsum.photos/seed/tech3/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '55:22', views: 340000, tags: ['nodejs', 'socket', 'realtime'] },

    // Comedy
    { title: "Stand-Up Comedy — Zakir Khan Best Moments", category: 'comedy', description: 'Funniest moments from Zakir Khan shows', thumbnailUrl: 'https://picsum.photos/seed/com1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '28:45', views: 5100000, tags: ['comedy', 'standup', 'zakir'] },
    { title: 'Harsh Beniwal — Desi School Life', category: 'comedy', description: 'Relatable Indian school life comedy sketches', thumbnailUrl: 'https://picsum.photos/seed/com2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12:30', views: 890000, tags: ['comedy', 'school', 'desi'] },

    // Fitness
    { title: '30 Minute Full Body Home Workout', category: 'fitness', description: 'No equipment needed full body workout routine', thumbnailUrl: 'https://picsum.photos/seed/fit1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '32:00', views: 1540000, tags: ['workout', 'fitness', 'home'] },
    { title: 'Yoga for Beginners — 20 Minutes', category: 'fitness', description: 'Perfect morning yoga routine for absolute beginners', thumbnailUrl: 'https://picsum.photos/seed/fit2/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20:15', views: 870000, tags: ['yoga', 'morning', 'beginners'] },

    // News
    { title: 'World News Summary — February 2026', category: 'news', description: 'Top global news headlines for February 2026', thumbnailUrl: 'https://picsum.photos/seed/news1/320/180', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8:45', views: 120000, tags: ['news', 'world', '2026'] },
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Video.deleteMany({});
        console.log('🗑️  Cleared existing videos');

        const inserted = await Video.insertMany(sampleVideos);
        console.log(`🌱 Seeded ${inserted.length} videos`);

        await mongoose.disconnect();
        console.log('✅ Done! Database seeded.');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
};

seed();
