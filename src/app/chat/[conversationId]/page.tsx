import { ChatDashboard } from "@/components/chat/ChatDashboard";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({
  params
}: ConversationPageProps) {
  const { conversationId } = await params;

  return <ChatDashboard activeConversationId={conversationId} />;
}
