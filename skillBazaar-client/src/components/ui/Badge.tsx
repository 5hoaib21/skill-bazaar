interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const variants = {
  default: "bg-charcoal/10 text-charcoal",
  success: "bg-green-100 text-green-800",
  warning: "bg-warm-amber/20 text-warm-amber",
  error: "bg-red-100 text-red-800",
  info: "bg-deep-teal/10 text-deep-teal",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
