import * as React from "react"
import { cn } from "@/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
    secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600 shadow-sm",
    outline: "text-gray-700 border-gray-300 bg-white hover:bg-gray-50 shadow-sm",
  }
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props} 
    />
  )
}

export { Badge }