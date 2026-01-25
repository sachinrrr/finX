export default function ChatLayout({ children }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      <div className="h-16 shrink-0" />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
