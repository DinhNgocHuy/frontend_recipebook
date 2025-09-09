export function Card({ className = "", children }) { return <div className={`card ${className}`}>{children}</div>; }
export function CardHeader({ children, className = "" }) { return <div className={`border-b p-4 ${className}`}>{children}</div>; }
export function CardContent({ children, className = "" }) { return <div className={`p-4 ${className}`}>{children}</div>; }
export function CardFooter({ children, className = "" }) { return <div className={`border-t p-4 ${className}`}>{children}</div>; }
