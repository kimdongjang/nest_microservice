# nest_microservice
참고 : https://levelup.gitconnected.com/nestjs-microservices-with-grpc-api-gateway-and-authentication-part-1-2-650009c03686

## Logic
![image](https://user-images.githubusercontent.com/41901043/170220843-dc69d3a4-229b-44dc-b931-cbe1bb7d8f75.png)  

**Product** : Product SVC (gRPC)  
**Order** : Order SVC (gRPC)   
**Auth** :  Authentication SVC (gRPC)  
**API Gateway** : API Gateway (HTTP)  

proto : Shared Proto Repository  



## Register  
```
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email": "elon@gmail.com", "password": "12345678"}'
```
1. API Gateway에서 /auth/Register 엔드포인트로 http 접근
2. .proto를 사용한 grpc통신 방식으로 AuthServiceClient의 register를 호출, Auth-Service서버에 정보 전달
3. Auth-Service 서버측에서 @GrpcMethod 데코레이터를 사용해 게이트웨이 측의 통신 요청을 인식함
4. Auth-Service 서버에서 auth.service.ts 내부의 register() 함수 호출
5. 

