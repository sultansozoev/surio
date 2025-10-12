import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: 'Società',
            links: [
                { label: 'Chi siamo', href: '#' },
                { label: 'Lavora con noi', href: '#' },
                { label: 'Stampa', href: '#' },
            ]
        },
        {
            title: 'Assistenza',
            links: [
                { label: 'Centro assistenza', href: '#' },
                { label: 'FAQ', href: '#' },
                { label: 'Account', href: '#' },
            ]
        },
        {
            title: 'Legale',
            links: [
                { label: 'Privacy', href: '#' },
                { label: 'Termini di servizio', href: '#' },
                { label: 'Cookie', href: '#' },
            ]
        },
    ];

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    return (
        <footer className="bg-dark border-t border-gray-800 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Social Links */}
                <div className="flex justify-center space-x-6 mb-8">
                    {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.label}
                                href={social.href}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label={social.label}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icon size={24} />
                            </a>
                        );
                    })}
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-white font-semibold mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}


                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-8">
                    {/* Copyright */}
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Surio. Tutti i diritti riservati.
                        </p>

                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Informativa sulla privacy
                            </Link>
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Termini di utilizzo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;