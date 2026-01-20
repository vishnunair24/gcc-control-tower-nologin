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
      className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 mb-3"
    >
      <span className="mr-1">←</span>
      <span>Back</span>
    </button>
  );
}
