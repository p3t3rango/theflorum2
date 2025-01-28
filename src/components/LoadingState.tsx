export function LoadingState({ message }: { message: string }) {
  return (
    <div className="text-center space-y-6 p-8">
      <div className="animate-pulse text-purple-400 text-2xl">✧</div>
      <p className="text-white/80 font-mono">{message}</p>
      <div className="h-1 w-48 mx-auto bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500/50 animate-loading"></div>
      </div>
    </div>
  )
} 