# 자만추 Mobile Deployment

## 현재 배포 형태

자만추는 Vite 웹앱과 Express API 서버로 구성되어 있다. 이번 단계에서는 앱스토어 심사 없이 바로 배포 가능한 설치형 PWA로 모바일 앱 배포 준비를 완료한다.

사용자는 HTTPS로 배포된 URL을 모바일 브라우저에서 열고 홈 화면에 추가하면 전체 화면 앱처럼 사용할 수 있다.

## PWA 배포 체크리스트

1. 프로덕션 빌드

   ```bash
   corepack pnpm run build
   ```

2. Node 서버 실행

   ```bash
   NODE_ENV=production PORT=3000 node dist/index.js
   ```

3. HTTPS 도메인에 연결

   PWA 설치와 서비스 워커는 HTTPS에서 동작한다. 로컬 테스트의 `localhost`는 예외지만, 실제 모바일 설치 테스트는 HTTPS 도메인에서 확인해야 한다.

4. 모바일 설치 확인
   - Android Chrome: URL 접속 후 브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가
   - iPhone Safari: 공유 버튼에서 홈 화면에 추가

## 스토어 배포로 전환할 때

스토어 배포에는 개발자 계정과 서명 정보가 필요하다.

- Android: Google Play Console 계정, 패키지명, 앱 서명 키, 개인정보처리방침 URL
- iOS: Apple Developer 계정, Bundle ID, 인증서/프로비저닝 프로파일, App Privacy 응답

실제 스토어 출시가 필요하면 현재 PWA URL을 기준으로 Capacitor 또는 Android TWA 래퍼를 붙이는 것이 가장 빠르다. 이때도 앱 이름, 아이콘, 스플래시, 딥링크, 개인정보처리방침은 지금 추가한 PWA 메타데이터를 기준으로 재사용할 수 있다.
