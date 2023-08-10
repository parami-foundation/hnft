import React from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';
import UserLogin from '../../components/UserLogin/UserLogin';

export interface TestPageProps { }

function TestPage({ }: TestPageProps) {
    return <>
        <DynamicContextProvider
            settings={{
                environmentId: '6b6e3b91-f00e-4339-b1a4-a589ae64291b',
            }}>
            <div className='test-container'>
                <div className='hnft-container'>
                    <UserLogin />
                </div>
            </div>
        </DynamicContextProvider>
    </>;
};

export default TestPage;
