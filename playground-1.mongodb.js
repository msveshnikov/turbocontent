/* eslint-disable react-hooks/rules-of-hooks */
/* global use, db */

use('turbocontent');

db.users.updateOne(
    { email: 'msveshnikov@gmail.com' },
    {
        $set: {
            isAdmin: true,
            subscriptionStatus: 'active',
            role: 'admin'
        }
    },
    { upsert: true }
);
