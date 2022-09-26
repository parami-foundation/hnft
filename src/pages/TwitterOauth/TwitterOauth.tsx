import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface TwitterOauthProps { }

export function TwitterOauth({ }: TwitterOauthProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const oauthData = {
            oauth_token: searchParams.get('oauth_token'),
            oauth_verifier: searchParams.get('oauth_verifier')
        }
        window.opener.postMessage(oauthData, window.origin);
        window.close();
    }, [searchParams]);
    return <></>;
};
