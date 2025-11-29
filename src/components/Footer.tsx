import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/businesses" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Find Salons</Link></li>
                            <li><Link to="/register" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">For Business</Link></li>
                            <li><Link to="/login" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Help Center</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Contact Us</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Terms</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Social</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Instagram</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Twitter</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">Facebook</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 md:flex md:items-center md:justify-between">
                    <div className="flex space-x-6 md:order-2">
                        {/* Social icons could go here */}
                    </div>
                    <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
                        &copy; {new Date().getFullYear()} BeautySalon, Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
