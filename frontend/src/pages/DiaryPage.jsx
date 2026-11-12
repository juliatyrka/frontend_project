import ProductSearch from '../components/ProductSearch';
import DailyLogView from '../components/DailyLogView';

export default function DiaryPage() {
  return (
    <div className="page-container">
      <ProductSearch />
      <DailyLogView />
    </div>
  );
}