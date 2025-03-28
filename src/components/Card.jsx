import React from "react";

export const Card = ({ className = "", ...props }) => (
  <div
    className={`rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm ${className}`}
    {...props}
  />
);

export const CardHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-4 ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
);

export const CardDescription = ({ className = "", ...props }) => (
  <p className={`text-sm text-gray-400 ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }) => (
  <div className={`p-4 pt-0 ${className}`} {...props} />
);

export const CardFooter = ({ className = "", ...props }) => (
  <div className={`flex items-center p-4 pt-0 ${className}`} {...props} />
);
