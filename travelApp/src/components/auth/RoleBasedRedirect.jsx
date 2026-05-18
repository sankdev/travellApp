import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectBasedOnRole = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user) {
                navigate('/login');
                return;
            }

            // Redirection basée sur le rôle
            switch (user.role) {
                case 'agency':
                    navigate('/agency/dashboard');
                    break;
                case 'customer':
                    navigate('/customer/dashboard');
                    break;
                default:
                    navigate('/login');
            }
        };

        redirectBasedOnRole();
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
    );
};

export default RoleBasedRedirect;
