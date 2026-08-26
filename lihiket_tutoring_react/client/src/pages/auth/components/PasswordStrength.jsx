const STRENGTH_CONFIG = [
  { label: 'Too Weak', color: 'bg-slate-700', text: 'text-slate-500' },
  { label: 'Weak',     color: 'bg-red-500',   text: 'text-red-400' },
  { label: 'Fair',     color: 'bg-amber-500', text: 'text-amber-400' },
  { label: 'Good',     color: 'bg-blue-500',  text: 'text-blue-400' },
  { label: 'Strong',   color: 'bg-emerald-500', text: 'text-emerald-400' },
];

function calculatePasswordStrength(pass) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

export default function PasswordStrength({ password, theme }) {
  const strength = calculatePasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? config.color : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${config.text} ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
        {config.label}
      </p>
    </div>
  );
}

export { calculatePasswordStrength };
