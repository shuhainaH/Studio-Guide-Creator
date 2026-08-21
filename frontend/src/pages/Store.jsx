import { useState, useEffect } from 'react';
import { ShoppingCart, Coins, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Store = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    const [packages, setPackages] = useState([]);
    
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/store/packages/');
                const data = await res.json();
                setPackages(data);
            } catch (e) {
                console.error("Failed to fetch packages", e);
            }
        };
        fetchPackages();
    }, []);

    const handleCheckout = async (packageId) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:8000/api/create-checkout-session/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ package_id: packageId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error creating checkout session.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to checkout.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-brown-900 flex items-center justify-center gap-3">
                    <ShoppingCart className="w-10 h-10 text-terracotta" />
                    BOINK Store
                </h1>
                <p className="text-brown-600 mt-4 font-medium">Purchase virtual currency to unlock exclusive Creator assets.</p>
            </div>

            {success && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                        <h4 className="font-bold">Payment Successful!</h4>
                        <p className="text-sm">500 Boink Coins have been added to your account.</p>
                    </div>
                </div>
            )}

            {canceled && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                    <XCircle className="w-6 h-6" />
                    <div>
                        <h4 className="font-bold">Payment Canceled</h4>
                        <p className="text-sm">Your transaction was not completed. You have not been charged.</p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.length > 0 ? (
                    packages.map((pkg, index) => (
                        <div key={pkg.id} className="bg-white rounded-2xl p-8 border-2 border-beige-sand hover:border-terracotta transition-all shadow-xl shadow-brown-900/5 relative overflow-hidden group">
                            {index === 0 && <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>}
                            <div className="w-16 h-16 bg-cream-warm rounded-full flex items-center justify-center mb-6">
                                <Coins className="w-8 h-8 text-terracotta" />
                            </div>
                            <h3 className="text-2xl font-black text-brown-900 mb-2">{pkg.name}</h3>
                            <p className="text-brown-500 text-sm mb-6">{pkg.description}</p>
                            <div className="mb-8">
                                <span className="text-4xl font-black text-brown-900">${pkg.price_usd}</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-brown-800 font-medium">
                                    <CheckCircle className="w-4 h-4 text-terracotta mr-2" /> {pkg.coin_amount} Boink Coins
                                </li>
                            </ul>
                            <button 
                                onClick={() => handleCheckout(pkg.id)}
                                disabled={isLoading}
                                className="w-full bg-brown-900 hover:bg-terracotta text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Buy Now'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-brown-500">
                        No packages available in the store right now.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Store;
