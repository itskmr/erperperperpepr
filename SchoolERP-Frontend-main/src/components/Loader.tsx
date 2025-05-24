
import { useRecoilValue } from 'recoil';
import { loadingState } from '../recoil/atoms';

export default function Loader() {
  const loading = useRecoilValue(loadingState);

  if (!loading) return null; // Don't render if loading is false

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4 text-white text-xl">Loading...</span>
    </div>
  );
}