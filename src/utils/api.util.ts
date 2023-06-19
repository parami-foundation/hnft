import { PARAMI_SUBQUERY } from "../models/hnft";

const IM_SUBQUERY = process.env.REACT_APP_IM_SUBQUERY_ENDPOINT as string;

const ONE_HOUR = 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * ONE_HOUR;

export const getSigExpirationTime = () => {
  return Date.now() + ONE_WEEK;
}

export const generateSignedMessage = (address: string, expire: number): string => {
  return `${address},${expire}`;
};

export const fetchWithAuthorization = async (input: RequestInfo | URL, init?: RequestInit) => {
  const authorization = localStorage.getItem('authorization') as string;

  if (!authorization) {
    return;
  }

  const options = init ?? {};
  return fetch(input, {
    ...options,
    headers: {
      ...options.headers,
      authorization
    }
  })
}

// export const fetchWithCredentials = async (input: RequestInfo | URL, init?: RequestInit) => {
//   const authcookiebytwitter = localStorage.getItem('authcookiebytwitter') as string;
//   const expiretime = localStorage.getItem('expiretime') as string;
//   const userid = localStorage.getItem('userid') as string;

//   if (!authcookiebytwitter || !expiretime || !userid) {
//     return;
//   }

//   const options = init ?? {};
//   return fetch(input, {
//     ...options,
//     // credentials: 'same-origin',
//     headers: {
//       ...options.headers,
//       authcookiebytwitter,
//       expiretime,
//       userid,
//     }
//   })
// }

// export const doGraghQueryParami = async (query: string) => {
//   const obj: any = {};
//   obj.operationName = null;
//   obj.variables = {};
//   obj.query = query;
//   return fetch(PARAMI_SUBQUERY, {
//     "headers": {
//       "content-type": "application/json",
//     },
//     "body": JSON.stringify(obj),
//     "method": "POST"
//   });
// };

// todo: remove address
// export const doGraghQueryIM = async (query: string, address: string) => {
//   const obj: any = {};
//   obj.operationName = null;
//   obj.variables = {};
//   obj.query = query;
//   return fetchWithCredentials(IM_SUBQUERY, {
//     "headers": {
//       "content-type": "application/json",
//     },
//     "body": JSON.stringify(obj),
//     "method": "POST"
//   });
// };
