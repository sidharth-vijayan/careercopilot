import { ChatClient } from "@/components/dashboard/chat-client";

export const metadata = {
  title: "Ask AI · Recut",
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Ask AI</h2>
        <p className="text-muted-foreground">
          Career questions answered against your own resume and Vault.
        </p>
      </div>

      <ChatClient />
    </div>
  );
}
