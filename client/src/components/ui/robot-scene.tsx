'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Link } from "wouter";
import { Button } from "@/components/ui/button"
 
export function RobotScene() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
        size={300}
      />
      
      <div className="flex h-full flex-col md:flex-row">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Discover Amazing Events
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Browse upcoming workshops, conferences, and hackathons. Join the tech community and expand your network.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/upcoming-events">
              <Button variant="secondary" className="w-full sm:w-auto">
                Browse Events
              </Button>
            </Link>
            <Button className="w-full sm:w-auto">
              Create Account
            </Button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative md:h-auto h-[250px]">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
} 