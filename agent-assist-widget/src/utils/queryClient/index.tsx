import React from 'react';
import { QueryClient } from 'react-query';
import { get } from 'lodash-es';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // We don't add as config here cache:0 because on Safari & Firefox a bug happens
            // which fetches models infinite times
            refetchOnWindowFocus: false,
            retry: false,
            onError: (error: unknown) => {
                const message = get(error, 'response.data.error_message', (error as Error)?.message);
                const status = get(error, 'response.status', 400);

                console.log('Message: ', message);
                console.log('Status: ', status);
            },
        },
    },
});