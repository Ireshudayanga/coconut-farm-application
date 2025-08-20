import { FaGithub, FaFacebookSquare, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        
        {/* Left Side */}
        <div className="text-center sm:text-left">
          <p>© {new Date().getFullYear()} TreeFarm Management</p>
          <p className="text-xs text-gray-500">All rights reserved.</p>
        </div>

        {/* Center */}
        <div className="text-center hidden sm:block">
          <p>
            Built with 🌿 <span className="font-semibold text-white">Next.js</span>
          </p>
        </div>

        {/* Right Side - Developer Links */}
        <div className="flex flex-col items-center sm:items-end gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Developer</span>
          <div className="flex gap-4 mt-1">
            <a
              href="https://github.com/Ireshudayanga"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="GitHub"
              title="GitHub"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://www.facebook.com/share/16E1rjrrCZ/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="Facebook"
              title="Facebook"
            >
              <FaFacebookSquare size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/iresh-udayanga"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Centered Tech Tag */}
      <div className="mt-4 text-center sm:hidden text-xs text-gray-500">
        Built with 🌿 Next.js
      </div>
    </footer>
  );
};

export default Footer;
