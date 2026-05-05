import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTripadvisor, FaTiktok, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-black text-white py-8 px-4 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="text-sm font-semibold tracking-wider">
                    El Zarape © 2026
                </div>

                <nav className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[10px] md:text-xs font-medium uppercase tracking-widest text-gray-300">
                    <Link href="/billing" className="hover:text-white transition-colors">Billing</Link>
                            <span className="text-gray-600 text-[8px]">•</span>
                    
                    <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <span className="text-gray-600 text-[8px]">•</span>
                    
                    <Link href="/work-with-us" className="hover:text-white transition-colors">Work with us</Link>
                            <span className="text-gray-600 text-[8px]">•</span>
                    
                    <Link href="/grupo-andersons" className="hover:text-white transition-colors">Grupo Anderson's</Link>
                            <span className="text-gray-600 text-[8px]">•</span>
                    
                    <Link href="/promotions" className="hover:text-white transition-colors">Promotions</Link>
                </nav>

               
                <div className="flex items-center gap-5">
                   
                    <Link href="#" aria-label="Facebook" className="hover:opacity-70 transition-opacity">
                        <FaFacebookF size={18} />
                    </Link>

                    <Link href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                        <FaInstagram size={18} />
                    </Link>
                    
                    <Link href="#" aria-label="Tripadvisor" className="hover:opacity-70 transition-opacity">
                        <FaTripadvisor size={20} />
                    </Link>
                    
                    <Link href="#" aria-label="TikTok" className="hover:opacity-70 transition-opacity">
                        <FaTiktok size={18} />
                    </Link>
                    
                    <Link href="#" aria-label="YouTube" className="hover:opacity-70 transition-opacity">
                        <FaYoutube size={18} />
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;