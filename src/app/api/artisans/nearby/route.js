import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));

        if (!lat || !lng) {
            return NextResponse.json({ success: false, message: 'Coordonnées requises' }, { status: 400 });
        }

        // Fetch all artisans
        const artisans = await User.find({ role: 'artisan', status: 'approved' })
            .select('name image specialty companyName lastLocation phone address fidelityRank points')
            .lean();

        // Calculate distance and sort
        const nearbyArtisans = artisans
            .map(artisan => {
                let distance = 99999;
                if (artisan.lastLocation && artisan.lastLocation.lat) {
                    distance = getDistanceFromLatLonInKm(
                        lat, lng,
                        artisan.lastLocation.lat, artisan.lastLocation.lng
                    );
                }
                return { ...artisan, distance: parseFloat(distance.toFixed(1)) };
            })
            // Filter out those with no location (distance 99999) IF we want strictly nearby
            // But maybe show all if few? Let's show only valid ones for "Nearby" feature
            .filter(a => a.distance < 1000) // Within 1000km
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Top 10

        return NextResponse.json({ success: true, artisans: nearbyArtisans });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
