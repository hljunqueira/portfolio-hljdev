import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { LeadMarker } from './LeadMarker';

interface Lead {
  id: string;
  nome: string;
  lead_score: number;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  endereco?: string;
  website?: string;
  whatsapp?: string;
  rating?: number;
}

interface MapContainerProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  selectedLeadId?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [{"color": "#212121"}]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#212121"}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{"color": "#18181b"}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#18181b"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#2c2c2c"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#3c3c3c"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    }
  ]
};

export function MapContainer({ leads, onLeadSelect, selectedLeadId }: MapContainerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const center = useMemo(() => {
    if (leads.length > 0) {
      return { lat: leads[0].latitude, lng: leads[0].longitude };
    }
    return { lat: -23.5505, lng: -46.6333 }; // São Paulo default
  }, [leads]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Carregando Mapas...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {leads.map((lead) => (
        <OverlayView
          key={lead.id}
          position={{ lat: lead.latitude, lng: lead.longitude }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <LeadMarker 
            lead={lead} 
            onClick={onLeadSelect} 
            isSelected={selectedLeadId === lead.id}
          />
        </OverlayView>
      ))}
    </GoogleMap>
  );
}
