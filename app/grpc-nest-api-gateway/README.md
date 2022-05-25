## Installing Dependencies
```
npm i @nestjs/microservices @grpc/grpc-js @grpc/proto-loader
npm i -D @types/node ts-proto
```

## Project Structure
```
nest g mo auth && nest g co auth --no-spec && nest g s auth --no-spec
nest g mo product && nest g co product --no-spec
nest g mo order && nest g co order --no-spec
touch src/auth/auth.guard.ts
```