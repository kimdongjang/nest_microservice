# nest_microservice
참고 : https://levelup.gitconnected.com/nestjs-microservices-with-grpc-api-gateway-and-authentication-part-1-2-650009c03686

## Logic
![image](https://user-images.githubusercontent.com/41901043/170220843-dc69d3a4-229b-44dc-b931-cbe1bb7d8f75.png)  

**Product** : Product SVC (gRPC) port:50053  
**Order** : Order SVC (gRPC) port:50052  
**Auth** :  Authentication SVC (gRPC) port:50051  
**API Gateway** : API Gateway (HTTP) port:3000  

proto : Shared Proto Repository  


## 역할
**API Gateway** : 외부로 노출되어 있는 서비스. 사용자가 이용할 수 있는 모든 서비스에 대해 Validate하고 서비스를 실행하는 주체로 요청을 전달하며, 결과값을 리턴해준다.  
**Auth** : 회원가입, 로그인 시 jwt토큰을 발급해줌. jwt토큰이 유효한지 확인하는 서비스를 제공.  
**Product** : 상품 생성과 상품 검색 기능을 제공  
**Order** : 주문을 생성  
  

## 통신
### gRPC 로직
1. .proto에 Route Handler에 요청할 Request, 각 서비스에서 처리 후 반환할 Response를 정의
```js
// Register
message RegisterRequest {
  string email = 1;
  string password = 2;
}

message RegisterResponse {
  int32 status = 1;
  repeated string error = 2;
}
```
2. gRPC를 통해 서비스할 서비스를 rpc 타입으로 정의(package는 auth, order, product 등으로 정의)
```js
service AuthService {
  rpc Register (RegisterRequest) returns (RegisterResponse) {}
  rpc Login (LoginRequest) returns (LoginResponse) {}
  rpc Validate (ValidateRequest) returns (ValidateResponse) {}
}
```
3. protoc로 컴파일해서 각 서비스에 .proto 파일을 auth.pb.ts로 생성
4. Api gateway에서 auth.pb.ts에 생성된 AuthServiceClient를 ```onModuleInit()```에서 초기화함.
```js
export class AuthController implements OnModuleInit {
  private svc: AuthServiceClient;
  @Inject(AUTH_SERVICE_NAME)
  private readonly client: ClientGrpc;

  onModuleInit(): void {
    this.svc = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }
}
```
5. Api gateway에서 gRPC에서 정의한 각 서비스를 호출하면 gRPC와 연결된 서비스로 요청이 전달되며 gRPC 서비스 측에서는 ```@GrpcMethod()```데코레이터를 통해 전달된 요청을 받는다. 후에 service측에서 서비스를 처리하고 gRPC에서 정의한 response를 돌려준다.  
  





## 기능
### Register  
```
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email": "elon@gmail.com", "password": "12345678"}'
```
1. API Gateway에서 /auth/Register 엔드포인트로 http 접근
2. .proto를 사용한 grpc통신 방식으로 AuthServiceClient의 register를 호출, Auth-Service서버에 정보 전달(이때 파라미터는 HTTP측은 RegisterRequest 타입으로, .proto에 의해 생겨난 인터페이스다.(email, password))
3. Auth-Service 서버의 컨트롤러에서 @GrpcMethod 데코레이터를 사용해 게이트웨이 측의 통신 요청을 인식함(payload로 받은 파라미터는 DTO 객체로 email, password가 유효한지 확인한다)
4. Auth-Service 서버에서 auth.service.ts 내부의 register() 함수 호출, 중복된 이메일이 있는지 확인하고 패스워드를 인코딩, 유저 정보를 저장, HttpStatus 결과 리턴  
#### Login, Validate 기능 모두 동일한 로직으로 작동한다.  


### AuthGuard
1. api gateway 측에서 정의한다. 회원가입과 같은 Auth 서비스의 기능을 제외하고 Product, Order와 같이 로그인을 한 이후에 이용할 수 있는 기능들에 대해 사용자가 요청을 할 경우 요청한 주체가 검증된 주체인지 확인한다.  
2. Auth Guard는 canActive 인터페이스를 구현하여 jwt토큰을 검증하는데, Auth Service에서 구현한 jwtService를 이용해 validate하고 결과를 ValidateResponse로 받아 리턴한다.   



### Product
```
curl -X POST http://localhost:3000/product -H "Content-Type: application/json" -d '{"name": "Test A", "sku": "A00001", "price": 100, "stock": 5}'
```
1. API Gateway에서 /product 엔드포인트로 http 접근, 이때 UseGuard 데코레이터를 통해 AuthGuard의 canActivate가 수행된다. (canActivate 함수의 파라미터로 ExecutionContext를 받아 사용자가 요청한 request데이터와 context를 알 수 있고, 사용자가 가지고 있는 jwt토큰을 가지고 토큰이 유효한지 확인한다. 에러가 날 경우 UnauthroizedException을 던짐)
2. .proto를 사용한 grpc통신 방식으로 ProductServiceClient의 createProduct를 호출, Product-Service서버에 정보 전달(이때 파라미터는 HTTP측은 CreateProductRequest 타입으로, .proto에 의해 생겨난 인터페이스다.)
3. Product-Service 서버의 컨트롤러에서 @GrpcMethod 데코레이터를 사용해 게이트웨이 측의 통신 요청을 인식함(payload로 받은 파라미터는 DTO 객체로 파라미터가 유효한지 확인한다)
4. Product-Service에서 createProduct() 함수 호출, Product 데이터를 저장한다


### Order
```
curl -X POST http://localhost:3000/order -H "Content-Type: application/json" -d '{"productId": 1, "quantity": 1}'
```
