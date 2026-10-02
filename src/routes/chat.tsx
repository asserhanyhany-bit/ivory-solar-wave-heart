import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BoothShell } from "@/components/nightline/booth-shell";
import { ChatView } from "@/components/nightline/chat-view";
import { EndView } from "@/components/nightline/end-view";
import { SearchingView } from "@/components/nightline/searching-view";
import { useNightline } from "@/lib/nightline/use-nightline";
import { hasAgeConfirm, takeInterests } from "@/lib/nightline/storage";

export const Route = createFileRoute("/chat")({ component: ChatPage });

function ChatPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!hasAgeConfirm()) {
      void navigate({ to: "/" });
      setAllowed(false);
      return;
    }
    setInterests(takeInterests());
    setAllowed(true);
  }, [navigate]);

  if (allowed !== true) {
    return (
      <BoothShell>
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
          Opening the booth…
        </div>
      </BoothShell>
    );
  }

  return <LiveChat interests={interests} />;
}

function LiveChat({ interests }: { interests: string[] }) {
  const navigate = useNavigate();
  const line = useNightline(interests);

  return (
    <BoothShell>
      {line.phase === "searching" ? (
        <SearchingView
          elapsed={line.searchElapsed}
          onCancel={() => {
            line.leave();
            void navigate({ to: "/" });
          }}
          onDemo={line.startDemo}
        />
      ) : null}
      {line.phase === "matched" ? (
        <ChatView
          messages={line.messages}
          partnerTyping={line.partnerTyping}
          partnerInterests={line.partnerInterests}
          isDemo={line.isDemo}
          warning={line.warning}
          mutedUntil={line.mutedUntil}
          matchElapsed={line.matchElapsed}
          soundOn={line.soundOn}
          unread={line.unread}
          onSend={line.send}
          onRetry={line.retry}
          onSkip={line.skip}
          onReport={line.report}
          onTyping={line.notifyTyping}
          onSound={line.setSoundOn}
          onSticky={line.setSticky}
        />
      ) : null}
      {line.phase === "ended" && line.endReason ? (
        <EndView
          reason={line.endReason}
          onAgain={line.findNew}
          onHome={() => {
            line.leave();
            void navigate({ to: "/" });
          }}
        />
      ) : null}
    </BoothShell>
  );
}
