"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Map({ location, onLocationSelect }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([location.lat, location.lng], 13)

      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(mapRef.current)

      markerRef.current = L.marker([location.lat, location.lng], { draggable: true }).addTo(mapRef.current)

      markerRef..currenton('dragend', function() {
        const position = markerRef.current.getLatLng()
        onLocationSelect({ lat: position.lat, lng: position.lng })
      })
    } else {
      mapRef.current.setView([location.lat, location.lng], 13)
      markerRef.current.setLatLng([location.lat, location.lng])
    }
  }, [location, onLocationSelect])

  return <div id="map" style={{ width: '100%', height: '300px' }} />
}

