import HeroSection from "@/components/hero";
import Footer from "@/components/footer";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-24 border-y border-gray-200 bg-white">
        {/* Background effects */}
        {/* Subtle glow effects */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="group text-center p-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 text-sm md:text-base font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        {/* Background effects */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
              Powerful Features
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Everything you need to manage your finances with confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Icon container */}
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-gray-200 bg-white">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-y border-gray-200 bg-white">
        {/* Background effects */}
        {/* Decorative glow */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Get started in three simple steps and take control of your financial future
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="group relative text-center p-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-200 bg-white">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold tracking-tight mb-4 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50">
        {/* Background effects */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
              What Our Users Say
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Trusted by operators who want clarity, control, and a clean audit trail.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Star rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-slate-200 text-slate-300" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-6">
                  “{testimonial.quote}”
                </p>
                
                {/* User info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm font-semibold text-slate-700">
                    {String(testimonial.name || "").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
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
