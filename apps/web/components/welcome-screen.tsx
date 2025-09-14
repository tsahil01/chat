interface WelcomeScreenProps {
  className?: string;
}

export function WelcomeScreen({ className = "" }: WelcomeScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-full text-center ${className}`}>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Chat</h1>
        <p className="text-muted-foreground">Start a conversation by typing a message below.</p>
      </div>
    </div>
  );
}
