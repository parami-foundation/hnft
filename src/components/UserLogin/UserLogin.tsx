import { Button } from 'antd';
import React, { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import jwt_decode from "jwt-decode";

export interface UserLoginProps { }

function UserLogin({ }: UserLoginProps) {
    const { authToken, setShowAuthFlow } = useDynamicContext();

    useEffect(() => {
        if (authToken) {
            const decoded = jwt_decode(authToken) as { exp: number };
            const current = (new Date().getTime()) / 1000;
            if (current > decoded.exp) {
                localStorage.removeItem('parami:jwt');
            } else {
                localStorage.setItem('parami:jwt', authToken);
                if (window.opener) {
                    window.opener.postMessage(`parami:jwt:update`, '*');
                }
                window.close();
            }
        } else {
            setShowAuthFlow(true);
        }
    }, [authToken, setShowAuthFlow])

    return <>
        {/* <div>
            AuthToken:
            {authToken}
        </div>
        <Button onClick={() => setShowAuthFlow(true)}>Show Auth Flow</Button> */}
    </>;
};

export default UserLogin;
