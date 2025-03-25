"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Location {
  lat: number;
  lng: number;
}

interface MapProps {
  location: Location;
  onLocationSelect: (location: Location) => void;
}

export default function Map({ location, onLocationSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([location.lat, location.lng], 13)

      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(mapRef.current)

      markerRef.current = L.marker([location.lat, location.lng], { draggable: true }).addTo(mapRef.current)

      markerRef.current.on('dragend', function() {
        const position = markerRef.current?.getLatLng()
        if (position) {
          onLocationSelect({ lat: position.lat, lng: position.lng })
        }
      })
    } else {
      mapRef.current.setView([location.lat, location.lng], 13)
      markerRef.current?.setLatLng([location.lat, location.lng])
    }
  }, [location, onLocationSelect])

  return <div id="map" style={{ width: '100%', height: '300px', zIndex: 0 }} />
}

