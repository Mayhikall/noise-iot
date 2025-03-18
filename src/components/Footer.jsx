import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-400 text-sm p-4 border-t border-gray-700 w-full">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div>
          Developed by <a href="https://keycloud.id" className="text-blue-400 hover:text-blue-300">keycloud.id</a>
        </div>
        <div>
          &copy; {currentYear} Duo Master. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;