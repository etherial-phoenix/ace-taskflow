import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Zap, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section 
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Rise Above
              <span className="block bg-gradient-warm bg-clip-text text-transparent">
                Your Project Challenges
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your workflow, boost productivity, and bring your team together
              with Phoenix's intuitive project management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="shadow-glow group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help teams collaborate effectively and deliver projects on time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-warm flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Task Management</h3>
                <p className="text-muted-foreground">
                  Create, organize, and track tasks with ease. Set priorities, deadlines, and monitor progress in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Work together seamlessly with your team. Share updates, assign tasks, and keep everyone aligned.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Built for speed and efficiency. Get things done faster with our intuitive interface and powerful features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="shadow-glow border-border/50 overflow-hidden">
            <CardContent className="p-12 text-center bg-gradient-hero">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to boost your productivity?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using Phoenix to streamline their workflow and achieve their goals.
              </p>
              <Link to="/auth">
                <Button size="lg" className="shadow-glow">
                  Start Your Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Phoenix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;