import summitLogo from "../assets/summit-logo.png";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Left: Brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 text-slate-50 p-8">
          <div>
            <img
              src={summitLogo}
              alt="Summit Consulting"
              className="h-10 mb-10 opacity-95"
            />
            <h2 className="text-2xl font-semibold mb-3">
              GCC Control Tower
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Enterprise-grade visibility for program, infra and talent
              intelligence, tailored for each customer.
            </p>
          </div>

          <div className="text-xs text-slate-400 mt-10">
            © {new Date().getFullYear()} Summit Consulting. All rights reserved.
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
