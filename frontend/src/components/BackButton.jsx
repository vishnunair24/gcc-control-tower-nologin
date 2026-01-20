import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (fallback) {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-full px-3 py-1 bg-white shadow-sm hover:border-slate-400 transition-colors mb-3"
    >
      <span className="mr-1">04</span>
      <span>Back</span>
    </button>
  );
}
