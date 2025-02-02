import { useState } from 'react';
import { Search, Plane, Building2, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useAgencies } from '@/lib/hooks/use-agencies';
import { useDestinations } from '@/lib/hooks/use-destinations';
import { useCampaigns } from '@/lib/hooks/use-campaigns';
import { useVols } from '@/lib/hooks/use-vols';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';

export function LandingPage() {
  const { agencies } = useAgencies();
  const { destinations } = useDestinations();
  const { campaigns } = useCampaigns();
  const { vols } = useVols();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const filteredVols = vols?.filter(vol => 
    selectedDestination ? vol.destinationId === selectedDestination : true
  );

  const filteredAgencies = agencies?.filter(agency =>
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Find the best travel deals from trusted agencies worldwide
            </p>

            {/* Search Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">All Destinations</option>
                    {destinations?.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}, {destination.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search agencies, destinations..."
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <Button className="h-full">
                  Search Flights
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Flights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Available Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVols?.map((vol) => (
              <div key={vol.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Plane className="w-6 h-6 text-primary mr-2" />
                    <h3 className="font-semibold">{vol.name}</h3>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {vol.class?.name}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(vol.startAt)} - {formatDate(vol.endAt)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {vol.destination?.name}
                  </div>
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    {vol.company?.name}
                  </div>
                </div>
                <Button className="w-full mt-4">Book Now</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Agencies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Agencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgencies?.map((agency) => (
              <div key={agency.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {agency.image1 && (
                  <img
                    src={agency.image1}
                    alt={agency.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{agency.name}</h3>
                  <p className="text-gray-600 mb-4">{agency.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {agency.location}
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < agency.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Campaigns */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Special Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {campaign.image1 && (
                  <img
                    src={campaign.image1}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{campaign.title}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {campaign.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {campaign.destination?.name}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(campaign.price)}
                    </span>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}