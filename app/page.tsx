import { HomeClient } from '../components/home-client';

export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  return <HomeClient mapboxToken={mapboxToken} />;
}