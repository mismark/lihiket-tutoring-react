export default function SubmitButton({ loading, text = 'Submit Registration' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Submitting Application…</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
}
