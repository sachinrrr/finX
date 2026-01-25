"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Send,
  Loader2,
  Bot,
  User,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  sendMessage,
} from "@/actions/chat";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [hoveredConversation, setHoveredConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    const result = await getConversations();
    if (result.success) {
      setConversations(result.data);
    }
    setIsLoadingConversations(false);
  };

  const loadConversation = async (conversationId) => {
    const result = await getConversation(conversationId);
    if (result.success) {
      setActiveConversation(result.data);
      setMessages(
        result.data.messages.map((m) => ({
          id: m.id,
          role: m.role.toLowerCase(),
          content: m.content,
        }))
      );
    }
  };

  const handleNewChat = async () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = async (conversation) => {
    await loadConversation(conversation.id);
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    await deleteConversation(conversationId);
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let currentConversation = activeConversation;

    if (!currentConversation) {
      const result = await createConversation();
      if (!result.success) return;
      currentConversation = result.data;
      setActiveConversation(currentConversation);
      await loadConversations();
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ]);
    setIsLoading(true);

    try {
      const result = await sendMessage(currentConversation.id, userMessage);
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { id: result.data.id, role: "assistant", content: result.data.content },
        ]);
        await loadConversations();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Sorry, I encountered an error: ${result.error}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    {
      icon: TrendingUp,
      text: "How much did I spend this month?",
      color: "text-emerald-400",
    },
    {
      icon: PiggyBank,
      text: "Am I over budget?",
      color: "text-amber-400",
    },
    {
      icon: Wallet,
      text: "What are my top expense categories?",
      color: "text-blue-400",
    },
    {
      icon: ArrowUpRight,
      text: "Compare my spending to last month",
      color: "text-purple-400",
    },
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-background via-background to-background/95">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col bg-card/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out shrink-0 overflow-hidden",
          isSidebarOpen ? "w-72" : "w-0"
        )}
      >
        <div className={cn("flex flex-col h-full", !isSidebarOpen && "opacity-0")}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Chats</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={handleNewChat}
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New conversation</span>
            </Button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading chats...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to begin</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    onMouseEnter={() => setHoveredConversation(conversation.id)}
                    onMouseLeave={() => setHoveredConversation(null)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200",
                      activeConversation?.id === conversation.id
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      activeConversation?.id === conversation.id
                        ? "bg-primary/20"
                        : "bg-white/5"
                    )}>
                      <MessageSquare className={cn(
                        "h-4 w-4",
                        activeConversation?.id === conversation.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        activeConversation?.id === conversation.id
                          ? "text-foreground"
                          : "text-foreground/80"
                      )}>
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatTime(conversation.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      className={cn(
                        "h-7 w-7 rounded-lg shrink-0 transition-all",
                        hoveredConversation === conversation.id || activeConversation?.id === conversation.id
                          ? "opacity-100"
                          : "opacity-0",
                        "hover:bg-destructive/20 hover:text-destructive"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Toggle Sidebar Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "absolute top-4 z-20 h-9 w-9 rounded-lg bg-card/80 backdrop-blur-sm border border-white/10 hover:bg-card transition-all duration-300 shadow-lg",
          isSidebarOpen ? "left-[260px]" : "left-4"
        )}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 max-w-3xl mx-auto">
              {/* Hero Section */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-3xl opacity-50" />
                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/25">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-center">
                Chat with your{" "}
                <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Finances
                </span>
              </h1>
              
              <p className="text-muted-foreground text-center max-w-md mb-10 text-base leading-relaxed">
                Ask anything about your spending, budget, or transactions. I analyze your real financial data to give you accurate insights.
              </p>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pb-4">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question.text)}
                    className="group relative flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={cn("h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", question.color)}>
                      <question.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors relative z-10 flex-1">
                      {question.text}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-8 px-4">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 group",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-110",
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary via-primary to-primary/70 shadow-primary/20 ring-2 ring-primary/20"
                          : "bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-md shadow-black/10"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Bot className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-6 py-4 shadow-xl transition-all duration-300 group-hover:shadow-2xl",
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-primary/20 ring-1 ring-white/10"
                          : "bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20 text-foreground backdrop-blur-xl shadow-black/10 hover:border-white/30"
                      )}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-md shadow-xl shadow-black/10">
                      <Bot className="h-5 w-5 text-foreground animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20 px-6 py-4 backdrop-blur-xl shadow-xl shadow-black/10">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-primary/70 animate-bounce shadow-lg shadow-primary/30" style={{ animationDelay: "0ms" }} />
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-primary/70 animate-bounce shadow-lg shadow-primary/30" style={{ animationDelay: "150ms" }} />
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-primary/70 animate-bounce shadow-lg shadow-primary/30" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Analyzing your finances...</span>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 pb-6 bg-gradient-to-t from-background via-background to-transparent border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-2 shadow-2xl backdrop-blur-sm focus-within:border-primary/50 focus-within:bg-white/[0.05] transition-all duration-300"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 min-h-[48px] max-h-[200px]"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "h-11 w-11 rounded-xl shrink-0 transition-all duration-300",
                  input.trim()
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-lg shadow-primary/25"
                    : "bg-white/10 text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              Responses are based on your actual transaction data • Press Enter to send
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
