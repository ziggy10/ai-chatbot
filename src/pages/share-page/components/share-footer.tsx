export function ShareFooter() {
  return (
    <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm mt-12">
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mimir AI
          </span>
        </p>
      </div>
    </footer>
  );
}