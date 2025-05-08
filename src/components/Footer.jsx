const Footer = () => {
    return (
      <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center sm:text-left">
            © {new Date().getFullYear()} TreeFarm Management. All rights reserved.
          </p>
          <p className="text-sm text-center sm:text-right">
            Built with 🌿 Next.js
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  