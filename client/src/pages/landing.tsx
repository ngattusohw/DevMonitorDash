import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle2, BarChart2, Bell, LineChart, LucideIcon, Server, Shield, Clock } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border border-muted bg-background/50">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

interface PricingPlanProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  className?: string;
}

function PricingPlan({ title, price, description, features, cta, popular, className }: PricingPlanProps) {
  return (
    <Card className={`${className} ${popular ? 'border-primary shadow-lg' : 'border-muted'}`}>
      {popular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Popular</span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground"> /month</span>}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard" className="w-full">
          <Button 
            size="lg" 
            className={`w-full ${popular ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
          >
            {cta}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center space-y-12 lg:space-y-0 lg:space-x-12">
          <div className="space-y-8 lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Unified Developer Monitoring Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor all your services in one place. Track metrics, get alerts, and optimize performance across your entire stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                  Get Started
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-card border border-muted shadow-2xl rounded-lg overflow-hidden">
              <img 
                src="https://placehold.co/600x400/4f46e5/ffffff?text=Monitoring+Dashboard" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Consolidate metrics from all your services into a single, customizable dashboard
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={BarChart2}
            title="Unified Metrics"
            description="View metrics from multiple services in a single dashboard, with custom views for each project."
          />
          <FeatureCard
            icon={Bell}
            title="Smart Alerts"
            description="Get notified when metrics deviate from normal patterns, with customizable thresholds."
          />
          <FeatureCard
            icon={LineChart}
            title="Visual Analytics"
            description="Interactive charts and graphs that make it easy to spot trends and anomalies."
          />
          <FeatureCard
            icon={Server}
            title="Service Integrations"
            description="Connect to Stytch, OneSignal, AWS, Mixpanel and more with just a few clicks."
          />
          <FeatureCard
            icon={Shield}
            title="Secure by Design"
            description="Your API keys and credentials are encrypted and stored securely."
          />
          <FeatureCard
            icon={Clock}
            title="Real-time Updates"
            description="See your metrics update in real-time, with configurable refresh intervals."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works for your needs
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <PricingPlan
            title="Free"
            price="Free"
            description="Perfect for personal projects and experimentation"
            features={[
              "1 project",
              "3 service integrations",
              "Basic metrics visualization",
              "Standard alert notifications",
              "7-day data retention"
            ]}
            cta="Get Started"
          />
          <PricingPlan
            title="Premium"
            price="$10"
            description="For teams and professional developers"
            features={[
              "Unlimited projects",
              "Unlimited service integrations",
              "Advanced visualization options",
              "Custom alert rules and thresholds",
              "30-day data retention",
              "Priority support"
            ]}
            cta="Upgrade Now"
            popular={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to streamline your monitoring?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Get started with our free plan today. No credit card required.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
              Start Monitoring Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4">DevMonitor</h3>
            <p className="text-muted-foreground">
              Comprehensive monitoring for developers and teams.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} DevMonitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;