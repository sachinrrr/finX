import {
    BarChart3,
    Receipt,
    PieChart,
    CreditCard,
    Globe,
    Zap,
    MessageCircle,
  } from "lucide-react";
  
  // Stats Data
  export const statsData = [
    {
      value: "50K+",
      label: "Active Users",
    },
    {
      value: "$2B+",
      label: "Transactions Tracked",
    },
    {
      value: "99.9%",
      label: "Uptime",
    },
    {
      value: "4.9/5",
      label: "User Rating",
    },
  ];
  
  // Features Data
  export const featuresData = [
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Chat with Your Finances",
      description:
        "Ask questions about your spending, budgets, and transactions using AI-powered conversational interface",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-slate-700" />,
      title: "Advanced Analytics",
      description:
        "Get detailed insights into your spending patterns with AI-powered analytics",
    },
    {
      icon: <Receipt className="h-8 w-8 text-slate-700" />,
      title: "Smart Receipt Scanner",
      description:
        "Extract data automatically from receipts using advanced AI technology",
    },
    {
      icon: <PieChart className="h-8 w-8 text-slate-700" />,
      title: "Budget Planning",
      description: "Create and manage budgets with intelligent recommendations",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-slate-700" />,
      title: "Multi-Account Support",
      description: "Manage multiple accounts and credit cards in one place",
    },
    {
      icon: <Globe className="h-8 w-8 text-slate-700" />,
      title: "Multi-Currency",
      description: "Support for multiple currencies with real-time conversion",
    },
    {
      icon: <Zap className="h-8 w-8 text-emerald-700" />,
      title: "Automated Insights",
      description: "Get automated financial insights and recommendations",
    },
  ];
  
  // How It Works Data
  export const howItWorksData = [
    {
      icon: <CreditCard className="h-8 w-8 text-slate-700" />,
      title: "1. Create Your Account",
      description:
        "Get started in minutes with our simple and secure sign-up process",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-slate-700" />,
      title: "2. Track Your Spending",
      description:
        "Automatically categorize and track your transactions in real-time",
    },
    {
      icon: <PieChart className="h-8 w-8 text-emerald-700" />,
      title: "3. Get Insights",
      description:
        "Receive AI-powered insights and recommendations to optimize your finances",
    },
  ];
  
  // Testimonials Data
  export const testimonialsData = [
    {
      name: "Maya Chen",
      role: "CFO at TechFlow",
      image: "",
      quote:
        "FinX replaced our ad-hoc spreadsheets and made month-end reviews faster. We can spot margin drift early and plan with confidence.",
    },
    {
      name: "Daniel Ruiz",
      role: "Finance Lead at Northbridge Studio",
      image: "",
      quote:
        "The dashboards are calm and precise. FinX gives us clean cash-flow visibility and the audit trail we need for Q4 planning.",
    },
    {
      name: "Aisha Patel",
      role: "COO at Beacon Logistics",
      image: "",
      quote:
        "We tightened spend controls without slowing teams down. FinX helped us track ROI by category and forecast runway more accurately.",
    },
  ];