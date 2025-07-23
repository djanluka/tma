# Answers

### What did you like about the task and what didn’t? Can we improve it and how?

I believe the task mirrors a real-world engineering scenario well, as it covers a broader problem context and subsequent solution implementation using documentation. It also allows engineers to design a PoC and, through comments, demonstrate their ability to extend the system further.

Potential improvement: The only challenge I encountered was understanding how `UserLimit.progress` should be calculated. To avoid ambiguity, I’d suggest clarifying this part in the task description.

### If you were asked to change it so the `UserLimit` entries are stored on a database with a primary goal to provide them back to the front-end for display, which one would you suggest and why? What sub-tasks you would see as a necessary if you were asked to write a story for such change?

I’d recommend `Redis` as a key-value store for this use case, primarily because it enables fast lookups by `UserLimit.userLimitId`.

If frontend needs complex queries and logic, the `MongoDB` can be good option (queries combine `userId`/`status`/`type`/`period` - see API questions below)
but if needs time-range historical queries, the `InfluxDB` (+`Grafana`) will be the right choice.

The important sub-tasks include `retry` policy when the event is not processed (not allow to skip event), `thundering herd` problem to database instance (rate-limit requests) and `failover` handling when instance is not available (serve stale cache for example).

### What you would suggest for an API to return this data to front-end for a user? What would be the API signature?

- Get user limit information: `/userlimit?userLimitId={userLimitId}`

- Get users infomation: `/userlimit/users/userId={userId}&{params}` (params are optional, e.g filter one user/just 'ACTIVE' users/just 'DEPOSIT' users/etc)

- Get 'historical' data for users: `/userlimit/history?timestamp={timestamp}&userId={userId}` (for some statistics/analyzes)

- *** Get progress data: `userlimit/progress/{params}` - progress is visible per `userId` in the database, but it might be useful to have progress statistics for all users or based on timestamps...

- *** Use `GraphQL` to provide clients ability to ask for exactly what they need and nothing more.

### How did/could you implement it so it’s possible to re-use it for other similar use cases?

The database interface `UserLimitRepository` ([see](https://github.com/djanluka/tma/blob/main/src/user_limit/repository/in_memory.ts#L4)) provides main functionalities `create/updateProgress/resetProgress` so any database instance can extend them. It provides totally re-usable `Template pattern`.

For an API implementation, again `Template pattern` + `Decorator pattern` can be used to implement basic functionalities + specific requirements per API.

One additional pattern could be usefull: `Facade pattern`.
The API managers map for `UserLimit` and similar events will be stored in the `Facade`. Each request will be routed to the right API manager based on the request url prefix.