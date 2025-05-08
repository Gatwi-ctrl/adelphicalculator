import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">
          Adelphi Healthcare Pay Calculator
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl">
          Create transparent and competitive pay packages for healthcare professionals with our easy-to-use calculator.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Healthcare professionals" 
            className="w-full h-48 object-cover rounded-md mb-6"
          />
          <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-3">
            For Staffing Specialists
          </h2>
          <p className="text-neutral-600 mb-6 text-center">
            Create detailed pay packages with comprehensive breakdowns of all costs, taxes, and burdens. Email or text packages directly to providers.
          </p>
          <Button asChild className="w-full md:w-auto">
            <Link to="/calculator">
              Create Pay Package
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Medical staffing" 
            className="w-full h-48 object-cover rounded-md mb-6"
          />
          <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-3">
            For Healthcare Providers
          </h2>
          <p className="text-neutral-600 mb-6 text-center">
            Receive transparent breakdowns of your pay package including taxable wages, stipends, and estimated take-home pay.
          </p>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to="/history">
              View Past Packages
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Accurate Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Our calculator accounts for standard burdens, taxes, and additional costs to give you precise pay package details.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Easy Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Send pay packages instantly via email or SMS directly from the calculator to streamline your workflow.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package History</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Access all previously created pay packages to track, compare, or duplicate for faster creation of similar packages.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-16">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8">
            <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-4">
              Start Creating Pay Packages
            </h2>
            <p className="text-neutral-600 mb-6">
              Our user-friendly calculator provides a detailed breakdown of compensation, agency costs, and estimated take-home pay with just a few inputs.
            </p>
            <Button asChild size="lg">
              <Link to="/calculator">
                Go to Calculator
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2 min-h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}></div>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-4">
          Trusted by Healthcare Facilities Nationwide
        </h2>
        <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
          Our calculator is used by staffing specialists to create fair and competitive pay packages for healthcare professionals across the country.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Healthcare workplace" 
            className="w-full h-48 object-cover rounded-lg shadow-md" 
          />
          <img 
            src="https://images.unsplash.com/photo-1631217868264-e6b507c77知识4e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Healthcare workplace" 
            className="w-full h-48 object-cover rounded-lg shadow-md" 
          />
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Healthcare professionals" 
            className="w-full h-48 object-cover rounded-lg shadow-md" 
          />
          <img 
            src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Medical staffing" 
            className="w-full h-48 object-cover rounded-lg shadow-md" 
          />
        </div>
      </div>
    </div>
  );
}
