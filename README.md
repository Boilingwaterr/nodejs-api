# nodejs-api

## Scripts
Commands | Description |
--- | --- | 
npm run dev | runs app in development mode with nodemon |
npm run test | runs tests | 
npm run lint | runs linter and type checking | 

## CRUD
### Users
Endpoints | Methods | Description |
--- | --- | --- |
/users | GET | Request all users in bd. Optional query: limit, loginSubstring |
/users | POST | Create new user |
/users/:id | PUT | Update user |
/users/:id | GET | Request user by id |
/users/:id | DELETE | Delete user |
 ---
 ### Groups
 Endpoints | Methods | Description |
--- | --- | --- |
/groups | GET | Request all groups in bd |
/groups | POST | Create new group and assign group to users |
/groups/:id | PUT | Update group and assign group to users |
/groups/:id | GET | Request group by id |
/groups/:id | DELETE | Delete group |

 ---
 ### Authenticate
 Endpoints | Methods | Description |
--- | --- | --- |
/authenticate | POST | Сheck the username and password of the user and return the token |
