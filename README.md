# nest_microservice
참고 : https://levelup.gitconnected.com/nestjs-microservices-with-grpc-api-gateway-and-authentication-part-1-2-650009c03686

## Logic
![image](https://user-images.githubusercontent.com/41901043/170220843-dc69d3a4-229b-44dc-b931-cbe1bb7d8f75.png)  

**Product** : Product SVC (gRPC) port:50053  
**Order** : Order SVC (gRPC) port:50052  
**Auth** :  Authentication SVC (gRPC) port:50051  
**API Gateway** : API Gateway (HTTP) port:3000  

proto : Shared Proto Repository  


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




### Product
```
curl -X POST http://localhost:3000/product -H "Content-Type: application/json" -d '{"name": "Test A", "sku": "A00001", "price": 100, "stock": 5}'
```
1. API Gateway에서 /product 엔드포인트로 http 접근, 이때 UseGuard 데코레이터를 통해 AuthGuard의 canActivate가 수행된다. (canActivate 함수의 파라미터로 ExecutionContext를 받아 사용자가 요청한 request데이터와 context를 알 수 있고, 사용자가 가지고 있는 jwt토큰을 가지고 토큰이 유효한지 확인한다. 에러가 날 경우 UnauthroizedException을 던짐)
2. .proto를 사용한 grpc통신 방식으로 ProductServiceClient의 createProduct를 호출, Product-Service서버에 정보 전달(이때 파라미터는 HTTP측은 CreateProductRequest 타입으로, .proto에 의해 생겨난 인터페이스다.)
3. Product-Service 서버의 컨트롤러에서 @GrpcMethod 데코레이터를 사용해 게이트웨이 측의 통신 요청을 인식함(payload로 받은 파라미터는 DTO 객체로 파라미터가 유효한지 확인한다)
4. Product-Service에서 createProduct() 함수 호출, Product 데이터를 저장한다
