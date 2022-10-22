# Twitter-NextJS

A simplified version of a famous social network. 
This is an improved version of my previous 
[twitter clone project](https://github.com/iaminsleep/twitter-php) which I made a year ago, 
but with absolutely new techonologies, features and overall complexity.

## Technologies

- Next.JS
- PostgreSQL
- Typescript
- GraphQL
- Chakra UI
- TypeORM
- Apollo
- Redis
- URQL

## How to run

#### 1) Download dependencies

Open the console and type commands in the following order:
```
yarn install-main
```
Then download dependencies for the server:
```
yarn install-server
```
And client:
```
yarn install-client
```
#### 2) Run a migration

Run migration to generate tables, constraints and mock data for testing to appear (only once, no more times needed). 
If you don't need mock data, you can skip this step because next step will automatically generate tables for you.
```
yarn migrate
```

#### 3) Start server and client

This command you need to type each time you want to develop the project. Basically, this command makes everything work.
```
yarn dev
```
