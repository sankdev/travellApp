{/* Previous imports remain the same */}

export function LandingPage() {
    {/* Previous state and hooks remain the same */}
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section remains the same */}
  
        {/* Available Flights */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Available Flights</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {filteredVols?.map((vol) => (
                  <div key={vol.id} className="flex-none w-[300px] snap-start">
                    <div className="bg-white rounded-lg shadow-md p-6 border">
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  
        {/* Travel Agencies */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Agencies</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {filteredAgencies?.map((agency) => (
                  <div key={agency.id} className="flex-none w-[350px] snap-start">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                      {agency.image1 && (
                        <img
                          src={agency.image1}
                          alt={agency.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{agency.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{agency.description}</p>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  
        {/* Current Campaigns */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Special Campaigns</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {campaigns?.map((campaign) => (
                  <div key={campaign.id} className="flex-none w-[350px] snap-start">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
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
                        <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }