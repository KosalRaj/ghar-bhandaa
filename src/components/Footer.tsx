export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[var(--line)] px-4 py-8 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-3 text-center text-xs sm:flex-row sm:text-left">
        <p className="m-0">
          &copy; {year} Ghar Bhandaa. All rights reserved.
        </p>
        <p className="island-kicker m-0">
          Room Rent Collection & Management
        </p>
      </div>
    </footer>
  )
}
