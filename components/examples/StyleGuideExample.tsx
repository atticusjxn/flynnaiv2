'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function StyleGuideExample() {
  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Flynn.ai Style Guide</h1>
        <p className="text-muted-foreground">Examples of our design system components</p>
      </div>

      {/* Button Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex gap-4 items-center">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and labels using our design system</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                disabled
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button>Submit Form</Button>
        </CardFooter>
      </Card>

      {/* Card Examples */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Processing</CardTitle>
            <CardDescription>AI-powered call analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Automatic transcription and event extraction from your business calls.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Learn More</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Calendar integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seamlessly sync extracted events with your calendar systems.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Configure</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Delivery</CardTitle>
            <CardDescription>Professional communication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Automated email summaries with industry-specific formatting.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Settings</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Color Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Our design system color tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-12 bg-primary rounded-lg"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-12 bg-secondary rounded-lg"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-12 bg-accent rounded-lg"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-12 bg-destructive rounded-lg"></div>
              <p className="text-sm font-medium">Destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Text styles and hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
            <h2 className="text-3xl font-bold text-foreground">Heading 2</h2>
            <h3 className="text-2xl font-semibold text-foreground">Heading 3</h3>
            <h4 className="text-xl font-semibold text-foreground">Heading 4</h4>
            <p className="text-base text-foreground">
              This is regular body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-sm text-muted-foreground">
              This is secondary text with muted colors for less emphasis.
            </p>
            <p className="text-xs text-muted-foreground">
              Small text for captions and fine print.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}