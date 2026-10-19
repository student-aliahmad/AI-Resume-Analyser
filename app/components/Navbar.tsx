import {Link} from "react-router";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  return (
    <nav className="navbar flex items-center jusify-between p-4">
        <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
        </Link>

        <div className="flex items-center gap-4">
          {/* jab user logout ho */}
          <SignedOut>
            <SignInButton mode="modal">
                <button className="primary-button w-fit cursor-pointer">
                   Sign In
                </button>
            </SignInButton>
          </SignedOut>

          {/* jab user login ho */}
          <SignedIn>
             <Link to="/upload" className="primary-button w-fit">
        Upload Resume
        </Link>
        <UserButton showName={false} />
          </SignedIn>
        </div> 
    </nav>
  );
}

export default Navbar;
