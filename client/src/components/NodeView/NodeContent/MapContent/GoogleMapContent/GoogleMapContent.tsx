import './GoogleMapContent.scss'


// @ts-ignore
import mapboxgl, { Marker } from '!mapbox-gl'
import { UrlWithStringQuery } from 'url'

interface IGoogleMapProps {
  onMapClick: (e: mapboxgl.MapMouseEvent) => void
}

export const GoogleMapContent = (props: IGoogleMapProps) => {
  const { onMapClick } = props
  return <div id="map" style={{ width: '550px', height: '400px' }}></div>
}

// const deepCompareEqualsForMaps = createCustomEqual(
//   (deepEqual) => (a: any, b: any) => {
//     if (
//       isLatLngLiteral(a) ||
//       a instanceof google.maps.LatLng ||
//       isLatLngLiteral(b) ||
//       b instanceof google.maps.LatLng
//     ) {
//       return new google.maps.LatLng(a).equals(new google.maps.LatLng(b))
//     }

//     // TODO extend to other types

//     // use fast-equals for other objects
//     return deepEqual(a, b)
//   }
// );

// function useDeepCompareMemoize(value: any) {
//   const ref = useRef()

//   if (!deepCompareEqualsForMaps(value, ref.current)) {
//     ref.current = value;
//   }

//   return ref.current;
// }

// function useDeepCompareEffectForMaps(
//   callback: React.EffectCallback,
//   dependencies: any[]
// ) {
//   useEffect(callback, dependencies.map(useDeepCompareMemoize));
// }
