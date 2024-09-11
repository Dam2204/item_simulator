1. **암호화 방식**

   Q1. 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?
   A1. 복호화가 불가능하며, 암호화만 가능한 단방향 암호화 방식입니다.

   Q2. 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?
   A2. 외부의 공격으로부터 비교적 안전하게 보관할 수 있습니다.

2. **인증 방식**
   Q1. JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?
   A1. Access Token의 탈취 여부는 서버에서 확인할 수 없으며, 강제로 만료시킬 수도 없습니다.

   Q2. 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?
   A2. Access Token이 사용자 인증에 필요한 모든 정보를 가지고 있는 토큰인 만큼, 서버에서 제어 가능한 Refresh Token을 통해 Access Token을 발급하는 등 탈취된 토큰이 사용될 수 있는 기간을 줄여 피해를 최소화할 수 있습니다.

3. **인증과 인가**
   Q1. 인증과 인가가 무엇인지 각각 설명해 주세요.
   A1. 인증은 서비스를 이용하려는 사용자가 인증된 신분을 가진 사람이 맞는지 검증하는 작업을 말하며, 일반적인 사이트의 로그인 기능에 해당합니다. 인가는 이미 인증된 사용자가 특정 리소스에 접근하거나 특정 작업을 수행할 수 있는 권한이 있는지를 검증하는 작업을 말하며, 로그인 된 사용자만 게시글을 작성할 수 있는지 검증하는 것을 예로 들 수 있습니다.

   Q2. 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요?
   A2. 민감한 정보 여부, 소유권 및 밸런싱에 끼치는 영향 등에서 차이가 있다고 생각합니다. 검증되지 않은 사람들이 모든 데이터를 조회하거나 수정할 수 있다면, 통장의 비밀번호와 잔액이 누구나 볼 수 있도록 전시된 것과 다름이 없습니다.

   Q3. 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?
   A3. 아이템은 곧 게임의 밸런싱과 직결됩니다. 파멸의 반지가 power 20 의 일반적인 아이템이었는데, 갑자기 그 아이템을 사용하던 사람이 수치를 100으로 올린다면 전투 밸런싱이 무너지거나 관련 아이템들의 가격들이 요동치게 되는 등 게임 내 다양한 생태계가 무너지게 됩니다.

4. **Http Status Code**
   Q1. 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.
   A1. (200): 요청을 서버가 성공적으로 처리함. / (201): 요청이 처리되어, 새로은 리소스가 생성됨. / (400): 잘못된 요청. / (401): 권한 없음. / (404): Not found. / (409): 이미 존재하는 데이터와 충돌함. / (500): 예상치 못한 오류.

5. **게임 경제**
   Q1. 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.

   q1. 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요?
   a1. money 컬럼처럼 변동 주기와 폭이 크고 성격이 다른 데이터가 캐릭터 테이블에 있다는 것은 서버를 불필요하게 혹사시키기 좋은 방법이 아닌가 싶습니다. 캐릭터의 소지 금액이 달라질 때마다 불필요한 캐릭터의 이름과 스탯을 불러와야 하는 단점이 있습니다. RDB인 만큼 이벤트 코인 등 신규 재화가 필요할 때 추가하는 과정도 쉽지 않습니다.

   q2. 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요?
   a2. 재화와 관련된 별도의 테이틀을 구성하여 연결하는 것이 좋을 것 같습니다.

   Q2. 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?
   A2. 드랍률이 낮거나, 고가의 가치를 가진 아이템들을 1원에 구매하려고 시도하는 등 각 아이템에 적절한 가치가 부여되지 않아 게임 내 경제가 무너지거나 형성되기 어렵습니다.
