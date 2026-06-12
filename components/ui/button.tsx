import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    let variantClasses = ""
    switch (variant) {
      case "primary":
        variantClasses = "bg-button-bg text-button-text hover:bg-button-hover font-medium"
        break
      case "secondary":
        variantClasses = "bg-surface border border-border text-text-primary"
        break
      case "ghost":
        variantClasses = "bg-transparent text-text-secondary hover:bg-surface-secondary"
        break
    }
    
    return (
      <button
        ref={ref}
        className={`rounded-md px-4 py-2 flex items-center justify-center transition-colors text-[14px] ${variantClasses} ${className || ""}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
