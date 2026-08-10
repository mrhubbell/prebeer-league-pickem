import Link from "next/link";

export default function PublicHeader() {
  return (
    <div className="mb-6 text-center">
      <Link href="/" className="block">
        <img
          src="/images/pre-beer-league-logo.png"
          alt="Pre-Beer League Pick 'Em"
          className="w-120 object-contain"
        />
      </Link>

      <p className="mt-2 text-lg font-bold text-slate-200">
        Predict. Compete. Drink responsibly-ish.
      </p>
    </div>
  );
}