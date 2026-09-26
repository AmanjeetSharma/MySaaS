import { Link } from 'react-router-dom';

export const HomeFooter = () => {
    return (
        <footer className="w-full py-10 px-4 sm:px-6 md:px-12 border-t border-border bg-background/95 backdrop-blur-md relative z-20 text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <span>&copy; {new Date().getFullYear()} miniCRM (v1.0.0). All rights reserved.</span>
                </div>
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="text-border">•</span>
                    <Link to="/signin" className="hover:text-foreground transition-colors">Sign In</Link>
                    <span className="text-border">•</span>
                    <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;