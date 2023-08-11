import React from 'react';
import UserLogin from '../../components/UserLogin/UserLogin';

export interface TestPageProps { }

function TestPage({ }: TestPageProps) {
    return <>
        <div className='test-container'>
            <div className='hnft-container'>
                <UserLogin />
            </div>
        </div>
    </>;
};

export default TestPage;
