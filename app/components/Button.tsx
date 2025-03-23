import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
      danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };
    
    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    
    const disabledStyles = "opacity-50 cursor-not-allowed";
    
    const buttonStyles = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${disabled || isLoading ? disabledStyles : ""}
      ${className}
    `;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "google" | "facebook" | "twitter" | "github";
  children: React.ReactNode;
}

export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  (
    {
      type = "button",
      className = "",
      provider,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50";
    
    const providerStyles = {
      google: "hover:text-red-500 focus:ring-red-500",
      facebook: "hover:text-blue-500 focus:ring-blue-500",
      twitter: "hover:text-blue-400 focus:ring-blue-400",
      github: "hover:text-gray-900 focus:ring-gray-900",
    };
    
    const buttonStyles = `
      ${baseStyles}
      ${providerStyles[provider]}
      ${className}
    `;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SocialButton.displayName = "SocialButton";
