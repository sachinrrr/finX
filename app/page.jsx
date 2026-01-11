import HeroSection from "@/components/hero";
import Footer from "@/components/footer";
import { featuresData, howItWorksData } from "@/data/landing";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      {/* Background effects */}
      {/* Subtle glow effects */}

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        {/* Background effects */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage your finances with confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              >
                {/* Icon container */}
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-border bg-card">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-y border-border bg-background">
        {/* Background effects */}
        {/* Decorative glow */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in three simple steps and take control of your financial future
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="group relative text-center p-8 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {index + 1}
                </div>
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 border border-border bg-card">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold tracking-tight mb-4 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
