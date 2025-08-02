export function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container m-auto px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="https://www.donray.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            donray.dev
          </a>
          <a
            href="https://www.linkedin.com/in/donrayxwilliams/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
        <div className="text-sm text-muted-foreground">© 2025 Donray Williams</div>
      </div>
    </footer>
  )
}
