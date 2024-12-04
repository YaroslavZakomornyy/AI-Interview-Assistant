import redisClient from '#src/redis-client.js';

const getActiveInterview = async (userId) => {
    const MATCH_PATTERN = `interviews:${userId}:*`;
    const COUNT = 10;
    let cursor = '0';

    do
    {
        const reply = await redisClient.SCAN(cursor, {
            MATCH: MATCH_PATTERN,
            COUNT: COUNT,
        });

        // Update cursor for next iteration
        cursor = reply.cursor;

        // Extract keys from the current batch
        const keys = reply.keys;

        if (keys.length > 0)
        {
            // Since each userId can have only one or zero secretIds,
            // we can take the first matching key
            const interview = keys[0];

            // Extract the interviewId from the key
            const interviewId = interview.split(':')[2];

            // Retrieve the hash data
            const data = await redisClient.HGETALL(`interviews:${userId}:${interviewId}`);

            return {interviewId: interviewId, data: data };

        }
    } while (cursor !== '0'); // Continue until the entire keyspace is scanned

    // If no matching hash key is found
    return null;
}

export default{
    getActiveInterview
}